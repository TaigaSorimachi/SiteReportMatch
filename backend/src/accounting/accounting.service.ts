import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SearchInvoiceDto } from './dto/search-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { SearchPayrollDto } from './dto/search-payroll.dto';
import { SearchCostLedgerDto } from './dto/search-cost-ledger.dto';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Invoice CRUD ───────────────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto) {
    const { lines, ...invoiceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          companyId: invoiceData.companyId,
          clientCompanyId: invoiceData.clientCompanyId,
          projectId: invoiceData.projectId,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: new Date(invoiceData.invoiceDate),
          dueDate: new Date(invoiceData.dueDate),
          billingType: invoiceData.billingType,
          subtotal: BigInt(invoiceData.subtotal),
          taxAmount: BigInt(invoiceData.taxAmount),
          totalAmount: BigInt(invoiceData.totalAmount),
          taxRate: invoiceData.taxRate,
          qualifiedInvoice: invoiceData.qualifiedInvoice,
          invoiceRegNo: invoiceData.invoiceRegNo,
          notes: invoiceData.notes,
          lines: {
            create: lines.map((line) => ({
              lineOrder: line.lineOrder,
              description: line.description,
              quantity: line.quantity,
              unit: line.unit,
              unitPrice: line.unitPrice,
              amount: BigInt(line.amount),
              taxCategory: line.taxCategory ?? 'taxable',
              accountId: line.accountId,
              projectPhaseId: line.projectPhaseId,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return this.serializeInvoice(invoice);
    });
  }

  async findAllInvoices(query: SearchInvoiceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.companyId) where.companyId = query.companyId;
    if (query.clientCompanyId) where.clientCompanyId = query.clientCompanyId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.invoiceDate = {};
      if (query.dateFrom) where.invoiceDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.invoiceDate.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, companyName: true } },
          clientCompany: { select: { id: true, companyName: true } },
          project: { select: { id: true, projectName: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return PaginatedResponse.create(
      data.map((inv) => this.serializeInvoice(inv)),
      total,
      page,
      limit,
    );
  }

  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, isDeleted: false },
      include: {
        company: { select: { id: true, companyName: true } },
        clientCompany: { select: { id: true, companyName: true } },
        project: { select: { id: true, projectName: true } },
        lines: {
          orderBy: { lineOrder: 'asc' },
          include: {
            account: { select: { id: true, accountCode: true, accountName: true } },
            projectPhase: { select: { id: true, phaseName: true } },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return this.serializeInvoice(invoice);
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    const data: any = { ...dto };
    if (dto.invoiceDate) data.invoiceDate = new Date(dto.invoiceDate);
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.subtotal !== undefined) data.subtotal = BigInt(dto.subtotal);
    if (dto.taxAmount !== undefined) data.taxAmount = BigInt(dto.taxAmount);
    if (dto.totalAmount !== undefined) data.totalAmount = BigInt(dto.totalAmount);

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        lines: { orderBy: { lineOrder: 'asc' } },
      },
    });

    return this.serializeInvoice(invoice);
  }

  async issueInvoice(id: string) {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft invoices can be issued');
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'issued',
        issuedAt: new Date(),
      },
      include: {
        lines: { orderBy: { lineOrder: 'asc' } },
      },
    });

    return this.serializeInvoice(invoice);
  }

  async addPayment(invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, isDeleted: false },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
    }

    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Cannot add payment to a cancelled invoice');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.paymentReceived.create({
        data: {
          invoiceId,
          paymentDate: new Date(dto.paymentDate),
          amount: BigInt(dto.amount),
          paymentMethod: dto.paymentMethod,
          bankRef: dto.bankRef,
          notes: dto.notes,
        },
      });

      // Calculate total payments including new one
      const existingTotal = invoice.payments.reduce(
        (sum, p) => sum + p.amount,
        BigInt(0),
      );
      const newTotal = existingTotal + BigInt(dto.amount);

      // If total payments >= totalAmount, mark invoice as paid
      if (newTotal >= invoice.totalAmount) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });
      }

      return this.serializePayment(payment);
    });
  }

  // ─── Payroll CRUD ───────────────────────────────────────────────────

  async createPayroll(dto: CreatePayrollDto) {
    const { lines, ...payrollData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: {
          companyId: payrollData.companyId,
          workerId: payrollData.workerId,
          periodStart: new Date(payrollData.periodStart),
          periodEnd: new Date(payrollData.periodEnd),
          paymentDate: payrollData.paymentDate
            ? new Date(payrollData.paymentDate)
            : undefined,
          grossAmount: BigInt(payrollData.grossAmount),
          withholdingTax: payrollData.withholdingTax !== undefined
            ? BigInt(payrollData.withholdingTax)
            : BigInt(0),
          deductions: payrollData.deductions !== undefined
            ? BigInt(payrollData.deductions)
            : BigInt(0),
          netAmount: BigInt(payrollData.netAmount),
          notes: payrollData.notes,
          lines: {
            create: lines.map((line) => ({
              projectId: line.projectId,
              assignmentId: line.assignmentId,
              workDate: line.workDate ? new Date(line.workDate) : undefined,
              manDays: line.manDays,
              dailyRate: line.dailyRate,
              amount: BigInt(line.amount),
              description: line.description,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return this.serializePayroll(payroll);
    });
  }

  async findAllPayroll(query: SearchPayrollDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.companyId) where.companyId = query.companyId;
    if (query.workerId) where.workerId = query.workerId;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.periodStart = {};
      if (query.dateFrom) where.periodStart.gte = new Date(query.dateFrom);
      if (query.dateTo) where.periodStart.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, companyName: true } },
          worker: { select: { id: true, lastName: true, firstName: true } },
        },
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return PaginatedResponse.create(
      data.map((p) => this.serializePayroll(p)),
      total,
      page,
      limit,
    );
  }

  async confirmPayroll(id: string) {
    const existing = await this.prisma.payroll.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Payroll with id ${id} not found`);
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft payroll can be confirmed');
    }

    const payroll = await this.prisma.payroll.update({
      where: { id },
      data: { status: 'confirmed' },
      include: { lines: true },
    });

    return this.serializePayroll(payroll);
  }

  async payPayroll(id: string) {
    const existing = await this.prisma.payroll.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Payroll with id ${id} not found`);
    }

    if (existing.status !== 'confirmed') {
      throw new BadRequestException('Only confirmed payroll can be paid');
    }

    const payroll = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
      include: { lines: true },
    });

    return this.serializePayroll(payroll);
  }

  // ─── Cost Ledger ────────────────────────────────────────────────────

  async findAllCostLedger(query: SearchCostLedgerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.companyId) where.companyId = query.companyId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.costCategory) where.costCategory = query.costCategory;
    if (query.dateFrom || query.dateTo) {
      where.transactionDate = {};
      if (query.dateFrom) where.transactionDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.transactionDate.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.costLedger.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          project: { select: { id: true, projectName: true } },
          account: { select: { id: true, accountCode: true, accountName: true } },
        },
      }),
      this.prisma.costLedger.count({ where }),
    ]);

    return PaginatedResponse.create(
      data.map((entry) => this.serializeCostLedger(entry)),
      total,
      page,
      limit,
    );
  }

  async getCostSummary(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, isDeleted: false },
      select: {
        id: true,
        projectName: true,
        contractAmount: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    const costGroups = await this.prisma.costLedger.groupBy({
      by: ['costCategory'],
      where: { projectId },
      _sum: { amount: true },
    });

    const categoryMap: Record<string, bigint> = {};
    for (const group of costGroups) {
      categoryMap[group.costCategory] = group._sum.amount ?? BigInt(0);
    }

    const laborCost = Number(categoryMap['labor'] ?? BigInt(0));
    const materialCost = Number(categoryMap['material'] ?? BigInt(0));
    const equipmentCost = Number(categoryMap['equipment'] ?? BigInt(0));
    const transportCost = Number(categoryMap['transport'] ?? BigInt(0));
    const otherCost = Number(categoryMap['other'] ?? BigInt(0));
    const totalCost = laborCost + materialCost + equipmentCost + transportCost + otherCost;

    const contractAmount = project.contractAmount ? Number(project.contractAmount) : null;
    const profitMargin =
      contractAmount && contractAmount > 0
        ? Math.round(((contractAmount - totalCost) / contractAmount) * 10000) / 100
        : null;

    return {
      projectId: project.id,
      projectName: project.projectName,
      laborCost,
      materialCost,
      equipmentCost,
      transportCost,
      otherCost,
      totalCost,
      contractAmount,
      profitMargin,
    };
  }

  // ─── Serialization helpers ──────────────────────────────────────────

  private serializeInvoice(invoice: any) {
    return JSON.parse(
      JSON.stringify(invoice, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  private serializePayroll(payroll: any) {
    return JSON.parse(
      JSON.stringify(payroll, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  private serializePayment(payment: any) {
    return JSON.parse(
      JSON.stringify(payment, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  private serializeCostLedger(entry: any) {
    return JSON.parse(
      JSON.stringify(entry, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }
}
