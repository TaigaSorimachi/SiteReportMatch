import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LineLoginDto, RefreshTokenDto, DevLoginDto, AdminLoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('line/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'LINE LIFF ログイン' })
  @ApiResponse({ status: 200, description: 'ログイン成功' })
  @ApiResponse({ status: 401, description: '無効なLINEトークン' })
  async lineLogin(@Body() dto: LineLoginDto) {
    return this.authService.lineLogin(dto.liffAccessToken);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'トークンリフレッシュ' })
  @ApiResponse({ status: 200, description: '新しいトークンを発行' })
  @ApiResponse({ status: 401, description: '無効なリフレッシュトークン' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '現在のユーザー情報を取得' })
  @ApiResponse({ status: 200, description: 'ユーザー情報' })
  @ApiResponse({ status: 401, description: '未認証' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('admin/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理者ログイン（メール+パスワード）' })
  @ApiResponse({ status: 200, description: 'ログイン成功' })
  @ApiResponse({ status: 401, description: '認証失敗' })
  @ApiResponse({ status: 403, description: '管理者権限なし' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.email, dto.password);
  }

  @Post('dev/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '開発用ログイン（development環境のみ）' })
  @ApiResponse({ status: 200, description: 'ログイン成功' })
  @ApiResponse({ status: 403, description: '開発環境以外では利用不可' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto.identifier);
  }
}
