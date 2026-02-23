import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiPropertyOptional({ description: '書類種別' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  docType?: string;

  @ApiProperty({ description: '書類名' })
  @IsString()
  @MaxLength(300)
  docName: string;

  @ApiProperty({ description: 'ファイルURL' })
  @IsString()
  @MaxLength(500)
  fileUrl: string;

  @ApiPropertyOptional({ description: 'ファイルサイズ (bytes)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSizeBytes?: number;
}
