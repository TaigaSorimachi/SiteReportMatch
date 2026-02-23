import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'ユーザーID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '対象日' })
  @IsDateString()
  targetDate: string;

  @ApiPropertyOptional({ description: '工種ID' })
  @IsOptional()
  @IsUUID()
  workTypeId?: string;

  @ApiProperty({ description: '契約形態' })
  @IsString()
  @MaxLength(20)
  contractType: string;

  @ApiPropertyOptional({ description: '日当' })
  @IsOptional()
  @IsInt()
  dailyRate?: number;

  @ApiPropertyOptional({ description: '時給' })
  @IsOptional()
  @IsInt()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'ソース (direct, demand, supply)', default: 'direct' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  source?: string;

  @ApiPropertyOptional({ description: '募集票ID' })
  @IsOptional()
  @IsUUID()
  demandPostingId?: string;

  @ApiPropertyOptional({ description: '人材公開票ID' })
  @IsOptional()
  @IsUUID()
  supplyPostingId?: string;

  @ApiPropertyOptional({ description: '成約ID' })
  @IsOptional()
  @IsUUID()
  contractId?: string;
}
