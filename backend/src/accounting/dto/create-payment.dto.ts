import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: '入金日 (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({ description: '入金額' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '支払方法 (bank_transfer/check/cash)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  paymentMethod?: string;

  @ApiPropertyOptional({ description: '銀行参照番号', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankRef?: string;

  @ApiPropertyOptional({ description: '備考', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
