import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SortOrderItemDto {
  @ApiProperty({ description: 'フィールド定義ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: '表示順' })
  @IsInt()
  sortOrder: number;
}

export class UpdateSortOrderDto {
  @ApiProperty({ description: '表示順更新リスト', type: [SortOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortOrderItemDto)
  items: SortOrderItemDto[];
}
