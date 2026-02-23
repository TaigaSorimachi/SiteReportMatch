import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateInquiryDto {
  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: '提示日当' })
  @IsOptional()
  @IsInt()
  @Min(0)
  proposedRate?: number;

  @ApiPropertyOptional({ description: '提示期間' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  proposedPeriod?: string;

  @ApiPropertyOptional({ description: 'メッセージ' })
  @IsOptional()
  @IsString()
  message?: string;
}
