import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
  IsInt,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceLineDto {
  @ApiProperty({ description: '行番号' })
  @IsInt()
  lineOrder: number;

  @ApiProperty({ description: '説明', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  description: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: '単位', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: '単価' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ description: '金額' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '税区分 (taxable/exempt/non_taxable)', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  taxCategory?: string;

  @ApiPropertyOptional({ description: '勘定科目ID' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ description: '工程ID' })
  @IsOptional()
  @IsUUID()
  projectPhaseId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: '発行会社ID' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: '請求先会社ID' })
  @IsUUID()
  @IsNotEmpty()
  clientCompanyId: string;

  @ApiPropertyOptional({ description: '案件ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: '請求書番号', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  invoiceNumber: string;

  @ApiProperty({ description: '請求日 (YYYY-MM-DD)' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ description: '支払期日 (YYYY-MM-DD)' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: '請求タイプ (progress/completion/monthly)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  billingType?: string;

  @ApiProperty({ description: '小計' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ description: '税額' })
  @IsNumber()
  taxAmount: number;

  @ApiProperty({ description: '合計金額' })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ description: '税率 (%)' })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: '適格請求書フラグ' })
  @IsOptional()
  @IsBoolean()
  qualifiedInvoice?: boolean;

  @ApiPropertyOptional({ description: '適格請求書発行事業者登録番号', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  invoiceRegNo?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '請求明細', type: [CreateInvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines: CreateInvoiceLineDto[];
}
