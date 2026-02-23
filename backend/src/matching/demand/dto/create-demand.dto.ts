import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsBoolean,
  IsArray,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDemandDto {
  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: '現場名' })
  @IsString()
  @MaxLength(300)
  siteName: string;

  @ApiProperty({ description: '都道府県', example: '東京都' })
  @IsString()
  @MaxLength(10)
  sitePrefecture: string;

  @ApiProperty({ description: '市区町村', example: '新宿区' })
  @IsString()
  @MaxLength(50)
  siteCity: string;

  @ApiPropertyOptional({ description: '住所' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  siteAddress?: string;

  @ApiProperty({ description: '契約形態', enum: ['daily_rate', 'fixed_price'] })
  @IsString()
  @IsIn(['daily_rate', 'fixed_price'])
  contractType: string;

  @ApiProperty({ description: '工種ID' })
  @IsUUID()
  workTypeId: string;

  @ApiPropertyOptional({ description: '工種サブID' })
  @IsOptional()
  @IsUUID()
  workTypeSubId?: string;

  @ApiProperty({ description: '作業開始日', example: '2026-03-01' })
  @IsDateString()
  workDateStart: string;

  @ApiProperty({ description: '作業終了日', example: '2026-03-31' })
  @IsDateString()
  workDateEnd: string;

  @ApiProperty({ description: '必要人数', default: 1 })
  @IsInt()
  @Min(1)
  requiredCount: number;

  @ApiPropertyOptional({ description: '日当下限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailyRateMin?: number;

  @ApiPropertyOptional({ description: '日当上限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailyRateMax?: number;

  @ApiPropertyOptional({ description: '請負金額' })
  @IsOptional()
  @IsInt()
  fixedPrice?: number;

  @ApiPropertyOptional({ description: '請負範囲' })
  @IsOptional()
  @IsString()
  fixedScope?: string;

  @ApiPropertyOptional({ description: '構造ID' })
  @IsOptional()
  @IsUUID()
  structureId?: string;

  @ApiPropertyOptional({ description: '階数' })
  @IsOptional()
  @IsInt()
  floorCount?: number;

  @ApiPropertyOptional({ description: '元請名' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  primeContractor?: string;

  @ApiPropertyOptional({ description: '次数' })
  @IsOptional()
  @IsInt()
  contractTier?: number;

  @ApiPropertyOptional({ description: '作業開始時間', example: '08:00' })
  @IsOptional()
  @IsString()
  workTimeStart?: string;

  @ApiPropertyOptional({ description: '作業終了時間', example: '17:00' })
  @IsOptional()
  @IsString()
  workTimeEnd?: string;

  @ApiPropertyOptional({ description: '交通手段' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  transportationType?: string;

  @ApiPropertyOptional({ description: '安全書類システム' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  safetyDocSystem?: string;

  @ApiPropertyOptional({ description: 'CCUS必須' })
  @IsOptional()
  @IsBoolean()
  ccusRequired?: boolean;

  @ApiPropertyOptional({ description: '必要スキルレベル' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  requiredSkillLevel?: string;

  @ApiPropertyOptional({ description: '必要資格IDリスト', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  requiredLicenses?: string[];

  @ApiPropertyOptional({ description: '駐車場提供' })
  @IsOptional()
  @IsBoolean()
  providesParking?: boolean;

  @ApiPropertyOptional({ description: '工具提供' })
  @IsOptional()
  @IsBoolean()
  providesTools?: boolean;

  @ApiPropertyOptional({ description: '食事提供' })
  @IsOptional()
  @IsBoolean()
  providesMeals?: boolean;

  @ApiPropertyOptional({ description: '説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}
