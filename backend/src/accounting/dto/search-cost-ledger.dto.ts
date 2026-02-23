import { IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchCostLedgerDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '会社ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: '原価区分 (labor/material/equipment/transport/other)', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  costCategory?: string;

  @ApiPropertyOptional({ description: '期間開始日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '期間終了日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
