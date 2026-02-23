import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  IsArray,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FieldOptionDto {
  @ApiProperty({ description: '選択肢の値' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: '選択肢のラベル' })
  @IsString()
  @IsNotEmpty()
  label: string;
}

export class CreateFieldDefDto {
  @ApiProperty({
    description: '対象タイプ',
    enum: ['demand', 'supply', 'project', 'worker'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['demand', 'supply', 'project', 'worker'])
  targetType: string;

  @ApiProperty({ description: 'フィールドラベル', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fieldLabel: string;

  @ApiProperty({
    description: 'フィールドキー（小文字スネークケース）',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'fieldKey must be lowercase snake_case (e.g. my_field_name)',
  })
  fieldKey: string;

  @ApiProperty({
    description: '入力タイプ',
    enum: ['text', 'number', 'date', 'select', 'checkbox', 'textarea'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['text', 'number', 'date', 'select', 'checkbox', 'textarea'])
  inputType: string;

  @ApiPropertyOptional({
    description: '選択肢（inputType=selectの場合）',
    type: [FieldOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  options?: FieldOptionDto[];

  @ApiPropertyOptional({ description: '必須フラグ', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '表示順' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'プレースホルダー', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeholder?: string;

  @ApiPropertyOptional({ description: 'ヘルプテキスト', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  helpText?: string;
}
