import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchUserDto extends PaginationQuery {
  @ApiPropertyOptional({ description: 'ロール (admin/owner/worker)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  role?: string;

  @ApiPropertyOptional({ description: '稼働状況 (available/busy/on_leave/unavailable)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  availability?: string;

  @ApiPropertyOptional({ description: '所属会社ID (UUID)' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'キーワード（氏名/カナ/メールで検索）' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;
}
