import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '経験年数', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'スキルレベル',
    example: 'expert',
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  skillLevel?: string;

  @ApiPropertyOptional({ description: '専門分野', example: '鉄筋工事全般' })
  @IsOptional()
  @IsString()
  specialties?: string;

  @ApiPropertyOptional({ description: '経歴概要' })
  @IsOptional()
  @IsString()
  careerSummary?: string;

  @ApiPropertyOptional({ description: '希望勤務エリア', example: '東京都、神奈川県' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  preferredArea?: string;

  @ApiPropertyOptional({ description: '最大通勤距離(km)', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  maxCommuteKm?: number;

  @ApiPropertyOptional({ description: '車両所有', example: true })
  @IsOptional()
  @IsBoolean()
  hasVehicle?: boolean;

  @ApiPropertyOptional({ description: '自前工具所有', example: true })
  @IsOptional()
  @IsBoolean()
  hasOwnTools?: boolean;

  @ApiPropertyOptional({ description: 'トラック運転可能', example: false })
  @IsOptional()
  @IsBoolean()
  canDriveTruck?: boolean;

  @ApiPropertyOptional({ description: '稼働可能時間帯', example: '08:00-17:00' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  availableHours?: string;

  @ApiPropertyOptional({ description: '希望日当下限', example: 15000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredDailyMin?: number;

  @ApiPropertyOptional({ description: '希望日当上限', example: 25000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredDailyMax?: number;

  @ApiPropertyOptional({ description: '希望月収', example: 400000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredMonthly?: number;
}
