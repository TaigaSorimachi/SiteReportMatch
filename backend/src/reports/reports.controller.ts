import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateReportBatchDto } from './dto/create-report-batch.dto';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { SearchReportDto } from './dto/search-report.dto';
import { CreateSafetyRecordDto } from './dto/create-safety-record.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * 一括入力モードで日報を作成
   */
  @Post()
  @ApiOperation({ summary: '日報作成 (一括入力)' })
  createBatch(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportBatchDto,
  ) {
    return this.reportsService.createBatch(userId, dto);
  }

  /**
   * リアルタイム出勤打刻
   */
  @Post('clock-in')
  @ApiOperation({ summary: '出勤打刻' })
  clockIn(
    @CurrentUser('id') userId: string,
    @Body() dto: ClockInDto,
  ) {
    return this.reportsService.clockIn(userId, dto);
  }

  /**
   * リアルタイム退勤打刻
   */
  @Patch(':id/clock-out')
  @ApiOperation({ summary: '退勤打刻' })
  @ApiParam({ name: 'id', description: '日報ID' })
  clockOut(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ClockOutDto,
  ) {
    return this.reportsService.clockOut(id, userId, dto);
  }

  /**
   * 休憩開始
   */
  @Post(':id/break/start')
  @ApiOperation({ summary: '休憩開始' })
  @ApiParam({ name: 'id', description: '日報ID' })
  startBreak(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.startBreak(id, userId);
  }

  /**
   * 休憩終了
   */
  @Patch(':id/break/end')
  @ApiOperation({ summary: '休憩終了' })
  @ApiParam({ name: 'id', description: '日報ID' })
  endBreak(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.endBreak(id, userId);
  }

  /**
   * 日報更新
   */
  @Patch(':id')
  @ApiOperation({ summary: '日報更新' })
  @ApiParam({ name: 'id', description: '日報ID' })
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.reportsService.update(id, dto);
  }

  /**
   * 日報提出
   */
  @Patch(':id/submit')
  @ApiOperation({ summary: '日報提出' })
  @ApiParam({ name: 'id', description: '日報ID' })
  submit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.submit(id, userId);
  }

  /**
   * 日報承認
   */
  @Patch(':id/approve')
  @ApiOperation({ summary: '日報承認' })
  @ApiParam({ name: 'id', description: '日報ID' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.approve(id, userId);
  }

  /**
   * 日報差戻し
   */
  @Patch(':id/reject')
  @ApiOperation({ summary: '日報差戻し' })
  @ApiParam({ name: 'id', description: '日報ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { reason: { type: 'string', description: '差戻し理由' } },
      required: ['reason'],
    },
  })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.reportsService.reject(id, userId, reason);
  }

  /**
   * 日報一覧取得
   */
  @Get()
  @ApiOperation({ summary: '日報一覧取得' })
  findAll(@Query() query: SearchReportDto) {
    return this.reportsService.findAll(query);
  }

  /**
   * 日報詳細取得
   */
  @Get(':id')
  @ApiOperation({ summary: '日報詳細取得' })
  @ApiParam({ name: 'id', description: '日報ID' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  /**
   * 原価明細追加
   */
  @Post(':id/costs')
  @ApiOperation({ summary: '原価明細追加' })
  @ApiParam({ name: 'id', description: '日報ID' })
  addCostItem(
    @Param('id') id: string,
    @Body() dto: CreateCostItemDto,
  ) {
    return this.reportsService.addCostItem(id, dto);
  }

  /**
   * 写真追加
   */
  @Post(':id/photos')
  @ApiOperation({ summary: '日報写真追加' })
  @ApiParam({ name: 'id', description: '日報ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photoUrl: { type: 'string', description: '写真URL' },
        photoType: { type: 'string', description: '写真種別' },
        caption: { type: 'string', description: 'キャプション' },
      },
      required: ['photoUrl'],
    },
  })
  addPhoto(
    @Param('id') id: string,
    @Body('photoUrl') photoUrl: string,
    @Body('photoType') photoType?: string,
    @Body('caption') caption?: string,
  ) {
    return this.reportsService.addPhoto(id, photoUrl, photoType, caption);
  }

  /**
   * 安全KY記録追加
   */
  @Post(':id/safety')
  @ApiOperation({ summary: '安全KY記録追加' })
  @ApiParam({ name: 'id', description: '日報ID' })
  addSafetyRecord(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSafetyRecordDto,
  ) {
    return this.reportsService.addSafetyRecord(id, userId, dto);
  }
}
