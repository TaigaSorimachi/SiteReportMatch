import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSafetyRecordDto {
  @ApiProperty({ description: 'プロジェクトID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ description: '記録日 (YYYY-MM-DD)。省略時は当日' })
  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @ApiProperty({ description: '危険予知内容' })
  @IsString()
  @IsNotEmpty()
  hazardIdentified: string;

  @ApiProperty({ description: '対策' })
  @IsString()
  @IsNotEmpty()
  countermeasure: string;

  @ApiPropertyOptional({ description: '安全責任者名' })
  @IsOptional()
  @IsString()
  safetyOfficer?: string;

  @ApiPropertyOptional({ description: '参加者ID一覧', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @ApiPropertyOptional({ description: '参加者数' })
  @IsOptional()
  @IsInt()
  participantCount?: number;
}
