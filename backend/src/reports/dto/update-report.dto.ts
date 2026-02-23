import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto {
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

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}
