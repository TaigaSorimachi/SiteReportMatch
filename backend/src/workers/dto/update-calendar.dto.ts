import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CalendarEntry {
  @ApiProperty({ description: '対象日', example: '2026-03-01' })
  @IsDateString()
  targetDate: string;

  @ApiProperty({
    description: 'ステータス',
    example: 'available',
    enum: ['available', 'unavailable', 'booked', 'tentative'],
  })
  @IsString()
  @MaxLength(20)
  status: string;

  @ApiPropertyOptional({ description: '案件ID (booked時)' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class UpdateCalendarDto {
  @ApiProperty({ description: 'カレンダーエントリ一覧', type: [CalendarEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalendarEntry)
  entries: CalendarEntry[];
}
