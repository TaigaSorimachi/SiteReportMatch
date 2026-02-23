import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: '被レビューユーザーID' })
  @IsUUID()
  revieweeId: string;

  @ApiProperty({
    description: 'レビュー種別',
    enum: ['client_to_worker', 'worker_to_client'],
  })
  @IsString()
  @IsIn(['client_to_worker', 'worker_to_client'])
  reviewType: string;

  @ApiProperty({ description: '評価（1-5）', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'コメント' })
  @IsOptional()
  @IsString()
  comment?: string;
}
