import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: '送信先ユーザーID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '通知チャネル',
    enum: ['line', 'push', 'in_app'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['line', 'push', 'in_app'])
  channel: string;

  @ApiProperty({ description: '通知タイプ', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  notificationType: string;

  @ApiPropertyOptional({ description: 'タイトル', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '本文' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: '関連エンティティタイプ', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  relatedType?: string;

  @ApiPropertyOptional({ description: '関連エンティティID' })
  @IsOptional()
  @IsUUID()
  relatedId?: string;
}
