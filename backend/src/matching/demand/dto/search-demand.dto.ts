import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationQuery } from '../../../common/dto/pagination.dto';

export class SearchDemandDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '都道府県', example: '東京都' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefecture?: string;

  @ApiPropertyOptional({ description: '市区町村' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiPropertyOptional({ description: '契約形態', enum: ['daily_rate', 'fixed_price'] })
  @IsOptional()
  @IsString()
  @IsIn(['daily_rate', 'fixed_price'])
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

  @ApiPropertyOptional({ description: '作業開始日From', example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '作業開始日To', example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'ステータス', enum: ['draft', 'open', 'filled', 'suspended', 'closed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;
}
