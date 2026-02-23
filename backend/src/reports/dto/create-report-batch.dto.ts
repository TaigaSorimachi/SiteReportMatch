import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCostItemDto } from './create-cost-item.dto';

class LocationDto {
  @ApiProperty({ description: '緯度' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: '経度' })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: '精度(メートル)' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;
}

export class CreateReportBatchDto {
  @ApiProperty({ description: 'プロジェクトID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: '作業日 (YYYY-MM-DD)' })
  @IsDateString()
  reportDate: string;

  @ApiPropertyOptional({ description: '入力モード', default: 'batch' })
  @IsOptional()
  @IsString()
  inputMode?: string = 'batch';

  @ApiProperty({ description: '出勤時刻 (ISO 8601)' })
  @IsString()
  @IsNotEmpty()
  clockIn: string;

  @ApiProperty({ description: '退勤時刻 (ISO 8601)' })
  @IsString()
  @IsNotEmpty()
  clockOut: string;

  @ApiPropertyOptional({ description: '休憩時間(分)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  breakMinutes?: number = 0;

  @ApiPropertyOptional({ description: '人工数' })
  @IsOptional()
  @IsNumber()
  manDays?: number;

  @ApiPropertyOptional({ description: '作業内容' })
  @IsOptional()
  @IsString()
  workContent?: string;

  @ApiPropertyOptional({ description: '進捗率 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPct?: number;

  @ApiPropertyOptional({ description: '天候' })
  @IsOptional()
  @IsString()
  weather?: string;

  @ApiPropertyOptional({ description: '原価明細', type: [CreateCostItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCostItemDto)
  costItems?: CreateCostItemDto[];

  @ApiPropertyOptional({ description: '位置情報', type: LocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
