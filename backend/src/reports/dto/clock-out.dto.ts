import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCostItemDto } from './create-cost-item.dto';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}

export class ClockOutDto {
  @ApiPropertyOptional({ description: '作業内容' })
  @IsOptional()
  @IsString()
  workContent?: string;

  @ApiPropertyOptional({ description: '進捗率 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPct?: number;

  @ApiPropertyOptional({ description: '原価明細', type: [CreateCostItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCostItemDto)
  costItems?: CreateCostItemDto[];

  @ApiPropertyOptional({ description: '位置情報', type: LocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
