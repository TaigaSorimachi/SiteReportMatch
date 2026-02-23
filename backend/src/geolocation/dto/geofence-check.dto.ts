import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeofenceCheckDto {
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

  @ApiPropertyOptional({ description: 'プロジェクトID (省略時は当日配置案件を対象)' })
  @IsOptional()
  @IsString()
  projectId?: string;
}
