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
import { SupplyService } from './supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { SearchSupplyDto } from './dto/search-supply.dto';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Matching - Supply')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Controller('api/v1/matching/supply')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  // ========== 人材公開票 CRUD ==========

  @Post()
  @ApiOperation({ summary: '人材公開票作成' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId: string | undefined,
    @Body() dto: CreateSupplyDto,
  ) {
    return this.supplyService.create(userId, companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: '人材公開票一覧' })
  findAll(@Query() query: SearchSupplyDto) {
    return this.supplyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '人材公開票詳細' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '人材公開票更新' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplyDto,
  ) {
    return this.supplyService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: '人材公開票公開' })
  @ApiParam({ name: 'id', type: String })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplyService.publish(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: '人材公開票クローズ' })
  @ApiParam({ name: 'id', type: String })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplyService.close(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '人材公開票削除（論理削除）' })
  @ApiParam({ name: 'id', type: String })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.supplyService.remove(id, userId);
  }

  // ========== 問い合わせ ==========

  @Post(':id/inquiries')
  @ApiOperation({ summary: '人材に問い合わせ' })
  @ApiParam({ name: 'id', type: String })
  inquire(
    @Param('id', ParseUUIDPipe) postingId: string,
    @CurrentUser('id') inquirerId: string,
    @CurrentUser('companyId') companyId: string | undefined,
    @Body() dto: CreateInquiryDto,
  ) {
    return this.supplyService.inquire(postingId, inquirerId, companyId, dto);
  }

  @Get(':id/inquiries')
  @ApiOperation({ summary: '問い合わせ一覧' })
  @ApiParam({ name: 'id', type: String })
  getInquiries(@Param('id', ParseUUIDPipe) postingId: string) {
    return this.supplyService.getInquiries(postingId);
  }

  @Patch(':id/inquiries/:inquiryId/accept')
  @ApiOperation({ summary: '問い合わせ承認' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'inquiryId', type: String })
  acceptInquiry(
    @Param('id', ParseUUIDPipe) postingId: string,
    @Param('inquiryId', ParseUUIDPipe) inquiryId: string,
  ) {
    return this.supplyService.acceptInquiry(postingId, inquiryId);
  }

  @Patch(':id/inquiries/:inquiryId/reject')
  @ApiOperation({ summary: '問い合わせ却下' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'inquiryId', type: String })
  rejectInquiry(
    @Param('id', ParseUUIDPipe) postingId: string,
    @Param('inquiryId', ParseUUIDPipe) inquiryId: string,
  ) {
    return this.supplyService.rejectInquiry(postingId, inquiryId);
  }

  // ========== メッセージ ==========

  @Get(':id/messages')
  @ApiOperation({ summary: 'メッセージ一覧' })
  @ApiParam({ name: 'id', type: String })
  getMessages(@Param('id', ParseUUIDPipe) postingId: string) {
    return this.supplyService.getMessages(postingId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'メッセージ送信' })
  @ApiParam({ name: 'id', type: String })
  sendMessage(
    @Param('id', ParseUUIDPipe) postingId: string,
    @CurrentUser('id') senderId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.supplyService.sendMessage(postingId, senderId, dto);
  }
}
