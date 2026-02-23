import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SearchInvoiceDto } from './dto/search-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { SearchPayrollDto } from './dto/search-payroll.dto';
import { SearchCostLedgerDto } from './dto/search-cost-ledger.dto';

@ApiTags('Accounting')
@ApiBearerAuth()
@Controller('api/v1')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ─── Invoice endpoints ──────────────────────────────────────────────

  @Post('invoices')
  @ApiOperation({ summary: '請求書作成' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.accountingService.createInvoice(dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: '請求書一覧' })
  findAllInvoices(@Query() query: SearchInvoiceDto) {
    return this.accountingService.findAllInvoices(query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: '請求書詳細' })
  findOneInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.findOneInvoice(id);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: '請求書更新' })
  updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.accountingService.updateInvoice(id, dto);
  }

  @Patch('invoices/:id/issue')
  @ApiOperation({ summary: '請求書発行（ステータスをissuedに変更）' })
  issueInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.issueInvoice(id);
  }

  @Post('invoices/:id/payments')
  @ApiOperation({ summary: '入金登録' })
  addPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.accountingService.addPayment(id, dto);
  }

  // ─── Payroll endpoints ──────────────────────────────────────────────

  @Post('payroll')
  @ApiOperation({ summary: '支払明細作成' })
  createPayroll(@Body() dto: CreatePayrollDto) {
    return this.accountingService.createPayroll(dto);
  }

  @Get('payroll')
  @ApiOperation({ summary: '支払明細一覧' })
  findAllPayroll(@Query() query: SearchPayrollDto) {
    return this.accountingService.findAllPayroll(query);
  }

  @Patch('payroll/:id/confirm')
  @ApiOperation({ summary: '支払明細確定' })
  confirmPayroll(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.confirmPayroll(id);
  }

  @Patch('payroll/:id/pay')
  @ApiOperation({ summary: '支払実行' })
  payPayroll(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.payPayroll(id);
  }

  // ─── Cost Ledger endpoints ─────────────────────────────────────────

  @Get('cost-ledger')
  @ApiOperation({ summary: '原価台帳一覧' })
  findAllCostLedger(@Query() query: SearchCostLedgerDto) {
    return this.accountingService.findAllCostLedger(query);
  }

  @Get('cost-ledger/summary/:projectId')
  @ApiOperation({ summary: '案件別原価集計' })
  getCostSummary(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.accountingService.getCostSummary(projectId);
  }
}
