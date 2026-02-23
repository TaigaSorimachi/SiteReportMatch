import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchReportDto extends PaginationQuery {
  @ApiPropertyOptional({ description: 'プロジェクトID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '作業者ID' })
  @IsOptional()
  @IsString()
  workerId?: string;

  @ApiPropertyOptional({ description: '開始日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '終了日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'ステータス',
    enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
