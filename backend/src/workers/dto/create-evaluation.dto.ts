import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ description: '被評価者(職人)のユーザーID' })
  @IsUUID()
  workerId: string;

  @ApiProperty({ description: '案件ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: '技術力(1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingSkill: number;

  @ApiProperty({ description: '作業速度(1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingSpeed: number;

  @ApiProperty({ description: '勤務態度(1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingAttitude: number;

  @ApiProperty({ description: '安全意識(1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingSafety: number;

  @ApiProperty({ description: 'コミュニケーション(1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingCommunication: number;

  @ApiPropertyOptional({ description: 'コメント' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: '公開フラグ', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
