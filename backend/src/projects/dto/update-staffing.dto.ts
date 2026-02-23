import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaffingEntryDto {
  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiProperty({ description: '対象日' })
  @IsDateString()
  targetDate: string;

  @ApiProperty({ description: '必要人数', minimum: 0 })
  @IsInt()
  @Min(0)
  requiredCount: number;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class UpdateStaffingDto {
  @ApiProperty({ type: [StaffingEntryDto], description: '人員計画エントリ配列' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffingEntryDto)
  entries: StaffingEntryDto[];
}
