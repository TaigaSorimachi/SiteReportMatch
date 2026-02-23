import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * LINE LIFF ログイン
   * LINE アクセストークンを検証し、ユーザーを検索または作成してJWTを返す
   */
  async lineLogin(liffAccessToken: string) {
    const profile = await this.verifyLineToken(liffAccessToken);

    let user = await this.prisma.user.findUnique({
      where: { lineUserId: profile.userId },
      include: { company: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          lineUserId: profile.userId,
          lineDisplayName: profile.displayName,
          avatarUrl: profile.pictureUrl ?? null,
          lastName: profile.displayName,
          firstName: '',
          role: 'worker',
          availability: 'available',
          employmentStatus: 'active',
        },
        include: { company: true },
      });
      this.logger.log(`New user created via LINE login: ${user.id}`);
    } else {
      if (user.isDeleted) {
        throw new UnauthorizedException('このアカウントは無効化されています');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lineDisplayName: profile.displayName,
          avatarUrl: profile.pictureUrl ?? user.avatarUrl,
          lastLoginAt: new Date(),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * リフレッシュトークンでアクセストークンを再発行
   */
  async refreshToken(token: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('無効なリフレッシュトークンです');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('無効なトークンタイプです');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    const tokens = await this.generateTokens(user.id, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },
        workerProfile: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    return user;
  }

  /**
   * 管理者ログイン (メール+パスワード)
   */
  async adminLogin(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: { company: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('管理画面へのアクセス権がありません');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * パスワードを設定 (ハッシュ化して保存)
   */
  async setPassword(userId: string, password: string) {
    const hash = await bcrypt.hash(password, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
  }

  /**
   * 開発用ログイン (APP_ENV=development のみ)
   */
  async devLogin(identifier: string) {
    const appEnv = process.env.APP_ENV || 'production';
    if (appEnv !== 'development') {
      throw new ForbiddenException('開発用ログインは開発環境でのみ利用可能です');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { lineUserId: identifier },
          { email: identifier },
        ],
      },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException(
        `ユーザーが見つかりません: ${identifier}`,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * LINE アクセストークンを検証してプロフィールを取得
   */
  private async verifyLineToken(accessToken: string): Promise<LineProfile> {
    const url = 'https://api.line.me/v2/profile';
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      this.logger.error('LINE API call failed', error);
      throw new UnauthorizedException('LINE APIへの接続に失敗しました');
    }

    if (!response.ok) {
      this.logger.warn(`LINE token verification failed: ${response.status}`);
      throw new UnauthorizedException('無効なLINEアクセストークンです');
    }

    const profile = (await response.json()) as LineProfile;

    if (!profile.userId) {
      throw new UnauthorizedException('LINE プロフィールの取得に失敗しました');
    }

    return profile;
  }

  /**
   * アクセストークンとリフレッシュトークンを生成
   */
  private async generateTokens(
    userId: string,
    role: string,
    companyId: string | null,
  ) {
    const accessTokenPayload = {
      sub: userId,
      role,
      companyId: companyId ?? '',
      type: 'access',
    };

    const refreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, { expiresIn: '1h' }),
      this.jwtService.signAsync(refreshTokenPayload, { expiresIn: '30d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
