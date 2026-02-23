import { IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchInvoiceDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '発行会社ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '請求先会社ID' })
  @IsOptional()
  @IsUUID()
  clientCompanyId?: string;

  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'ステータス (draft/issued/sent/paid/cancelled)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @ApiPropertyOptional({ description: '期間開始日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '期間終了日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
