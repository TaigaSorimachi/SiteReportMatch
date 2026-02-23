import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DemandService } from './demand.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { SearchDemandDto } from './dto/search-demand.dto';
import { ApplyDemandDto } from './dto/apply-demand.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Matching - Demand')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Controller('api/v1/matching/demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  // ========== 募集票 CRUD ==========

  @Post()
  @ApiOperation({ summary: '募集票作成' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateDemandDto,
  ) {
    return this.demandService.create(companyId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '募集票一覧' })
  findAll(@Query() query: SearchDemandDto) {
    return this.demandService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '募集票詳細' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.demandService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '募集票更新' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDemandDto,
  ) {
    return this.demandService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: '募集票公開' })
  @ApiParam({ name: 'id', type: String })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.demandService.publish(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: '募集票一時停止' })
  @ApiParam({ name: 'id', type: String })
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.demandService.suspend(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: '募集票クローズ' })
  @ApiParam({ name: 'id', type: String })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.demandService.close(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '募集票削除（論理削除）' })
  @ApiParam({ name: 'id', type: String })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.demandService.remove(id, userId);
  }

  // ========== 応募 ==========

  @Post(':id/applications')
  @ApiOperation({ summary: '募集に応募' })
  @ApiParam({ name: 'id', type: String })
  apply(
    @Param('id', ParseUUIDPipe) postingId: string,
    @CurrentUser('id') applicantId: string,
    @Body() dto: ApplyDemandDto,
  ) {
    return this.demandService.apply(postingId, applicantId, dto);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: '応募一覧' })
  @ApiParam({ name: 'id', type: String })
  getApplications(@Param('id', ParseUUIDPipe) postingId: string) {
    return this.demandService.getApplications(postingId);
  }

  @Patch(':id/applications/:applicationId/accept')
  @ApiOperation({ summary: '応募承認' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'applicationId', type: String })
  acceptApplication(
    @Param('id', ParseUUIDPipe) postingId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser('id') responderId: string,
  ) {
    return this.demandService.acceptApplication(postingId, applicationId, responderId);
  }

  @Patch(':id/applications/:applicationId/reject')
  @ApiOperation({ summary: '応募却下' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'applicationId', type: String })
  rejectApplication(
    @Param('id', ParseUUIDPipe) postingId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser('id') responderId: string,
    @Body('reason') reason?: string,
  ) {
    return this.demandService.rejectApplication(postingId, applicationId, responderId, reason);
  }

  // ========== メッセージ ==========

  @Get(':id/messages')
  @ApiOperation({ summary: 'メッセージ一覧' })
  @ApiParam({ name: 'id', type: String })
  getMessages(@Param('id', ParseUUIDPipe) postingId: string) {
    return this.demandService.getMessages(postingId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'メッセージ送信' })
  @ApiParam({ name: 'id', type: String })
  sendMessage(
    @Param('id', ParseUUIDPipe) postingId: string,
    @CurrentUser('id') senderId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.demandService.sendMessage(postingId, senderId, dto);
  }
}
