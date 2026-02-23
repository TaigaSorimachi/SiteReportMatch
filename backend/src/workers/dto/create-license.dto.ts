import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({ description: '資格マスタID' })
  @IsUUID()
  licenseId: string;

  @ApiPropertyOptional({ description: '資格番号', example: '第12345号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: '取得日', example: '2020-04-01' })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiPropertyOptional({ description: '有効期限', example: '2025-03-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '発行機関', example: '東京都知事' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingAuthority?: string;

  @ApiPropertyOptional({ description: '証明書URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  documentUrl?: string;
}

export class UpdateLicenseDto {
  @ApiPropertyOptional({ description: '資格番号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: '取得日' })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiPropertyOptional({ description: '有効期限' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '発行機関' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingAuthority?: string;

  @ApiPropertyOptional({ description: '証明書URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  documentUrl?: string;
}
