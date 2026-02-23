import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationQuery } from '../../../common/dto/pagination.dto';

export class SearchSupplyDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '都道府県', example: '東京都' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefecture?: string;

  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiPropertyOptional({ description: '契約形態', enum: ['daily_rate', 'fixed_price', 'monthly'] })
  @IsOptional()
  @IsString()
  @IsIn(['daily_rate', 'fixed_price', 'monthly'])
  contractType?: string;

  @ApiPropertyOptional({ description: '日当下限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rateMin?: number;

  @ApiPropertyOptional({ description: '日当上限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rateMax?: number;

  @ApiPropertyOptional({ description: '稼働可能開始日From', example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '稼働可能終了日To', example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'ステータス', enum: ['draft', 'open', 'closed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;
}
