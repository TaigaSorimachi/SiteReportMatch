import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsArray,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplyDto {
  @ApiProperty({ description: '工種ID' })
  @IsUUID()
  workTypeId: string;

  @ApiPropertyOptional({ description: '工種サブID' })
  @IsOptional()
  @IsUUID()
  workTypeSubId?: string;

  @ApiProperty({ description: '契約形態', enum: ['daily_rate', 'fixed_price', 'monthly'] })
  @IsString()
  @IsIn(['daily_rate', 'fixed_price', 'monthly'])
  contractType: string;

  @ApiPropertyOptional({ description: '希望日当' })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredDailyRate?: number;

  @ApiPropertyOptional({ description: '希望月給' })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredMonthlyRate?: number;

  @ApiProperty({ description: '稼働可能開始日', example: '2026-03-01' })
  @IsDateString()
  availableStart: string;

  @ApiProperty({ description: '稼働可能終了日', example: '2026-06-30' })
  @IsDateString()
  availableEnd: string;

  @ApiPropertyOptional({ description: '稼働可能時間帯', example: '08:00-17:00' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  availableHours?: string;

  @ApiProperty({ description: '稼働可能都道府県', example: '東京都' })
  @IsString()
  @MaxLength(10)
  availablePrefecture: string;

  @ApiPropertyOptional({ description: '稼働可能エリア' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  availableArea?: string;

  @ApiPropertyOptional({ description: 'スキルレベル', enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'] })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  skillLevel?: string;

  @ApiPropertyOptional({ description: '経験年数' })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: '保有資格IDリスト', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  licenses?: string[];

  @ApiPropertyOptional({ description: 'タイトル' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ description: '説明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}
