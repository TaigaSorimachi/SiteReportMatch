import { IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchPayrollDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '会社ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: '職人ユーザーID' })
  @IsOptional()
  @IsUUID()
  workerId?: string;

  @ApiPropertyOptional({ description: 'ステータス (draft/confirmed/paid)', maxLength: 20 })
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
