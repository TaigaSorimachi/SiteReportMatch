import { IsOptional, IsString, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchNotificationDto extends PaginationQuery {
  @ApiPropertyOptional({ description: 'ユーザーID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '通知チャネル (line/push/in_app)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  channel?: string;

  @ApiPropertyOptional({ description: '既読フラグ' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: '通知タイプ', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  notificationType?: string;
}
