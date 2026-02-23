import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePayrollLineDto {
  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: '配置ID' })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @ApiPropertyOptional({ description: '作業日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  workDate?: string;

  @ApiPropertyOptional({ description: '人工数' })
  @IsOptional()
  @IsNumber()
  manDays?: number;

  @ApiPropertyOptional({ description: '日当単価' })
  @IsOptional()
  @IsNumber()
  dailyRate?: number;

  @ApiProperty({ description: '金額' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '摘要', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class CreatePayrollDto {
  @ApiProperty({ description: '会社ID' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: '職人ユーザーID' })
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ description: '対象期間開始日 (YYYY-MM-DD)' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: '対象期間終了日 (YYYY-MM-DD)' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: '支払日 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiProperty({ description: '総支給額' })
  @IsNumber()
  grossAmount: number;

  @ApiPropertyOptional({ description: '源泉徴収税額' })
  @IsOptional()
  @IsNumber()
  withholdingTax?: number;

  @ApiPropertyOptional({ description: '控除額' })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiProperty({ description: '差引支給額' })
  @IsNumber()
  netAmount: number;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '支払明細', type: [CreatePayrollLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollLineDto)
  lines: CreatePayrollLineDto[];
}
