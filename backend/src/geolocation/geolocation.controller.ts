import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecordLocationDto } from './dto/record-location.dto';
import { GeofenceCheckDto } from './dto/geofence-check.dto';
import { SearchLocationDto } from './dto/search-location.dto';

@ApiTags('Geolocation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  /**
   * 位置情報を記録
   */
  @Post('record')
  @ApiOperation({ summary: '位置情報記録' })
  recordLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: RecordLocationDto,
  ) {
    return this.geolocationService.recordLocation(userId, dto);
  }

  /**
   * ジオフェンスチェック
   */
  @Post('geofence/check')
  @ApiOperation({ summary: 'ジオフェンスチェック' })
  checkGeofence(
    @CurrentUser('id') userId: string,
    @Body() dto: GeofenceCheckDto,
  ) {
    return this.geolocationService.checkGeofence(userId, dto);
  }

  /**
   * 位置情報ログ一覧
   */
  @Get('logs')
  @ApiOperation({ summary: '位置情報ログ一覧' })
  getLocationLogs(@Query() query: SearchLocationDto) {
    return this.geolocationService.getLocationLogs(query);
  }

  /**
   * ジオフェンスイベント一覧
   */
  @Get('geofence/events')
  @ApiOperation({ summary: 'ジオフェンスイベント一覧' })
  getGeofenceEvents(@Query() query: SearchLocationDto) {
    return this.geolocationService.getGeofenceEvents(query);
  }
}
