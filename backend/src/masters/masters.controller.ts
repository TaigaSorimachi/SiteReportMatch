import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MastersService } from './masters.service.js';

@ApiTags('masters')
@ApiBearerAuth()
@Controller('api/v1/masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get('work-types')
  @ApiOperation({ summary: '工種マスタ一覧（階層構造）' })
  @ApiResponse({
    status: 200,
    description: '親工種に子工種をネストして返却',
  })
  getWorkTypes() {
    return this.mastersService.getWorkTypes();
  }

  @Get('structures')
  @ApiOperation({ summary: '構造マスタ一覧' })
  @ApiResponse({ status: 200, description: '有効な構造マスタを返却' })
  getStructures() {
    return this.mastersService.getStructures();
  }

  @Get('licenses')
  @ApiOperation({ summary: '資格マスタ一覧' })
  @ApiResponse({ status: 200, description: '有効な資格マスタを返却' })
  getLicenses() {
    return this.mastersService.getLicenses();
  }

  @Get('accounts')
  @ApiOperation({ summary: '勘定科目マスタ一覧' })
  @ApiResponse({ status: 200, description: '有効な勘定科目マスタを返却' })
  getAccounts() {
    return this.mastersService.getAccounts();
  }
}
