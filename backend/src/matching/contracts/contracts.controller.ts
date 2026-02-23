import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { SearchContractsDto } from './dto/search-contracts.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CancelContractDto } from './dto/cancel-contract.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Matching - Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Controller('api/v1/matching/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: '成約一覧' })
  findAll(@Query() query: SearchContractsDto) {
    return this.contractsService.findAll(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'ダッシュボード（今週の人員過不足）' })
  getDashboard(@CurrentUser('companyId') companyId: string) {
    return this.contractsService.getDashboard(companyId);
  }

  @Get('kpi')
  @ApiOperation({ summary: 'マッチングKPI' })
  getKpi(@Query('companyId') companyId?: string) {
    return this.contractsService.getKpi(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: '成約詳細' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: '成約完了' })
  @ApiParam({ name: 'id', type: String })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.complete(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '成約キャンセル' })
  @ApiParam({ name: 'id', type: String })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelContractDto,
  ) {
    return this.contractsService.cancel(id, userId, dto);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'レビュー追加' })
  @ApiParam({ name: 'id', type: String })
  addReview(
    @Param('id', ParseUUIDPipe) contractId: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.contractsService.addReview(contractId, reviewerId, dto);
  }
}
