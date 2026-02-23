import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ユーザーを作成
   */
  async create(dto: CreateUserDto) {
    // オーナーと会社の1:1制約チェック
    if (dto.role === 'owner' && dto.companyId) {
      const existingOwner = await this.prisma.user.findFirst({
        where: {
          companyId: dto.companyId,
          role: 'owner',
          isDeleted: false,
        },
      });
      if (existingOwner) {
        throw new ConflictException(
          'この会社には既にオーナーアカウントが存在します',
        );
      }
    }

    try {
      const { password, ...rest } = dto;
      const data: Record<string, unknown> = { ...rest };

      if (dto.birthDate) {
        data.birthDate = new Date(dto.birthDate);
      }

      if (password) {
        data.passwordHash = await bcrypt.hash(password, 12);
      }

      const user = await this.prisma.user.create({
        data: data as Parameters<typeof this.prisma.user.create>[0]['data'],
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companyType: true,
            },
          },
        },
      });

      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'LINE User ID が既に登録されています',
        );
      }
      throw error;
    }
  }

  /**
   * ページネーション付きユーザー一覧取得
   */
  async findAll(query: SearchUserDto) {
    const { page = 1, limit = 20, sort, role, availability, companyId, keyword } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (role) {
      where.role = role;
    }

    if (availability) {
      where.availability = availability;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (keyword) {
      where.OR = [
        { lastName: { contains: keyword, mode: 'insensitive' } },
        { firstName: { contains: keyword, mode: 'insensitive' } },
        { lastNameKana: { contains: keyword, mode: 'insensitive' } },
        { firstNameKana: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.parseSort(sort);

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companyType: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /**
   * ユーザー詳細取得（workerProfile含む）
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException(`ユーザーが見つかりません: ${id}`);
    }

    return user;
  }

  /**
   * ユーザー更新
   */
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    try {
      const data: Record<string, unknown> = { ...dto };

      if (dto.birthDate) {
        data.birthDate = new Date(dto.birthDate);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: data as Parameters<typeof this.prisma.user.update>[0]['data'],
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

      return user;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'LINE User ID が既に登録されています',
        );
      }
      throw error;
    }
  }

  /**
   * ユーザーソフトデリート
   */
  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    this.logger.log(`User soft-deleted: ${id} by user: ${userId}`);
    return { message: 'ユーザーを削除しました' };
  }

  /**
   * 稼働状況を更新
   */
  async updateAvailability(id: string, availability: string) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { availability },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },
      },
    });

    this.logger.log(`User availability updated: ${id} -> ${availability}`);
    return user;
  }

  /**
   * ソート文字列をPrisma orderByオブジェクトに変換
   */
  private parseSort(sort?: string): Record<string, string> {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    const [field, direction] = sort.split(':');
    const allowedFields = [
      'lastName',
      'firstName',
      'role',
      'availability',
      'createdAt',
      'updatedAt',
    ];

    if (!allowedFields.includes(field)) {
      return { createdAt: 'desc' };
    }

    return { [field]: direction === 'asc' ? 'asc' : 'desc' };
  }
}
