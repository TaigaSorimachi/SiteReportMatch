import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEmail,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({ description: '所属会社ID (UUID)' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'LINE User ID', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lineUserId?: string;

  @ApiPropertyOptional({ description: 'LINE表示名', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineDisplayName?: string;

  @ApiProperty({ description: '姓', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: '名', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiPropertyOptional({ description: '姓カナ', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastNameKana?: string;

  @ApiPropertyOptional({ description: '名カナ', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstNameKana?: string;

  @ApiPropertyOptional({ description: 'メールアドレス', maxLength: 200 })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ description: '電話番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: '生年月日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: '性別', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender?: string;

  @ApiPropertyOptional({ description: 'アバターURL', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ description: '郵便番号', maxLength: 8 })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  postalCode?: string;

  @ApiPropertyOptional({ description: '住所', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiProperty({ description: 'ロール (admin/owner/worker)', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  role: string;

  @ApiPropertyOptional({ description: '個人事業主フラグ', default: false })
  @IsOptional()
  @IsBoolean()
  isIndividual?: boolean;

  @ApiPropertyOptional({ description: 'デフォルト日当' })
  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDailyRate?: number;

  @ApiPropertyOptional({ description: 'デフォルト時給' })
  @IsOptional()
  @IsInt()
  @Min(0)
  defaultHourlyRate?: number;

  @ApiPropertyOptional({ description: 'パスワード（管理者アカウント作成時）' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: '雇用ステータス', maxLength: 20, default: 'active' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  employmentStatus?: string;

  @ApiPropertyOptional({ description: '稼働状況', maxLength: 20, default: 'available' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  availability?: string;

  @ApiPropertyOptional({ description: 'CCUS技能者ID', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ccusWorkerId?: string;

  @ApiPropertyOptional({ description: '税区分', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxCategory?: string;

  @ApiPropertyOptional({ description: 'LINE通知有効', default: true })
  @IsOptional()
  @IsBoolean()
  lineNotifyEnabled?: boolean;

  @ApiPropertyOptional({ description: 'GPS個人設定有効', default: true })
  @IsOptional()
  @IsBoolean()
  gpsPersonalEnabled?: boolean;
}
