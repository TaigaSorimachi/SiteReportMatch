import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanySettingsDto {
  @ApiPropertyOptional({ description: '日報入力モード (selectable/simple/detailed)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  defaultReportMode?: string;

  @ApiPropertyOptional({ description: '作業員によるモード切替許可' })
  @IsOptional()
  @IsBoolean()
  allowWorkerModeSwitch?: boolean;

  @ApiPropertyOptional({ description: '写真必須' })
  @IsOptional()
  @IsBoolean()
  requirePhoto?: boolean;

  @ApiPropertyOptional({ description: '安全記録必須' })
  @IsOptional()
  @IsBoolean()
  requireSafetyRecord?: boolean;

  @ApiPropertyOptional({ description: 'GPS有効' })
  @IsOptional()
  @IsBoolean()
  gpsEnabled?: boolean;

  @ApiPropertyOptional({ description: '作業員によるGPS無効化許可' })
  @IsOptional()
  @IsBoolean()
  gpsWorkerCanDisable?: boolean;

  @ApiPropertyOptional({ description: 'ジオフェンス有効' })
  @IsOptional()
  @IsBoolean()
  geofenceEnabled?: boolean;

  @ApiPropertyOptional({ description: 'ジオフェンス半径(m)', minimum: 50, maximum: 5000 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(5000)
  geofenceRadiusM?: number;

  @ApiPropertyOptional({ description: 'マッチング機能有効' })
  @IsOptional()
  @IsBoolean()
  matchingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'マッチング自動承認' })
  @IsOptional()
  @IsBoolean()
  matchingAutoApprove?: boolean;

  @ApiPropertyOptional({ description: '標準労働時間', minimum: 1, maximum: 24 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  standardWorkHours?: number;

  @ApiPropertyOptional({ description: '残業閾値時間', minimum: 1, maximum: 24 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  overtimeThresholdHours?: number;

  @ApiPropertyOptional({ description: '拡張設定 (JSON)' })
  @IsOptional()
  extra?: Record<string, unknown>;
}
