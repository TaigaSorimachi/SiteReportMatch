import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ description: '会社名', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName: string;

  @ApiPropertyOptional({ description: '会社名カナ', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyNameKana?: string;

  @ApiProperty({ description: '会社タイプ (own/prime/subcontractor/partner)', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  companyType: string;

  @ApiPropertyOptional({ description: '法人番号（13桁）', maxLength: 13 })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  corporateNumber?: string;

  @ApiPropertyOptional({ description: '代表者名', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  representative?: string;

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

  @ApiPropertyOptional({ description: '住所緯度' })
  @IsOptional()
  @IsNumber()
  addressLat?: number;

  @ApiPropertyOptional({ description: '住所経度' })
  @IsOptional()
  @IsNumber()
  addressLng?: number;

  @ApiPropertyOptional({ description: '電話番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'FAX番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fax?: string;

  @ApiPropertyOptional({ description: 'メールアドレス', maxLength: 200 })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ description: 'Webサイト', maxLength: 300 })
  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  website?: string;

  @ApiPropertyOptional({ description: '適格請求書発行事業者登録番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  invoiceRegNo?: string;

  @ApiPropertyOptional({ description: 'CCUS事業者ID', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ccusCompanyId?: string;

  @ApiPropertyOptional({ description: '銀行名', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: '支店名', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankBranch?: string;

  @ApiPropertyOptional({ description: '口座種別', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bankAccountType?: string;

  @ApiPropertyOptional({ description: '口座番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankAccountNo?: string;

  @ApiPropertyOptional({ description: '口座名義', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountName?: string;

  @ApiPropertyOptional({ description: '支払条件', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '有効フラグ', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
