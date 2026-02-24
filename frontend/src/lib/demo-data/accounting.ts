import { uuid } from './helpers';
import type { Invoice, Payroll, CostLedgerEntry, CostSummary } from '@/types/api';

export const invoices: Invoice[] = [
  {
    id: uuid(950), companyId: uuid(1), clientCompanyId: uuid(2), projectId: uuid(20),
    invoiceNumber: 'INV-2026-001', invoiceDate: '2026-01-31', dueDate: '2026-02-28',
    status: 'paid', subtotal: 2500000, taxAmount: 250000, totalAmount: 2750000,
    lines: [
      { id: uuid(955), invoiceId: uuid(950), lineOrder: 1, description: '電気工事 伊藤大輔 1月分（20日）', quantity: 20, unit: '人工', unitPrice: 25000, amount: 500000 },
      { id: uuid(956), invoiceId: uuid(950), lineOrder: 2, description: '電気工事 渡辺翔太 1月分（20日）', quantity: 20, unit: '人工', unitPrice: 19000, amount: 380000 },
      { id: uuid(957), invoiceId: uuid(950), lineOrder: 3, description: '電気資材費', quantity: 1, unit: '式', unitPrice: 1620000, amount: 1620000 },
    ],
    payments: [
      { id: uuid(958), invoiceId: uuid(950), paymentDate: '2026-02-25', amount: 2750000, paymentMethod: 'bank_transfer' },
    ],
    createdAt: '2026-01-31T00:00:00.000Z',
  },
  {
    id: uuid(951), companyId: uuid(1), clientCompanyId: uuid(3), projectId: uuid(21),
    invoiceNumber: 'INV-2026-002', invoiceDate: '2026-02-28', dueDate: '2026-03-31',
    status: 'issued', subtotal: 1150000, taxAmount: 115000, totalAmount: 1265000,
    lines: [
      { id: uuid(959), invoiceId: uuid(951), lineOrder: 1, description: '左官工事 小林正和 2月分（18日）', quantity: 18, unit: '人工', unitPrice: 23000, amount: 414000 },
      { id: uuid(960), invoiceId: uuid(951), lineOrder: 2, description: '左官工事 加藤美咲 2月分（18日）', quantity: 18, unit: '人工', unitPrice: 18000, amount: 324000 },
      { id: uuid(961), invoiceId: uuid(951), lineOrder: 3, description: '左官資材費（モルタル・補修材等）', quantity: 1, unit: '式', unitPrice: 412000, amount: 412000 },
    ],
    payments: [],
    createdAt: '2026-02-28T00:00:00.000Z',
  },
];

export const payrolls: Payroll[] = [
  {
    id: uuid(970), companyId: uuid(1), workerId: uuid(13),
    periodStart: '2026-01-01', periodEnd: '2026-01-31', paymentDate: '2026-02-25',
    status: 'paid', grossAmount: 440000, withholdingTax: 22000, deductions: 0, netAmount: 418000,
    worker: { id: uuid(13), companyId: uuid(1), lastName: '田中', firstName: '健一', role: 'worker', createdAt: '' },
    lines: [
      { id: uuid(971), payrollId: uuid(970), lineOrder: 1, description: '渋谷再開発 型枠工事（20日）', amount: 440000 },
    ],
    createdAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: uuid(972), companyId: uuid(1), workerId: uuid(11),
    periodStart: '2026-01-01', periodEnd: '2026-01-31', paymentDate: '2026-02-25',
    status: 'paid', grossAmount: 360000, withholdingTax: 18000, deductions: 0, netAmount: 342000,
    worker: { id: uuid(11), companyId: uuid(1), lastName: '佐藤', firstName: '花子', role: 'worker', createdAt: '' },
    lines: [
      { id: uuid(973), payrollId: uuid(972), lineOrder: 1, description: '渋谷再開発 内装仕上げ（20日）', amount: 360000 },
    ],
    createdAt: '2026-02-20T00:00:00.000Z',
  },
];

export const costLedgerEntries: CostLedgerEntry[] = [
  { id: uuid(980), projectId: uuid(20), costCategory: 'labor', amount: 440000, transactionDate: '2026-01-31', description: '1月分 労務費（型枠工・田中）' },
  { id: uuid(981), projectId: uuid(20), costCategory: 'labor', amount: 360000, transactionDate: '2026-01-31', description: '1月分 労務費（内装・佐藤）' },
  { id: uuid(982), projectId: uuid(20), costCategory: 'subcontract', amount: 2500000, transactionDate: '2026-01-31', description: '1月分 電気工事外注費（東京電設）' },
  { id: uuid(983), projectId: uuid(20), costCategory: 'material', amount: 850000, transactionDate: '2026-02-05', description: '型枠用合板・金物' },
  { id: uuid(984), projectId: uuid(20), costCategory: 'equipment', amount: 1200000, transactionDate: '2026-02-10', description: 'クレーンリース料（2月分）' },
  { id: uuid(985), projectId: uuid(21), costCategory: 'labor', amount: 738000, transactionDate: '2026-02-28', description: '2月分 左官工事労務費' },
  { id: uuid(986), projectId: uuid(21), costCategory: 'material', amount: 412000, transactionDate: '2026-02-15', description: 'モルタル・補修材・塗料' },
  { id: uuid(987), projectId: uuid(21), costCategory: 'equipment', amount: 580000, transactionDate: '2026-02-03', description: '足場リース料' },
];

export function getCostSummary(projectId: string): CostSummary {
  const entries = costLedgerEntries.filter(e => e.projectId === projectId);
  const totalCost = entries.reduce((sum, e) => sum + e.amount, 0);
  const byCategory: Record<string, number> = {};
  for (const e of entries) {
    byCategory[e.costCategory] = (byCategory[e.costCategory] || 0) + e.amount;
  }
  return {
    projectId,
    totalCost,
    byCategory: Object.entries(byCategory).map(([category, total]) => ({ category, total })),
  };
}
