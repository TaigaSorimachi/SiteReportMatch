import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'メッセージ本文' })
  @IsString()
  @MinLength(1)
  messageText: string;
}
