import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchProjectDto extends PaginationQuery {
  @ApiPropertyOptional({ description: 'ステータス (planning, active, suspended, completed, cancelled)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '会社ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '期間(開始)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '期間(終了)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'キーワード検索(案件名, 現場名, 案件コード)' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
