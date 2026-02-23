import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordLocationDto {
  @ApiProperty({ description: '緯度' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: '経度' })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: '精度(メートル)' })
  @IsOptional()
  @IsNumber()
  accuracyM?: number;

  @ApiProperty({
    description: 'イベント種別',
    example: 'periodic',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiPropertyOptional({ description: 'プロジェクトID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '日報ID' })
  @IsOptional()
  @IsString()
  reportId?: string;
}
