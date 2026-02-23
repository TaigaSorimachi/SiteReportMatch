import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkerSkillEntry {
  @ApiProperty({ description: '工種マスタID' })
  @IsUUID()
  workTypeId: string;

  @ApiPropertyOptional({
    description: '習熟度',
    example: 'expert',
    enum: ['beginner', 'capable', 'skilled', 'expert'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  proficiency?: string;

  @ApiPropertyOptional({ description: '経験年数', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;
}

export class UpdateSkillsDto {
  @ApiProperty({ description: 'スキル一覧', type: [WorkerSkillEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerSkillEntry)
  skills: WorkerSkillEntry[];
}
