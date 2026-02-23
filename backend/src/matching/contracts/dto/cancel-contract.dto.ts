import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CancelContractDto {
  @ApiPropertyOptional({ description: 'キャンセル理由' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  cancelReason?: string;

  @ApiProperty({
    description: 'キャンセル種別',
    enum: ['before_start', 'during_work', 'no_show'],
  })
  @IsString()
  @IsIn(['before_start', 'during_work', 'no_show'])
  cancelType: string;

  @ApiPropertyOptional({ description: 'ペナルティ金額' })
  @IsOptional()
  @IsInt()
  @Min(0)
  penaltyAmount?: number;
}
