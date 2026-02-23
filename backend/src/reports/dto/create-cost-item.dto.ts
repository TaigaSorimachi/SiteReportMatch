import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostItemDto {
  @ApiProperty({
    description: '原価種別',
    enum: ['material', 'equipment', 'transport', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['material', 'equipment', 'transport', 'other'])
  costType: string;

  @ApiProperty({ description: '品目名' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: '単位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '単価' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: '金額' })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
