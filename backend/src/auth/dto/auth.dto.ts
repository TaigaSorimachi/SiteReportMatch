import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LineLoginDto {
  @ApiProperty({ description: 'LIFF SDK から取得したアクセストークン' })
  @IsString()
  @IsNotEmpty()
  liffAccessToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class DevLoginDto {
  @ApiProperty({ description: '開発用: LINE User ID またはメールアドレス' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiPropertyOptional({ description: '開発用: ロール指定' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class AdminLoginDto {
  @ApiProperty({ description: '管理者メールアドレス' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'パスワード' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    lastName: string;
    firstName: string;
    role: string;
    companyId: string;
    avatarUrl: string | null;
  };
}
