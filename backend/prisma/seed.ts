import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 工種マスタ（大分類）
  const workTypes = [
    { workTypeName: '左官工事', category: 'finishing', level: 1, sortOrder: 10 },
    { workTypeName: '塗装工事', category: 'finishing', level: 1, sortOrder: 20 },
    { workTypeName: 'タイル工事', category: 'finishing', level: 1, sortOrder: 30 },
    { workTypeName: '防水工事', category: 'finishing', level: 1, sortOrder: 40 },
    { workTypeName: '内装仕上げ', category: 'finishing', level: 1, sortOrder: 50 },
    { workTypeName: '基礎工事', category: 'structural', level: 1, sortOrder: 60 },
    { workTypeName: '型枠工事', category: 'structural', level: 1, sortOrder: 70 },
    { workTypeName: '鉄筋工事', category: 'structural', level: 1, sortOrder: 80 },
    { workTypeName: 'とび工事', category: 'structural', level: 1, sortOrder: 90 },
    { workTypeName: '電気工事', category: 'electrical', level: 1, sortOrder: 100 },
    { workTypeName: '管工事', category: 'equipment', level: 1, sortOrder: 110 },
    { workTypeName: '空調設備', category: 'equipment', level: 1, sortOrder: 120 },
    { workTypeName: '土木工事', category: 'civil', level: 1, sortOrder: 130 },
    { workTypeName: '解体工事', category: 'civil', level: 1, sortOrder: 140 },
  ];

  const wtResult = await prisma.workTypeMaster.createMany({
    data: workTypes,
    skipDuplicates: true,
  });
  console.log(`Seeded ${wtResult.count} work types`);

  // 構造マスタ
  const structures = [
    { structureName: 'RC造', sortOrder: 10 },
    { structureName: 'S造', sortOrder: 20 },
    { structureName: 'SRC造', sortOrder: 30 },
    { structureName: '木造', sortOrder: 40 },
    { structureName: 'その他', sortOrder: 90 },
  ];

  const stResult = await prisma.structureMaster.createMany({
    data: structures,
    skipDuplicates: true,
  });
  console.log(`Seeded ${stResult.count} structures`);

  // 勘定科目マスタ
  const accounts = [
    { accountCode: '4100', accountName: '完成工事高', accountType: 'revenue' },
    { accountCode: '5100', accountName: '材料費', accountType: 'cost' },
    { accountCode: '5200', accountName: '労務費', accountType: 'cost' },
    { accountCode: '5210', accountName: '労務費（自社）', accountType: 'cost' },
    { accountCode: '5220', accountName: '労務外注費', accountType: 'cost' },
    { accountCode: '5300', accountName: '外注費', accountType: 'cost' },
    { accountCode: '5400', accountName: '経費', accountType: 'cost' },
    { accountCode: '5410', accountName: '機械等経費', accountType: 'cost' },
    { accountCode: '5420', accountName: '運搬費', accountType: 'cost' },
    { accountCode: '5440', accountName: '安全対策費', accountType: 'cost' },
    { accountCode: '5490', accountName: 'その他経費', accountType: 'cost' },
  ];

  const acResult = await prisma.accountMaster.createMany({
    data: accounts,
    skipDuplicates: true,
  });
  console.log(`Seeded ${acResult.count} account masters`);

  // ── デモ会社 ──
  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      companyName: 'デモ建設株式会社',
      companyType: 'general_contractor',
      corporateNumber: '1234567890123',
      representative: '山田太郎',
      postalCode: '100-0001',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      email: 'info@demo-kensetsu.co.jp',
    },
  });
  console.log(`Company: ${company.companyName}`);

  // ── 管理者 (開発者) ──
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000009' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000009',
      email: 'admin@demo.com',
      passwordHash: adminHash,
      firstName: '運営',
      lastName: '管理者',
      role: 'admin',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // ── オーナー (会社オーナー) ──
  const ownerHash = await bcrypt.hash('owner123', 12);
  const owner = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      companyId: company.id,
      lineUserId: 'demo-owner',
      email: 'owner@demo.com',
      passwordHash: ownerHash,
      firstName: '太郎',
      lastName: '山田',
      role: 'owner',
    },
  });
  console.log(`Owner user: ${owner.email}`);

  // ── デモユーザー (作業者) ──
  const worker = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      companyId: company.id,
      lineUserId: 'demo-worker',
      email: 'worker@demo.com',
      firstName: '花子',
      lastName: '佐藤',
      role: 'worker',
    },
  });
  console.log(`Worker user: ${worker.email}`);

  // ── デモ案件 ──
  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      companyId: company.id,
      projectName: '渋谷駅前再開発ビル新築工事',
      siteName: '渋谷駅前再開発現場',
      siteAddress: '東京都渋谷区渋谷2-1-1',
      siteLat: 35.6580,
      siteLng: 139.7016,
      geofenceRadiusM: 200,
      scheduledStart: new Date('2026-01-15'),
      scheduledEnd: new Date('2026-12-31'),
      status: 'active',
      contractAmount: 150000000,
    },
  });
  console.log(`Project: ${project.projectName}`);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
