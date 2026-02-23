import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: '会社ID' })
  @IsUUID()
  companyId: string;

  @ApiPropertyOptional({ description: '案件コード' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectCode?: string;

  @ApiProperty({ description: '案件名' })
  @IsString()
  @MaxLength(300)
  projectName: string;

  @ApiPropertyOptional({ description: '説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '発注元会社ID' })
  @IsOptional()
  @IsUUID()
  clientCompanyId?: string;

  @ApiPropertyOptional({ description: '元請会社ID' })
  @IsOptional()
  @IsUUID()
  primeContractorId?: string;

  @ApiPropertyOptional({ description: '契約次数', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  contractTier?: number;

  @ApiPropertyOptional({ description: '主要工種ID' })
  @IsOptional()
  @IsUUID()
  primaryWorkTypeId?: string;

  @ApiPropertyOptional({ description: '構造ID' })
  @IsOptional()
  @IsUUID()
  structureId?: string;

  @ApiPropertyOptional({ description: '階数' })
  @IsOptional()
  @IsInt()
  floorCount?: number;

  @ApiPropertyOptional({ description: '物件種別' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  propertyType?: string;

  @ApiPropertyOptional({ description: '現場名' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  siteName?: string;

  @ApiPropertyOptional({ description: '現場郵便番号' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  sitePostalCode?: string;

  @ApiPropertyOptional({ description: '現場都道府県' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sitePrefecture?: string;

  @ApiPropertyOptional({ description: '現場市区町村' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  siteCity?: string;

  @ApiPropertyOptional({ description: '現場住所' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  siteAddress?: string;

  @ApiPropertyOptional({ description: '現場緯度' })
  @IsOptional()
  @IsNumber()
  siteLat?: number;

  @ApiPropertyOptional({ description: '現場経度' })
  @IsOptional()
  @IsNumber()
  siteLng?: number;

  @ApiPropertyOptional({ description: 'ジオフェンス半径(m)', default: 300 })
  @IsOptional()
  @IsInt()
  @Min(0)
  geofenceRadiusM?: number;

  @ApiPropertyOptional({ description: '予定開始日' })
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @ApiPropertyOptional({ description: '予定終了日' })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiPropertyOptional({ description: '契約金額' })
  @IsOptional()
  @IsNumber()
  contractAmount?: number;

  @ApiPropertyOptional({ description: '見積原価' })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiPropertyOptional({ description: '税率', default: 10.0 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: '安全書類システム' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  safetyDocSystem?: string;

  @ApiPropertyOptional({ description: 'CCUS必須', default: false })
  @IsOptional()
  @IsBoolean()
  ccusRequired?: boolean;

  @ApiPropertyOptional({ description: '営業担当ID' })
  @IsOptional()
  @IsUUID()
  salesPersonId?: string;

  @ApiPropertyOptional({ description: '現場監督ID' })
  @IsOptional()
  @IsUUID()
  siteManagerId?: string;

  @ApiPropertyOptional({ description: '職長ID' })
  @IsOptional()
  @IsUUID()
  foremanId?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}
