import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQuery } from '../../../common/dto/pagination.dto';

export class SearchContractsDto extends PaginationQuery {
  @ApiPropertyOptional({ description: 'ステータス', enum: ['active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '会社ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '開始日From', example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '開始日To', example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
