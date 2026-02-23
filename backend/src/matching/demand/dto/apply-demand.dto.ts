import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ApplyDemandDto {
  @ApiPropertyOptional({ description: '希望日当' })
  @IsOptional()
  @IsInt()
  @Min(0)
  proposedRate?: number;

  @ApiPropertyOptional({ description: '希望請負金額' })
  @IsOptional()
  @IsInt()
  proposedPrice?: number;

  @ApiPropertyOptional({ description: '対応可能人数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  availableCount?: number;

  @ApiPropertyOptional({ description: '対応可能日リスト', type: [String] })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  availableDates?: string[];

  @ApiPropertyOptional({ description: 'メッセージ' })
  @IsOptional()
  @IsString()
  message?: string;
}
