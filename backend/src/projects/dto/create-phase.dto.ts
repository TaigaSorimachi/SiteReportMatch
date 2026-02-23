import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhaseDto {
  @ApiProperty({ description: '工程名' })
  @IsString()
  @MaxLength(200)
  phaseName: string;

  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiPropertyOptional({ description: '表示順', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '予定開始日' })
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @ApiPropertyOptional({ description: '予定終了日' })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}
