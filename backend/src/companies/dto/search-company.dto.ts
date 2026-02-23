import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchCompanyDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '会社タイプ (own/prime/subcontractor/partner)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  companyType?: string;

  @ApiPropertyOptional({ description: 'キーワード（会社名/カナ/住所で検索）' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;
}
