import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto.js';

export class SearchWorkersDto extends PaginationQuery {
  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiPropertyOptional({
    description: 'スキルレベル',
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  skillLevel?: string;

  @ApiPropertyOptional({ description: '空き状況（対象日）', example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  availableDate?: string;

  @ApiPropertyOptional({ description: '都道府県', example: '東京都' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefecture?: string;

  @ApiPropertyOptional({ description: '車両所有' })
  @IsOptional()
  @IsString()
  hasVehicle?: string;

  @ApiPropertyOptional({ description: '自前工具所有' })
  @IsOptional()
  @IsString()
  hasOwnTools?: string;
}
