import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveFieldValsDto {
  @ApiProperty({
    description: 'フィールドキーと値のペア (例: { "my_field": "value" })',
    type: 'object',
    additionalProperties: true,
  })
  @IsNotEmpty()
  @IsObject()
  values: Record<string, any>;
}
