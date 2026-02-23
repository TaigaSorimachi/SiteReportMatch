import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ description: '緯度' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: '経度' })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: '精度(メートル)' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;
}

export class ClockInDto {
  @ApiProperty({ description: 'プロジェクトID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ description: '位置情報', type: LocationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
