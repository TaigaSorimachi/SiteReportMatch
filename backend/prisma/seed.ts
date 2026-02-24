import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── 固定UUID生成ヘルパー ──
function uuid(n: number): string {
  return `00000000-0000-0000-0000-${n.toString().padStart(12, '0')}`;
}

async function main() {
  // ==================================================================
  // マスタデータ
  // ==================================================================

  // 工種マスタ（大分類）
  const workTypes = [
    { id: uuid(100), workTypeName: '左官工事', category: 'finishing', level: 1, sortOrder: 10 },
    { id: uuid(101), workTypeName: '塗装工事', category: 'finishing', level: 1, sortOrder: 20 },
    { id: uuid(102), workTypeName: 'タイル工事', category: 'finishing', level: 1, sortOrder: 30 },
    { id: uuid(103), workTypeName: '防水工事', category: 'finishing', level: 1, sortOrder: 40 },
    { id: uuid(104), workTypeName: '内装仕上げ', category: 'finishing', level: 1, sortOrder: 50 },
    { id: uuid(105), workTypeName: '基礎工事', category: 'structural', level: 1, sortOrder: 60 },
    { id: uuid(106), workTypeName: '型枠工事', category: 'structural', level: 1, sortOrder: 70 },
    { id: uuid(107), workTypeName: '鉄筋工事', category: 'structural', level: 1, sortOrder: 80 },
    { id: uuid(108), workTypeName: 'とび工事', category: 'structural', level: 1, sortOrder: 90 },
    { id: uuid(109), workTypeName: '電気工事', category: 'electrical', level: 1, sortOrder: 100 },
    { id: uuid(110), workTypeName: '管工事', category: 'equipment', level: 1, sortOrder: 110 },
    { id: uuid(111), workTypeName: '空調設備', category: 'equipment', level: 1, sortOrder: 120 },
    { id: uuid(112), workTypeName: '土木工事', category: 'civil', level: 1, sortOrder: 130 },
    { id: uuid(113), workTypeName: '解体工事', category: 'civil', level: 1, sortOrder: 140 },
  ];

  for (const wt of workTypes) {
    await prisma.workTypeMaster.upsert({
      where: { id: wt.id },
      update: {},
      create: wt,
    });
  }
  console.log(`Seeded ${workTypes.length} work types`);

  // 構造マスタ
  const structures = [
    { id: uuid(200), structureName: 'RC造', sortOrder: 10 },
    { id: uuid(201), structureName: 'S造', sortOrder: 20 },
    { id: uuid(202), structureName: 'SRC造', sortOrder: 30 },
    { id: uuid(203), structureName: '木造', sortOrder: 40 },
    { id: uuid(204), structureName: 'その他', sortOrder: 90 },
  ];

  for (const st of structures) {
    await prisma.structureMaster.upsert({
      where: { id: st.id },
      update: {},
      create: st,
    });
  }
  console.log(`Seeded ${structures.length} structures`);

  // 資格マスタ
  const licenses = [
    { id: uuid(300), licenseName: '一級建築施工管理技士', licenseCategory: '施工管理', hasExpiry: false, sortOrder: 10 },
    { id: uuid(301), licenseName: '二級建築施工管理技士', licenseCategory: '施工管理', hasExpiry: false, sortOrder: 20 },
    { id: uuid(302), licenseName: '一級土木施工管理技士', licenseCategory: '施工管理', hasExpiry: false, sortOrder: 30 },
    { id: uuid(303), licenseName: '玉掛け技能講習', licenseCategory: '技能講習', hasExpiry: false, sortOrder: 40 },
    { id: uuid(304), licenseName: '足場の組立て等作業主任者', licenseCategory: '技能講習', hasExpiry: false, sortOrder: 50 },
    { id: uuid(305), licenseName: '第一種電気工事士', licenseCategory: '電気', hasExpiry: true, renewalMonths: 60, sortOrder: 60 },
    { id: uuid(306), licenseName: '第二種電気工事士', licenseCategory: '電気', hasExpiry: false, sortOrder: 70 },
    { id: uuid(307), licenseName: 'フォークリフト運転技能講習', licenseCategory: '運転', hasExpiry: false, sortOrder: 80 },
    { id: uuid(308), licenseName: '車両系建設機械運転技能講習', licenseCategory: '運転', hasExpiry: false, sortOrder: 90 },
    { id: uuid(309), licenseName: '酸素欠乏危険作業主任者', licenseCategory: '安全', hasExpiry: false, sortOrder: 100 },
  ];

  for (const lic of licenses) {
    await prisma.licenseMaster.upsert({
      where: { id: lic.id },
      update: {},
      create: lic,
    });
  }
  console.log(`Seeded ${licenses.length} licenses`);

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

  // ==================================================================
  // 会社データ（3社）
  // ==================================================================

  const company1 = await prisma.company.upsert({
    where: { id: uuid(1) },
    update: {},
    create: {
      id: uuid(1),
      companyName: 'デモ建設株式会社',
      companyNameKana: 'デモケンセツカブシキガイシャ',
      companyType: 'general_contractor',
      corporateNumber: '1234567890123',
      representative: '山田太郎',
      postalCode: '100-0001',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      fax: '03-1234-5679',
      email: 'info@demo-kensetsu.co.jp',
      website: 'https://demo-kensetsu.co.jp',
      invoiceRegNo: 'T1234567890123',
      bankName: '三菱UFJ銀行',
      bankBranch: '丸の内支店',
      bankAccountType: '普通',
      bankAccountNo: '1234567',
      bankAccountName: 'デモケンセツ（カ',
      paymentTerms: '月末締め翌月末払い',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: uuid(2) },
    update: {},
    create: {
      id: uuid(2),
      companyName: '東京電設工業株式会社',
      companyNameKana: 'トウキョウデンセツコウギョウカブシキガイシャ',
      companyType: 'subcontractor',
      corporateNumber: '9876543210987',
      representative: '鈴木一郎',
      postalCode: '150-0002',
      address: '東京都渋谷区渋谷3-5-10',
      phone: '03-9876-5432',
      email: 'info@tokyo-densetsu.co.jp',
      bankName: 'みずほ銀行',
      bankBranch: '渋谷支店',
      bankAccountType: '普通',
      bankAccountNo: '7654321',
      bankAccountName: 'トウキョウデンセツコウギョウ（カ',
      paymentTerms: '月末締め翌月25日払い',
    },
  });

  const company3 = await prisma.company.upsert({
    where: { id: uuid(3) },
    update: {},
    create: {
      id: uuid(3),
      companyName: '関東左官工業有限会社',
      companyNameKana: 'カントウサカンコウギョウユウゲンガイシャ',
      companyType: 'subcontractor',
      corporateNumber: '5555666677778',
      representative: '田中義男',
      postalCode: '330-0801',
      address: '埼玉県さいたま市大宮区土手町1-2-3',
      phone: '048-123-4567',
      email: 'info@kanto-sakan.co.jp',
      bankName: '埼玉りそな銀行',
      bankBranch: '大宮支店',
      bankAccountType: '普通',
      bankAccountNo: '3456789',
      bankAccountName: 'カントウサカンコウギョウ（ユ',
      paymentTerms: '月末締め翌月末払い',
    },
  });

  console.log(`Companies: ${company1.companyName}, ${company2.companyName}, ${company3.companyName}`);

  // 会社設定
  for (const cid of [uuid(1), uuid(2), uuid(3)]) {
    await prisma.companySetting.upsert({
      where: { companyId: cid },
      update: {},
      create: {
        companyId: cid,
        gpsEnabled: true,
        geofenceEnabled: true,
        geofenceRadiusM: 300,
        matchingEnabled: true,
        requirePhoto: cid === uuid(1),
      },
    });
  }

  // ==================================================================
  // ユーザー（管理者1 + オーナー2 + 作業者8 = 11名）
  // ==================================================================

  const adminHash = await bcrypt.hash('admin123', 12);
  const ownerHash = await bcrypt.hash('owner123', 12);

  // 管理者
  const admin = await prisma.user.upsert({
    where: { id: uuid(9) },
    update: { email: 'admin@demo.com', passwordHash: adminHash, firstName: '運営', lastName: '管理者', role: 'admin' },
    create: {
      id: uuid(9),
      email: 'admin@demo.com',
      passwordHash: adminHash,
      firstName: '運営',
      lastName: '管理者',
      role: 'admin',
      phone: '090-0000-0001',
    },
  });
  console.log(`Admin: ${admin.email}`);

  // オーナー1: デモ建設
  const owner1 = await prisma.user.upsert({
    where: { id: uuid(10) },
    update: { companyId: company1.id, lineUserId: 'demo-owner', email: 'owner@demo.com', passwordHash: ownerHash, firstName: '太郎', lastName: '山田', role: 'owner' },
    create: {
      id: uuid(10),
      companyId: company1.id,
      lineUserId: 'demo-owner',
      email: 'owner@demo.com',
      passwordHash: ownerHash,
      firstName: '太郎',
      lastName: '山田',
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      role: 'owner',
      phone: '090-1111-2222',
    },
  });

  // オーナー2: 東京電設
  const owner2 = await prisma.user.upsert({
    where: { id: uuid(12) },
    update: {},
    create: {
      id: uuid(12),
      companyId: company2.id,
      email: 'suzuki@tokyo-densetsu.co.jp',
      passwordHash: ownerHash,
      firstName: '一郎',
      lastName: '鈴木',
      lastNameKana: 'スズキ',
      firstNameKana: 'イチロウ',
      role: 'owner',
      phone: '090-3333-4444',
    },
  });

  // 作業者たち
  const workers = [
    { id: uuid(11), companyId: company1.id, lineUserId: 'demo-worker', email: 'worker@demo.com', firstName: '花子', lastName: '佐藤', lastNameKana: 'サトウ', firstNameKana: 'ハナコ', phone: '090-2222-3333', defaultDailyRate: 18000, gender: 'female', birthDate: new Date('1990-05-15') },
    { id: uuid(13), companyId: company1.id, lineUserId: 'worker-tanaka', email: 'tanaka@demo-kensetsu.co.jp', firstName: '健一', lastName: '田中', lastNameKana: 'タナカ', firstNameKana: 'ケンイチ', phone: '090-4444-5555', defaultDailyRate: 22000, gender: 'male', birthDate: new Date('1985-03-20') },
    { id: uuid(14), companyId: company1.id, lineUserId: 'worker-takahashi', email: 'takahashi@demo-kensetsu.co.jp', firstName: '勇気', lastName: '高橋', lastNameKana: 'タカハシ', firstNameKana: 'ユウキ', phone: '090-5555-6666', defaultDailyRate: 20000, gender: 'male', birthDate: new Date('1988-11-08') },
    { id: uuid(15), companyId: company2.id, lineUserId: 'worker-ito', email: 'ito@tokyo-densetsu.co.jp', firstName: '大輔', lastName: '伊藤', lastNameKana: 'イトウ', firstNameKana: 'ダイスケ', phone: '090-6666-7777', defaultDailyRate: 25000, gender: 'male', birthDate: new Date('1982-07-12') },
    { id: uuid(16), companyId: company2.id, lineUserId: 'worker-watanabe', email: 'watanabe@tokyo-densetsu.co.jp', firstName: '翔太', lastName: '渡辺', lastNameKana: 'ワタナベ', firstNameKana: 'ショウタ', phone: '090-7777-8888', defaultDailyRate: 19000, gender: 'male', birthDate: new Date('1995-01-25') },
    { id: uuid(17), companyId: company3.id, lineUserId: 'worker-kobayashi', email: 'kobayashi@kanto-sakan.co.jp', firstName: '正和', lastName: '小林', lastNameKana: 'コバヤシ', firstNameKana: 'マサカズ', phone: '090-8888-9999', defaultDailyRate: 23000, gender: 'male', birthDate: new Date('1978-09-30') },
    { id: uuid(18), companyId: company3.id, lineUserId: 'worker-kato', email: 'kato@kanto-sakan.co.jp', firstName: '美咲', lastName: '加藤', lastNameKana: 'カトウ', firstNameKana: 'ミサキ', phone: '090-9999-0000', defaultDailyRate: 18000, gender: 'female', birthDate: new Date('1993-04-18') },
    { id: uuid(19), companyId: company1.id, lineUserId: 'worker-yoshida', email: 'yoshida@demo-kensetsu.co.jp', firstName: '隆司', lastName: '吉田', lastNameKana: 'ヨシダ', firstNameKana: 'タカシ', phone: '090-1111-0000', defaultDailyRate: 21000, gender: 'male', birthDate: new Date('1987-12-05') },
  ];

  for (const w of workers) {
    await prisma.user.upsert({
      where: { id: w.id },
      update: { companyId: w.companyId, lineUserId: w.lineUserId, email: w.email, firstName: w.firstName, lastName: w.lastName, role: 'worker' },
      create: { ...w, role: 'worker' },
    });
  }
  console.log(`Seeded ${workers.length} workers + 1 admin + 2 owners`);

  // ==================================================================
  // 作業者プロフィール
  // ==================================================================
  const workerProfiles = [
    { userId: uuid(11), experienceYears: 5, skillLevel: 'intermediate', specialties: '内装仕上げ、塗装', preferredArea: '東京都23区', maxCommuteKm: 30, hasVehicle: false, totalProjects: 15, totalWorkDays: 280, avgRating: 4.2, attendanceRate: 98.5 },
    { userId: uuid(13), experienceYears: 12, skillLevel: 'expert', specialties: '型枠工事、基礎工事、鉄筋工事', preferredArea: '東京都・神奈川県', maxCommuteKm: 50, hasVehicle: true, hasOwnTools: true, totalProjects: 45, totalWorkDays: 1200, avgRating: 4.8, attendanceRate: 99.2 },
    { userId: uuid(14), experienceYears: 8, skillLevel: 'advanced', specialties: 'とび工事、鉄筋工事', preferredArea: '東京都・埼玉県', maxCommuteKm: 40, hasVehicle: true, totalProjects: 28, totalWorkDays: 650, avgRating: 4.5, attendanceRate: 97.8 },
    { userId: uuid(15), experienceYears: 15, skillLevel: 'expert', specialties: '電気工事全般、受変電設備', preferredArea: '東京都・千葉県', maxCommuteKm: 60, hasVehicle: true, hasOwnTools: true, totalProjects: 60, totalWorkDays: 2000, avgRating: 4.9, attendanceRate: 99.5 },
    { userId: uuid(16), experienceYears: 3, skillLevel: 'intermediate', specialties: '電気配線、照明設備', preferredArea: '東京都', maxCommuteKm: 25, hasVehicle: false, totalProjects: 8, totalWorkDays: 180, avgRating: 4.0, attendanceRate: 96.0 },
    { userId: uuid(17), experienceYears: 20, skillLevel: 'expert', specialties: '左官工事、タイル工事、防水工事', preferredArea: '埼玉県・東京都', maxCommuteKm: 50, hasVehicle: true, hasOwnTools: true, canDriveTruck: true, totalProjects: 80, totalWorkDays: 3500, avgRating: 4.9, attendanceRate: 99.8 },
    { userId: uuid(18), experienceYears: 4, skillLevel: 'intermediate', specialties: '左官仕上げ、内装', preferredArea: '埼玉県', maxCommuteKm: 30, hasVehicle: false, totalProjects: 10, totalWorkDays: 220, avgRating: 4.3, attendanceRate: 97.0 },
    { userId: uuid(19), experienceYears: 10, skillLevel: 'advanced', specialties: '管工事、空調設備', preferredArea: '東京都', maxCommuteKm: 40, hasVehicle: true, hasOwnTools: true, totalProjects: 35, totalWorkDays: 900, avgRating: 4.6, attendanceRate: 98.0 },
  ];

  for (const wp of workerProfiles) {
    await prisma.workerProfile.upsert({
      where: { userId: wp.userId },
      update: {},
      create: wp,
    });
  }
  console.log(`Seeded ${workerProfiles.length} worker profiles`);

  // ==================================================================
  // 作業者スキル（工種紐付け）
  // ==================================================================
  const workerSkills = [
    { userId: uuid(11), workTypeId: uuid(104) }, // 佐藤 → 内装仕上げ
    { userId: uuid(11), workTypeId: uuid(101) }, // 佐藤 → 塗装
    { userId: uuid(13), workTypeId: uuid(106) }, // 田中 → 型枠
    { userId: uuid(13), workTypeId: uuid(105) }, // 田中 → 基礎
    { userId: uuid(13), workTypeId: uuid(107) }, // 田中 → 鉄筋
    { userId: uuid(14), workTypeId: uuid(108) }, // 高橋 → とび
    { userId: uuid(14), workTypeId: uuid(107) }, // 高橋 → 鉄筋
    { userId: uuid(15), workTypeId: uuid(109) }, // 伊藤 → 電気
    { userId: uuid(16), workTypeId: uuid(109) }, // 渡辺 → 電気
    { userId: uuid(17), workTypeId: uuid(100) }, // 小林 → 左官
    { userId: uuid(17), workTypeId: uuid(102) }, // 小林 → タイル
    { userId: uuid(17), workTypeId: uuid(103) }, // 小林 → 防水
    { userId: uuid(18), workTypeId: uuid(100) }, // 加藤 → 左官
    { userId: uuid(18), workTypeId: uuid(104) }, // 加藤 → 内装
    { userId: uuid(19), workTypeId: uuid(110) }, // 吉田 → 管工事
    { userId: uuid(19), workTypeId: uuid(111) }, // 吉田 → 空調
  ];

  for (const ws of workerSkills) {
    await prisma.workerSkill.upsert({
      where: { userId_workTypeId: { userId: ws.userId, workTypeId: ws.workTypeId } },
      update: {},
      create: { ...ws, proficiency: 'expert', yearsExperience: 5 },
    });
  }
  console.log(`Seeded ${workerSkills.length} worker skills`);

  // ==================================================================
  // 保有資格
  // ==================================================================
  const userLicenses = [
    { userId: uuid(13), licenseId: uuid(300), licenseNumber: '1施-2020-12345', issuedDate: new Date('2020-06-15'), isVerified: true },
    { userId: uuid(13), licenseId: uuid(303), issuedDate: new Date('2015-04-10'), isVerified: true },
    { userId: uuid(14), licenseId: uuid(304), issuedDate: new Date('2018-09-20'), isVerified: true },
    { userId: uuid(14), licenseId: uuid(303), issuedDate: new Date('2017-03-15'), isVerified: true },
    { userId: uuid(15), licenseId: uuid(305), licenseNumber: '1電-2019-67890', issuedDate: new Date('2019-11-01'), expiryDate: new Date('2029-11-01'), isVerified: true },
    { userId: uuid(15), licenseId: uuid(300), licenseNumber: '1施-2018-11111', issuedDate: new Date('2018-03-20'), isVerified: true },
    { userId: uuid(16), licenseId: uuid(306), issuedDate: new Date('2022-05-10'), isVerified: true },
    { userId: uuid(17), licenseId: uuid(301), licenseNumber: '2施-2010-22222', issuedDate: new Date('2010-08-15'), isVerified: true },
    { userId: uuid(17), licenseId: uuid(309), issuedDate: new Date('2012-02-28'), isVerified: true },
    { userId: uuid(19), licenseId: uuid(302), licenseNumber: '1土-2017-33333', issuedDate: new Date('2017-06-10'), isVerified: true },
  ];

  for (const ul of userLicenses) {
    await prisma.userLicense.upsert({
      where: { userId_licenseId: { userId: ul.userId, licenseId: ul.licenseId } },
      update: {},
      create: ul,
    });
  }
  console.log(`Seeded ${userLicenses.length} user licenses`);

  // ==================================================================
  // 案件データ（5案件）
  // ==================================================================

  const project1 = await prisma.project.upsert({
    where: { id: uuid(20) },
    update: {},
    create: {
      id: uuid(20),
      companyId: company1.id,
      projectCode: 'PRJ-2026-001',
      projectName: '渋谷駅前再開発ビル新築工事',
      description: '渋谷駅前の大規模再開発プロジェクト。地上32階・地下3階のオフィス・商業複合ビル新築工事。',
      siteName: '渋谷駅前再開発現場',
      sitePostalCode: '150-0002',
      sitePrefecture: '東京都',
      siteCity: '渋谷区',
      siteAddress: '渋谷2-1-1',
      siteLat: 35.6580,
      siteLng: 139.7016,
      geofenceRadiusM: 200,
      structureId: uuid(202), // SRC造
      floorCount: 32,
      propertyType: 'office_commercial',
      scheduledStart: new Date('2026-01-15'),
      scheduledEnd: new Date('2027-12-31'),
      actualStart: new Date('2026-01-20'),
      status: 'active',
      contractAmount: 1500000000,
      estimatedCost: 1200000000,
      siteManagerId: uuid(10),
      foremanId: uuid(13),
      notes: '大林組JV。安全管理重点工事。',
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: uuid(21) },
    update: {},
    create: {
      id: uuid(21),
      companyId: company1.id,
      projectCode: 'PRJ-2026-002',
      projectName: '品川マンション大規模修繕工事',
      description: '築15年の14階建てマンションの大規模修繕。外壁補修、防水工事、共用部リニューアル。',
      siteName: '品川グランドハイツ',
      sitePostalCode: '140-0001',
      sitePrefecture: '東京都',
      siteCity: '品川区',
      siteAddress: '北品川3-8-15',
      siteLat: 35.6211,
      siteLng: 139.7400,
      geofenceRadiusM: 150,
      structureId: uuid(200), // RC造
      floorCount: 14,
      propertyType: 'residential',
      scheduledStart: new Date('2026-02-01'),
      scheduledEnd: new Date('2026-08-31'),
      actualStart: new Date('2026-02-03'),
      status: 'active',
      contractAmount: 85000000,
      estimatedCost: 68000000,
      siteManagerId: uuid(10),
      notes: '居住者在宅のため騒音・振動に注意。作業時間 8:00-17:00 厳守。',
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: uuid(22) },
    update: {},
    create: {
      id: uuid(22),
      companyId: company1.id,
      projectCode: 'PRJ-2026-003',
      projectName: '横浜みなとみらい物流倉庫新築工事',
      description: '延べ床面積12,000㎡の大型物流倉庫新築。免震構造採用。',
      siteName: 'みなとみらい物流センター',
      sitePostalCode: '231-0001',
      sitePrefecture: '神奈川県',
      siteCity: '横浜市中区',
      siteAddress: '新港2-3-1',
      siteLat: 35.4542,
      siteLng: 139.6424,
      geofenceRadiusM: 300,
      structureId: uuid(201), // S造
      floorCount: 3,
      propertyType: 'warehouse',
      scheduledStart: new Date('2026-04-01'),
      scheduledEnd: new Date('2027-03-31'),
      status: 'planning',
      contractAmount: 450000000,
      estimatedCost: 360000000,
      notes: '2026年4月着工予定。基本設計完了済み。',
    },
  });

  const project4 = await prisma.project.upsert({
    where: { id: uuid(23) },
    update: {},
    create: {
      id: uuid(23),
      companyId: company2.id,
      projectCode: 'PRJ-2025-010',
      projectName: '新宿オフィスビル電気設備改修工事',
      description: '築25年オフィスビルの電気設備全面改修。受変電設備更新、照明LED化、非常用発電機更新。',
      siteName: '新宿センタービル',
      sitePostalCode: '160-0023',
      sitePrefecture: '東京都',
      siteCity: '新宿区',
      siteAddress: '西新宿1-25-1',
      siteLat: 35.6938,
      siteLng: 139.6917,
      geofenceRadiusM: 200,
      structureId: uuid(200), // RC造
      floorCount: 18,
      propertyType: 'office',
      scheduledStart: new Date('2025-10-01'),
      scheduledEnd: new Date('2026-03-31'),
      actualStart: new Date('2025-10-05'),
      actualEnd: new Date('2026-02-15'),
      status: 'completed',
      contractAmount: 120000000,
      estimatedCost: 96000000,
      siteManagerId: uuid(12),
      notes: '工事完了。竣工検査合格済み。',
    },
  });

  const project5 = await prisma.project.upsert({
    where: { id: uuid(24) },
    update: {},
    create: {
      id: uuid(24),
      companyId: company3.id,
      projectCode: 'PRJ-2026-005',
      projectName: 'さいたま市立第三小学校 外壁補修工事',
      description: '公立小学校の外壁補修・左官工事。夏休み期間中の集中工事。',
      siteName: 'さいたま市立第三小学校',
      sitePostalCode: '330-0061',
      sitePrefecture: '埼玉県',
      siteCity: 'さいたま市浦和区',
      siteAddress: '常盤5-1-8',
      siteLat: 35.8617,
      siteLng: 139.6453,
      geofenceRadiusM: 150,
      structureId: uuid(200), // RC造
      floorCount: 3,
      propertyType: 'school',
      scheduledStart: new Date('2026-07-20'),
      scheduledEnd: new Date('2026-08-25'),
      status: 'planning',
      contractAmount: 28000000,
      estimatedCost: 22000000,
      siteManagerId: uuid(17),
      notes: '夏休み期間限定工事。8/25までに完了必須。',
    },
  });

  console.log('Projects seeded: 5 projects');

  // ==================================================================
  // 工程（フェーズ）
  // ==================================================================
  const phases = [
    { id: uuid(400), projectId: uuid(20), phaseName: '基礎工事', workTypeId: uuid(105), sortOrder: 1, scheduledStart: new Date('2026-01-20'), scheduledEnd: new Date('2026-04-30'), progressPct: 100 },
    { id: uuid(401), projectId: uuid(20), phaseName: '躯体工事（地上）', workTypeId: uuid(106), sortOrder: 2, scheduledStart: new Date('2026-05-01'), scheduledEnd: new Date('2026-12-31'), progressPct: 15 },
    { id: uuid(402), projectId: uuid(20), phaseName: '電気設備工事', workTypeId: uuid(109), sortOrder: 3, scheduledStart: new Date('2026-06-01'), scheduledEnd: new Date('2027-06-30'), progressPct: 5 },
    { id: uuid(403), projectId: uuid(20), phaseName: '内装仕上げ', workTypeId: uuid(104), sortOrder: 4, scheduledStart: new Date('2027-01-01'), scheduledEnd: new Date('2027-10-31'), progressPct: 0 },
    { id: uuid(404), projectId: uuid(21), phaseName: '足場架設', workTypeId: uuid(108), sortOrder: 1, scheduledStart: new Date('2026-02-03'), scheduledEnd: new Date('2026-02-20'), progressPct: 100 },
    { id: uuid(405), projectId: uuid(21), phaseName: '外壁補修・防水', workTypeId: uuid(103), sortOrder: 2, scheduledStart: new Date('2026-02-21'), scheduledEnd: new Date('2026-05-31'), progressPct: 60 },
    { id: uuid(406), projectId: uuid(21), phaseName: '塗装工事', workTypeId: uuid(101), sortOrder: 3, scheduledStart: new Date('2026-04-01'), scheduledEnd: new Date('2026-07-15'), progressPct: 20 },
    { id: uuid(407), projectId: uuid(21), phaseName: '共用部リニューアル', workTypeId: uuid(104), sortOrder: 4, scheduledStart: new Date('2026-06-01'), scheduledEnd: new Date('2026-08-31'), progressPct: 0 },
  ];

  for (const ph of phases) {
    await prisma.projectPhase.upsert({
      where: { id: ph.id },
      update: {},
      create: ph,
    });
  }
  console.log(`Seeded ${phases.length} project phases`);

  // ==================================================================
  // 配置確定（ProjectAssignment）
  // ==================================================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignments = [
    { id: uuid(500), projectId: uuid(20), userId: uuid(11), targetDate: today, workTypeId: uuid(104), contractType: 'daily', dailyRate: 18000, status: 'confirmed' },
    { id: uuid(501), projectId: uuid(20), userId: uuid(13), targetDate: today, workTypeId: uuid(106), contractType: 'daily', dailyRate: 22000, status: 'confirmed' },
    { id: uuid(502), projectId: uuid(20), userId: uuid(14), targetDate: today, workTypeId: uuid(108), contractType: 'daily', dailyRate: 20000, status: 'confirmed' },
    { id: uuid(503), projectId: uuid(21), userId: uuid(17), targetDate: today, workTypeId: uuid(100), contractType: 'daily', dailyRate: 23000, status: 'confirmed' },
    { id: uuid(504), projectId: uuid(21), userId: uuid(18), targetDate: today, workTypeId: uuid(100), contractType: 'daily', dailyRate: 18000, status: 'confirmed' },
    { id: uuid(505), projectId: uuid(20), userId: uuid(15), targetDate: today, workTypeId: uuid(109), contractType: 'daily', dailyRate: 25000, status: 'confirmed' },
    { id: uuid(506), projectId: uuid(20), userId: uuid(19), targetDate: today, workTypeId: uuid(110), contractType: 'daily', dailyRate: 21000, status: 'confirmed' },
  ];

  for (const a of assignments) {
    await prisma.projectAssignment.upsert({
      where: { userId_targetDate: { userId: a.userId, targetDate: a.targetDate } },
      update: {},
      create: a,
    });
  }
  console.log(`Seeded ${assignments.length} assignments`);

  // ==================================================================
  // 日報データ（過去2週間分 + 各種ステータス）
  // ==================================================================
  const reportData: Array<{
    id: string;
    companyId: string;
    projectId: string;
    workerId: string;
    reportDate: Date;
    inputMode: string;
    clockIn: Date | null;
    clockOut: Date | null;
    breakMinutes: number;
    workMinutes: number | null;
    manDays: number;
    workContent: string;
    weather: string;
    temperature: number;
    status: string;
    submittedAt: Date | null;
    approvedBy: string | null;
    approvedAt: Date | null;
    progressPct: number;
  }> = [];

  const weathers = ['晴れ', '曇り', '雨', '晴れ', '晴れ', '曇り', '晴れ'];
  const temps = [8, 6, 5, 10, 12, 9, 11, 7, 13, 10];

  // 作業者・案件・作業内容のマッピング
  const workerConfigs = [
    { workerId: uuid(11), companyId: uuid(1), projectId: uuid(20), name: '佐藤花子', mode: 'realtime', startH: 8, endH: 17, content: (d: number) => `内装下地処理・ボード張り作業。${d % 4 === 0 ? '養生・清掃作業含む。' : ''}${Math.floor(d / 3) + 2}階フロア${d % 2 === 0 ? '進行中' : '完了'}。` },
    { workerId: uuid(13), companyId: uuid(1), projectId: uuid(20), name: '田中健一', mode: 'realtime', startH: 7.5, endH: 17.5, content: (d: number) => `型枠組立作業。${d <= 10 ? `${Math.floor(d / 2) + 4}階柱・梁型枠設置。` : `${Math.floor(d / 3) + 6}階スラブ型枠敷設。`}安全帯使用確認済み。` },
    { workerId: uuid(14), companyId: uuid(1), projectId: uuid(20), name: '高橋勇気', mode: 'realtime', startH: 7, endH: 16.5, content: (d: number) => `とび工事。${d % 3 === 0 ? '足場組替え・安全ネット設置。' : d % 3 === 1 ? '鉄骨建方補助。荷揚げ作業。' : '足場点検・補修。親綱設置。'}` },
    { workerId: uuid(15), companyId: uuid(1), projectId: uuid(20), name: '伊藤大輔', mode: 'realtime', startH: 8.5, endH: 18, content: (d: number) => `電気配線工事。${d <= 10 ? '幹線ケーブル敷設・配管作業。' : '分電盤設置・結線作業。'}検電確認済み。` },
    { workerId: uuid(16), companyId: uuid(1), projectId: uuid(20), name: '渡辺翔太', mode: 'realtime', startH: 8.5, endH: 17.5, content: (d: number) => `電気工事補助。${d % 2 === 0 ? '配線ルート確認・ケーブルラック取付。' : '照明器具取付・スイッチボックス設置。'}` },
    { workerId: uuid(17), companyId: uuid(1), projectId: uuid(21), name: '小林正和', mode: 'batch', startH: 8, endH: 17, content: (d: number) => `外壁左官補修作業。${d % 3 === 0 ? 'クラック補修・パテ埋め。' : d % 3 === 1 ? 'モルタル塗り直し作業。' : 'タイル下地調整。'}${['北', '東', '南', '西'][d % 4]}面${Math.ceil(d / 3)}階部分。` },
    { workerId: uuid(18), companyId: uuid(1), projectId: uuid(21), name: '加藤美咲', mode: 'batch', startH: 8, endH: 17, content: (d: number) => `左官仕上げ作業。${d % 2 === 0 ? '外壁下地処理・プライマー塗布。' : '防水モルタル施工。'}共用廊下${Math.ceil(d / 4)}階。` },
    { workerId: uuid(19), companyId: uuid(1), projectId: uuid(20), name: '吉田隆司', mode: 'realtime', startH: 8, endH: 17, content: (d: number) => `管工事。${d % 3 === 0 ? '給水管配管作業。' : d % 3 === 1 ? '排水管設置・勾配確認。' : '空調ダクト接続作業。'}${Math.floor(d / 3) + 2}階。` },
  ];

  // 過去30日分のデータを生成
  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    d.setHours(0, 0, 0, 0);

    // 土日はスキップ
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const weatherIdx = dayOffset % weathers.length;

    for (let wIdx = 0; wIdx < workerConfigs.length; wIdx++) {
      const wc = workerConfigs[wIdx];

      // 作業者ごとに出勤確率を変える（リアルさのため）
      if (dayOffset > 20 && wIdx >= 4 && wIdx <= 5) continue; // 渡辺・小林は直近20日のみ
      if (dayOffset > 25 && wIdx >= 6) continue; // 加藤・吉田は直近25日のみ

      const startHour = Math.floor(wc.startH);
      const startMin = (wc.startH % 1) * 60;
      const endHour = Math.floor(wc.endH);
      const endMin = (wc.endH % 1) * 60;
      const clockIn = new Date(d); clockIn.setHours(startHour, startMin, 0, 0);
      const clockOut = new Date(d); clockOut.setHours(endHour, endMin, 0, 0);
      const totalMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      const workMin = totalMin - 60; // 60min break

      // ステータス: 直近2日=submitted、それ以前=approved、ランダムでrejected
      let status = 'approved';
      let approvedBy: string | null = uuid(10);
      let approvedAt: Date | null = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      if (dayOffset <= 2) {
        status = 'submitted';
        approvedBy = null;
        approvedAt = null;
      } else if (dayOffset === 8 && wIdx === 0) {
        status = 'rejected';
        approvedBy = null;
        approvedAt = null;
      }

      reportData.push({
        id: uuid(2000 + dayOffset * 100 + wIdx),
        companyId: wc.companyId,
        projectId: wc.projectId,
        workerId: wc.workerId,
        reportDate: d,
        inputMode: wc.mode,
        clockIn,
        clockOut,
        breakMinutes: 60,
        workMinutes: workMin,
        manDays: 1.0,
        workContent: wc.content(dayOffset),
        weather: weathers[weatherIdx],
        temperature: temps[weatherIdx % temps.length] + Math.floor(dayOffset / 10),
        status,
        submittedAt: clockOut,
        approvedBy,
        approvedAt,
        progressPct: Math.min(100, Math.floor((30 - dayOffset) / 30 * 100)),
      });
    }
  }

  // draft status report (今日の分 - 複数人)
  const todayReport = new Date();
  todayReport.setHours(0, 0, 0, 0);

  const todayWorkers = [
    { workerId: uuid(11), projectId: uuid(20), content: '内装下地処理・ボード張り作業中', startH: 8 },
    { workerId: uuid(13), projectId: uuid(20), content: '6階型枠組立作業中', startH: 7 },
    { workerId: uuid(14), projectId: uuid(20), content: 'とび工事・足場組替え作業中', startH: 7 },
    { workerId: uuid(17), projectId: uuid(21), content: '外壁左官補修 西面5階', startH: 8 },
  ];
  for (let i = 0; i < todayWorkers.length; i++) {
    const tw = todayWorkers[i];
    const clockIn = new Date(); clockIn.setHours(tw.startH, 0, 0, 0);
    reportData.push({
      id: uuid(1990 + i),
      companyId: uuid(1),
      projectId: tw.projectId,
      workerId: tw.workerId,
      reportDate: todayReport,
      inputMode: 'realtime',
      clockIn,
      clockOut: null,
      breakMinutes: 0,
      workMinutes: null,
      manDays: 0,
      workContent: tw.content,
      weather: '晴れ',
      temperature: 10,
      status: 'draft',
      submittedAt: null,
      approvedBy: null,
      approvedAt: null,
      progressPct: 0,
    });
  }

  for (const r of reportData) {
    await prisma.dailyReport.upsert({
      where: { workerId_reportDate_projectId: { workerId: r.workerId, reportDate: r.reportDate, projectId: r.projectId } },
      update: {},
      create: r,
    });
  }
  console.log(`Seeded ${reportData.length} daily reports`);

  // ==================================================================
  // 日報原価明細（生成された日報IDを使用）
  // ==================================================================
  const createdReports = await prisma.dailyReport.findMany({
    where: { isDeleted: false },
    orderBy: { reportDate: 'desc' },
    take: 20,
    select: { id: true, workerId: true, reportDate: true, projectId: true },
  });

  const costItems: Array<{ reportId: string; costType: string; itemName: string; quantity: number; unit: string; unitPrice: number; amount: number }> = [];

  // 佐藤花子の最新日報に内装資材
  const satoReports = createdReports.filter(r => r.workerId === uuid(11));
  if (satoReports[0]) {
    costItems.push(
      { reportId: satoReports[0].id, costType: 'material', itemName: '石膏ボード 12.5mm', quantity: 50, unit: '枚', unitPrice: 450, amount: 22500 },
      { reportId: satoReports[0].id, costType: 'material', itemName: 'ビス（ボード用）', quantity: 5, unit: '箱', unitPrice: 800, amount: 4000 },
    );
  }
  if (satoReports[1]) {
    costItems.push(
      { reportId: satoReports[1].id, costType: 'material', itemName: '石膏ボード 12.5mm', quantity: 40, unit: '枚', unitPrice: 450, amount: 18000 },
    );
  }

  // 田中健一の最新日報に型枠資材
  const tanakaReports = createdReports.filter(r => r.workerId === uuid(13));
  if (tanakaReports[0]) {
    costItems.push(
      { reportId: tanakaReports[0].id, costType: 'material', itemName: '型枠用合板', quantity: 30, unit: '枚', unitPrice: 1800, amount: 54000 },
      { reportId: tanakaReports[0].id, costType: 'rental', itemName: 'クレーン使用料', quantity: 1, unit: '日', unitPrice: 85000, amount: 85000 },
    );
  }
  if (tanakaReports[1]) {
    costItems.push(
      { reportId: tanakaReports[1].id, costType: 'material', itemName: '型枠用合板', quantity: 25, unit: '枚', unitPrice: 1800, amount: 45000 },
    );
  }

  // 小林正和の最新日報に左官資材
  const kobayashiReports = createdReports.filter(r => r.workerId === uuid(17));
  if (kobayashiReports[0]) {
    costItems.push(
      { reportId: kobayashiReports[0].id, costType: 'material', itemName: 'モルタル（25kg）', quantity: 20, unit: '袋', unitPrice: 650, amount: 13000 },
      { reportId: kobayashiReports[0].id, costType: 'material', itemName: 'クラック補修材', quantity: 3, unit: '缶', unitPrice: 3500, amount: 10500 },
    );
  }

  if (costItems.length > 0) {
    await prisma.reportCostItem.createMany({ data: costItems, skipDuplicates: true });
  }
  console.log(`Seeded ${costItems.length} report cost items`);

  // ==================================================================
  // 安全KY記録
  // ==================================================================
  const safetyRecords = [
    {
      projectId: uuid(20),
      recordedBy: uuid(13),
      recordDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      hazardIdentified: '高所作業時の墜落リスク。5階型枠組立作業中、開口部からの転落の危険性あり。',
      countermeasure: '安全帯の確実な使用。開口部に仮設手すり設置。作業前にKY活動実施。',
      safetyOfficer: '田中健一',
      participants: [uuid(13), uuid(14), uuid(11)],
      participantCount: 3,
      isConfirmed: true,
      confirmedAt: new Date(),
    },
    {
      projectId: uuid(21),
      recordedBy: uuid(17),
      recordDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      hazardIdentified: '外壁作業中の落下物リスク。足場上からの工具・材料の落下による第三者への被害。',
      countermeasure: '朝顔（防護棚）の設置確認。工具落下防止ワイヤー使用。作業エリア下部の立入禁止措置。',
      safetyOfficer: '小林正和',
      participants: [uuid(17), uuid(18)],
      participantCount: 2,
      isConfirmed: true,
      confirmedAt: new Date(),
    },
    {
      projectId: uuid(20),
      recordedBy: uuid(15),
      recordDate: new Date(),
      hazardIdentified: '電気工事中の感電リスク。既設配線の活線部分あり。',
      countermeasure: '検電器による通電確認。絶縁手袋・絶縁工具使用。作業前の停電確認手順遵守。',
      safetyOfficer: '伊藤大輔',
      participants: [uuid(15), uuid(16)],
      participantCount: 2,
      isConfirmed: false,
    },
  ];

  for (const sr of safetyRecords) {
    await prisma.safetyRecord.create({ data: sr });
  }
  console.log(`Seeded ${safetyRecords.length} safety records`);

  // ==================================================================
  // 作業者評価
  // ==================================================================
  const evaluations = [
    { workerId: uuid(13), evaluatorId: uuid(10), projectId: uuid(20), evaluationDate: new Date('2026-02-15'), ratingSkill: 5, ratingSpeed: 5, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 4, ratingOverall: 4.8, comment: '非常に優秀。型枠工事のリーダーとして現場を引っ張ってくれている。安全意識も高い。', isPublic: true },
    { workerId: uuid(14), evaluatorId: uuid(10), projectId: uuid(20), evaluationDate: new Date('2026-02-15'), ratingSkill: 4, ratingSpeed: 4, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 4, ratingOverall: 4.4, comment: 'とび工事の技術力が高く、安全管理も徹底している。コミュニケーションも良好。', isPublic: true },
    { workerId: uuid(11), evaluatorId: uuid(10), projectId: uuid(20), evaluationDate: new Date('2026-02-15'), ratingSkill: 4, ratingSpeed: 3, ratingAttitude: 5, ratingSafety: 4, ratingCommunication: 5, ratingOverall: 4.2, comment: '丁寧な仕上がりで品質が高い。作業スピードは平均的だが、確実な仕事をしてくれる。', isPublic: true },
    { workerId: uuid(15), evaluatorId: uuid(10), projectId: uuid(20), evaluationDate: new Date('2026-02-20'), ratingSkill: 5, ratingSpeed: 5, ratingAttitude: 4, ratingSafety: 5, ratingCommunication: 4, ratingOverall: 4.6, comment: '電気工事の専門性が非常に高い。資格も豊富で安心して任せられる。', isPublic: true },
    { workerId: uuid(17), evaluatorId: uuid(10), projectId: uuid(21), evaluationDate: new Date('2026-02-20'), ratingSkill: 5, ratingSpeed: 4, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 5, ratingOverall: 4.8, comment: '20年の経験は伊達ではない。左官の仕上がりは美しく、若手の指導も積極的に行ってくれる。', isPublic: true },
    { workerId: uuid(18), evaluatorId: uuid(17), projectId: uuid(21), evaluationDate: new Date('2026-02-20'), ratingSkill: 3, ratingSpeed: 3, ratingAttitude: 5, ratingSafety: 4, ratingCommunication: 4, ratingOverall: 3.8, comment: 'まだ経験は浅いが、真面目に取り組んでいる。今後の成長に期待。', isPublic: true },
  ];

  for (const ev of evaluations) {
    await prisma.workerEvaluation.create({ data: ev });
  }
  console.log(`Seeded ${evaluations.length} worker evaluations`);

  // ==================================================================
  // マッチング: 募集票（Demand）
  // ==================================================================
  const demandPostings = [
    {
      id: uuid(700),
      companyId: uuid(1),
      projectId: uuid(20),
      postedBy: uuid(10),
      siteName: '渋谷駅前再開発現場',
      sitePrefecture: '東京都',
      siteCity: '渋谷区',
      siteAddress: '渋谷2-1-1',
      siteLat: 35.6580,
      siteLng: 139.7016,
      contractType: 'daily',
      workTypeId: uuid(107), // 鉄筋工事
      workDateStart: new Date('2026-03-01'),
      workDateEnd: new Date('2026-05-31'),
      requiredCount: 3,
      dailyRateMin: 18000,
      dailyRateMax: 25000,
      status: 'open',
      structureId: uuid(202),
      floorCount: 32,
      description: '渋谷駅前再開発ビル新築工事の鉄筋工事要員を募集します。5階以上の柱・梁・スラブ配筋作業。RC経験者優遇。',
      publishedAt: new Date('2026-02-15'),
      viewCount: 45,
      applicationCount: 3,
    },
    {
      id: uuid(701),
      companyId: uuid(1),
      projectId: uuid(21),
      postedBy: uuid(10),
      siteName: '品川グランドハイツ',
      sitePrefecture: '東京都',
      siteCity: '品川区',
      siteAddress: '北品川3-8-15',
      siteLat: 35.6211,
      siteLng: 139.7400,
      contractType: 'daily',
      workTypeId: uuid(101), // 塗装工事
      workDateStart: new Date('2026-04-01'),
      workDateEnd: new Date('2026-07-15'),
      requiredCount: 2,
      dailyRateMin: 16000,
      dailyRateMax: 22000,
      status: 'open',
      structureId: uuid(200),
      floorCount: 14,
      description: '品川マンション大規模修繕工事の塗装工を募集。外壁吹付・ローラー塗装。高所作業あり。',
      publishedAt: new Date('2026-02-20'),
      viewCount: 28,
      applicationCount: 1,
    },
    {
      id: uuid(702),
      companyId: uuid(2),
      projectId: uuid(23),
      postedBy: uuid(12),
      siteName: '新宿センタービル',
      sitePrefecture: '東京都',
      siteCity: '新宿区',
      siteAddress: '西新宿1-25-1',
      contractType: 'daily',
      workTypeId: uuid(109), // 電気
      workDateStart: new Date('2025-12-01'),
      workDateEnd: new Date('2026-02-28'),
      requiredCount: 2,
      dailyRateMin: 20000,
      dailyRateMax: 28000,
      status: 'filled',
      description: '新宿オフィスビル電気設備改修工事。LED照明器具取付・分電盤結線。第二種電気工事士以上必須。',
      confirmedCount: 2,
      publishedAt: new Date('2025-11-15'),
      viewCount: 62,
      applicationCount: 5,
    },
    {
      id: uuid(703),
      companyId: uuid(1),
      projectId: uuid(20),
      postedBy: uuid(10),
      siteName: '渋谷駅前再開発現場',
      sitePrefecture: '東京都',
      siteCity: '渋谷区',
      siteAddress: '渋谷2-1-1',
      contractType: 'daily',
      workTypeId: uuid(100), // 左官
      workDateStart: new Date('2025-10-01'),
      workDateEnd: new Date('2026-01-31'),
      requiredCount: 2,
      dailyRateMin: 20000,
      dailyRateMax: 25000,
      status: 'filled',
      confirmedCount: 2,
      description: '渋谷再開発ビル左官工事。外壁モルタル仕上げ・タイル下地。',
      publishedAt: new Date('2025-09-20'),
      viewCount: 38,
      applicationCount: 4,
    },
    {
      id: uuid(704),
      companyId: uuid(2),
      projectId: uuid(23),
      postedBy: uuid(12),
      siteName: '新宿センタービル',
      sitePrefecture: '東京都',
      siteCity: '新宿区',
      siteAddress: '西新宿1-25-1',
      contractType: 'daily',
      workTypeId: uuid(106), // 内装
      workDateStart: new Date('2026-03-01'),
      workDateEnd: new Date('2026-06-30'),
      requiredCount: 3,
      dailyRateMin: 17000,
      dailyRateMax: 23000,
      status: 'open',
      description: '新宿オフィスビル内装仕上げ工事。LGS・ボード・クロス。経験者歓迎。',
      publishedAt: new Date('2026-02-22'),
      viewCount: 12,
      applicationCount: 0,
    },
    {
      id: uuid(705),
      companyId: uuid(3),
      projectId: uuid(22),
      postedBy: uuid(12),
      siteName: '川崎物流倉庫',
      sitePrefecture: '神奈川県',
      siteCity: '川崎市川崎区',
      siteAddress: '東扇島10-5',
      contractType: 'daily',
      workTypeId: uuid(107), // 鉄筋
      workDateStart: new Date('2025-08-01'),
      workDateEnd: new Date('2025-11-30'),
      requiredCount: 4,
      dailyRateMin: 18000,
      dailyRateMax: 24000,
      status: 'filled',
      confirmedCount: 4,
      description: '川崎倉庫新築の鉄筋工事。基礎〜上部躯体。',
      publishedAt: new Date('2025-07-10'),
      viewCount: 55,
      applicationCount: 8,
    },
  ];

  for (const dp of demandPostings) {
    await prisma.demandPosting.upsert({
      where: { id: dp.id },
      update: {},
      create: dp,
    });
  }
  console.log(`Seeded ${demandPostings.length} demand postings`);

  // ==================================================================
  // マッチング: 人材公開票（Supply）
  // ==================================================================
  const supplyPostings = [
    {
      id: uuid(800),
      companyId: uuid(3),
      userId: uuid(17),
      isSelfPosting: false,
      workTypeId: uuid(100), // 左官
      contractType: 'daily',
      desiredDailyRate: 23000,
      availableStart: new Date('2026-03-01'),
      availableEnd: new Date('2026-06-30'),
      availablePrefecture: '東京都',
      availableArea: '東京都23区・埼玉県南部',
      status: 'open',
      skillLevel: 'expert',
      experienceYears: 20,
      hasVehicle: true,
      hasOwnTools: true,
      title: 'ベテラン左官職人（経験20年）',
      description: '左官工事歴20年のベテランです。外壁補修・モルタル仕上げ・タイル下地が得意。大規模修繕の実績多数。自家用車で現場直行可能。',
      publishedAt: new Date('2026-02-10'),
      viewCount: 35,
      inquiryCount: 2,
    },
    {
      id: uuid(801),
      userId: uuid(16),
      companyId: uuid(2),
      isSelfPosting: true,
      workTypeId: uuid(109), // 電気
      contractType: 'daily',
      desiredDailyRate: 19000,
      availableStart: new Date('2026-03-01'),
      availableEnd: new Date('2026-12-31'),
      availablePrefecture: '東京都',
      availableArea: '東京都全域',
      status: 'open',
      skillLevel: 'intermediate',
      experienceYears: 3,
      hasVehicle: false,
      title: '電気工事士（第二種）3年経験',
      description: '第二種電気工事士。照明器具取付・配線・コンセント増設等の経験あり。真面目に取り組みます。',
      publishedAt: new Date('2026-02-18'),
      viewCount: 15,
      inquiryCount: 0,
    },
  ];

  for (const sp of supplyPostings) {
    await prisma.supplyPosting.upsert({
      where: { id: sp.id },
      update: {},
      create: sp,
    });
  }
  console.log(`Seeded ${supplyPostings.length} supply postings`);

  // ==================================================================
  // マッチング: 応募（DemandApplication）
  // ==================================================================
  const applications = [
    {
      id: uuid(750),
      postingId: uuid(700),
      applicantId: uuid(14),
      applicantType: 'worker',
      proposedRate: 20000,
      availableCount: 1,
      message: '鉄筋工事の経験は3年ですが、とび工事との兼務で躯体全般に対応可能です。安全帯使用・玉掛け資格あり。',
      status: 'accepted',
      respondedAt: new Date('2026-02-17'),
      respondedBy: uuid(10),
    },
    {
      id: uuid(751),
      postingId: uuid(700),
      applicantId: uuid(19),
      applicantType: 'worker',
      proposedRate: 21000,
      availableCount: 1,
      message: '管工事が専門ですが、鉄筋組立の経験もあります。3月から参加可能です。',
      status: 'pending',
    },
    {
      id: uuid(752),
      postingId: uuid(701),
      applicantId: uuid(11),
      applicantType: 'worker',
      proposedRate: 18000,
      availableCount: 1,
      message: '塗装工事の経験があります。ローラー・吹付け対応可能。4月から参加希望です。',
      status: 'pending',
    },
  ];

  for (const app of applications) {
    await prisma.demandApplication.upsert({
      where: { id: app.id },
      update: {},
      create: app,
    });
  }
  console.log(`Seeded ${applications.length} demand applications`);

  // ==================================================================
  // マッチング成約
  // ==================================================================
  const matchContracts = [
    {
      id: uuid(900),
      demandPostingId: uuid(700),
      demandAppId: uuid(750),
      clientCompanyId: uuid(1),
      workerUserId: uuid(14),
      projectId: uuid(20),
      contractType: 'daily',
      agreedDailyRate: 20000,
      workDateStart: new Date('2026-03-01'),
      workDateEnd: new Date('2026-05-31'),
      agreedCount: 1,
      status: 'active',
      timeToMatchHours: 48.5,
    },
    {
      id: uuid(901),
      demandPostingId: uuid(702),
      clientCompanyId: uuid(2),
      workerUserId: uuid(15),
      workerCompanyId: uuid(2),
      projectId: uuid(23),
      contractType: 'daily',
      agreedDailyRate: 25000,
      workDateStart: new Date('2025-12-01'),
      workDateEnd: new Date('2026-02-28'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2026-02-28'),
      timeToMatchHours: 12.0,
    },
    {
      id: uuid(902),
      demandPostingId: uuid(702),
      clientCompanyId: uuid(2),
      workerUserId: uuid(16),
      workerCompanyId: uuid(2),
      projectId: uuid(23),
      contractType: 'daily',
      agreedDailyRate: 19000,
      workDateStart: new Date('2025-12-01'),
      workDateEnd: new Date('2026-02-28'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2026-02-28'),
      timeToMatchHours: 24.0,
    },
    {
      id: uuid(903),
      demandPostingId: uuid(703),
      clientCompanyId: uuid(1),
      workerUserId: uuid(17),
      workerCompanyId: uuid(3),
      projectId: uuid(20),
      contractType: 'daily',
      agreedDailyRate: 23000,
      workDateStart: new Date('2025-10-01'),
      workDateEnd: new Date('2026-01-31'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2026-01-31'),
      timeToMatchHours: 36.0,
    },
    {
      id: uuid(904),
      demandPostingId: uuid(703),
      clientCompanyId: uuid(1),
      workerUserId: uuid(18),
      workerCompanyId: uuid(3),
      projectId: uuid(20),
      contractType: 'daily',
      agreedDailyRate: 18000,
      workDateStart: new Date('2025-10-01'),
      workDateEnd: new Date('2026-01-31'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2026-01-31'),
      timeToMatchHours: 36.0,
    },
    {
      id: uuid(905),
      demandPostingId: uuid(705),
      clientCompanyId: uuid(3),
      workerUserId: uuid(13),
      projectId: uuid(22),
      contractType: 'daily',
      agreedDailyRate: 22000,
      workDateStart: new Date('2025-08-01'),
      workDateEnd: new Date('2025-11-30'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2025-11-30'),
      timeToMatchHours: 8.0,
    },
    {
      id: uuid(906),
      demandPostingId: uuid(705),
      clientCompanyId: uuid(3),
      workerUserId: uuid(19),
      projectId: uuid(22),
      contractType: 'daily',
      agreedDailyRate: 21000,
      workDateStart: new Date('2025-08-01'),
      workDateEnd: new Date('2025-10-15'),
      agreedCount: 1,
      status: 'cancelled',
      cancelledAt: new Date('2025-09-15'),
      cancelReason: '作業者の体調不良による辞退',
      timeToMatchHours: 18.0,
    },
    {
      id: uuid(907),
      demandPostingId: uuid(705),
      clientCompanyId: uuid(3),
      workerUserId: uuid(11),
      projectId: uuid(22),
      contractType: 'daily',
      agreedDailyRate: 18000,
      workDateStart: new Date('2025-09-01'),
      workDateEnd: new Date('2025-11-30'),
      agreedCount: 1,
      status: 'completed',
      completedAt: new Date('2025-11-30'),
      timeToMatchHours: 6.5,
    },
  ];
  for (const mc of matchContracts) {
    await prisma.matchContract.upsert({
      where: { id: mc.id },
      update: {},
      create: mc,
    });
  }
  console.log(`Seeded ${matchContracts.length} match contracts`);

  // ==================================================================
  // マッチング: レビュー
  // ==================================================================
  const matchReviews = [
    // 完了契約901: 伊藤 → クライアント（東京電設 → 東京電設自社評価はないので、クライアント評価）
    { contractId: uuid(901), reviewerId: uuid(12), revieweeId: uuid(15), reviewType: 'client_to_worker', rating: 5, comment: '電気工事の技術力が非常に高く、安全管理も徹底していた。また依頼したい。' },
    // 完了契約902
    { contractId: uuid(902), reviewerId: uuid(12), revieweeId: uuid(16), reviewType: 'client_to_worker', rating: 4, comment: '真面目に作業に取り組んでくれた。経験を積めばさらに成長すると思う。' },
    // 完了契約903: デモ建設→小林
    { contractId: uuid(903), reviewerId: uuid(10), revieweeId: uuid(17), reviewType: 'client_to_worker', rating: 5, comment: 'ベテランの左官職人。仕上がりが美しく、工期内に完了。文句なしの評価。' },
    // 完了契約903: 小林→デモ建設
    { contractId: uuid(903), reviewerId: uuid(17), revieweeId: uuid(10), reviewType: 'worker_to_client', rating: 4, comment: '現場の段取りが良く、働きやすかった。支払いも迅速。' },
    // 完了契約904: デモ建設→加藤
    { contractId: uuid(904), reviewerId: uuid(10), revieweeId: uuid(18), reviewType: 'client_to_worker', rating: 4, comment: '丁寧な作業で品質が高い。コミュニケーションも良好。' },
    // 完了契約905: 関東左官→田中
    { contractId: uuid(905), reviewerId: uuid(12), revieweeId: uuid(13), reviewType: 'client_to_worker', rating: 5, comment: '型枠工事のスキルが高い。リーダーシップもあり、若手の指導も任せられた。' },
    // 完了契約907: 関東左官→佐藤
    { contractId: uuid(907), reviewerId: uuid(12), revieweeId: uuid(11), reviewType: 'client_to_worker', rating: 3, comment: '作業は問題なかったが、高所作業に不慣れな点があった。今後の経験に期待。' },
  ];
  for (const rv of matchReviews) {
    await prisma.matchReview.create({ data: rv });
  }
  console.log(`Seeded ${matchReviews.length} match reviews`);

  // ==================================================================
  // 請求書
  // ==================================================================
  const invoice1 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-001' },
    update: {},
    create: {
      id: uuid(950),
      companyId: uuid(1),
      clientCompanyId: uuid(2),
      projectId: uuid(20),
      invoiceNumber: 'INV-2026-001',
      invoiceDate: new Date('2026-01-31'),
      dueDate: new Date('2026-02-28'),
      subtotal: 2500000,
      taxAmount: 250000,
      totalAmount: 2750000,
      taxRate: 10.00,
      qualifiedInvoice: true,
      invoiceRegNo: 'T1234567890123',
      status: 'paid',
      issuedAt: new Date('2026-01-31'),
      sentAt: new Date('2026-02-01'),
      paidAt: new Date('2026-02-25'),
      notes: '2026年1月分 電気設備工事 出来高請求',
    },
  });

  await prisma.invoiceLine.createMany({
    data: [
      { invoiceId: uuid(950), lineOrder: 1, description: '電気工事 伊藤大輔 1月分（20日）', quantity: 20, unit: '人工', unitPrice: 25000, amount: 500000 },
      { invoiceId: uuid(950), lineOrder: 2, description: '電気工事 渡辺翔太 1月分（20日）', quantity: 20, unit: '人工', unitPrice: 19000, amount: 380000 },
      { invoiceId: uuid(950), lineOrder: 3, description: '電気資材費', quantity: 1, unit: '式', unitPrice: 1620000, amount: 1620000 },
    ],
    skipDuplicates: true,
  });

  const invoice2 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-002' },
    update: {},
    create: {
      id: uuid(951),
      companyId: uuid(1),
      clientCompanyId: uuid(3),
      projectId: uuid(21),
      invoiceNumber: 'INV-2026-002',
      invoiceDate: new Date('2026-02-28'),
      dueDate: new Date('2026-03-31'),
      subtotal: 1150000,
      taxAmount: 115000,
      totalAmount: 1265000,
      taxRate: 10.00,
      qualifiedInvoice: true,
      invoiceRegNo: 'T1234567890123',
      status: 'issued',
      issuedAt: new Date('2026-02-28'),
      notes: '2026年2月分 左官工事 出来高請求',
    },
  });

  await prisma.invoiceLine.createMany({
    data: [
      { invoiceId: uuid(951), lineOrder: 1, description: '左官工事 小林正和 2月分（18日）', quantity: 18, unit: '人工', unitPrice: 23000, amount: 414000 },
      { invoiceId: uuid(951), lineOrder: 2, description: '左官工事 加藤美咲 2月分（18日）', quantity: 18, unit: '人工', unitPrice: 18000, amount: 324000 },
      { invoiceId: uuid(951), lineOrder: 3, description: '左官資材費（モルタル・補修材等）', quantity: 1, unit: '式', unitPrice: 412000, amount: 412000 },
    ],
    skipDuplicates: true,
  });

  // 期限超過の請求書（アラート表示用）
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2025-010' },
    update: {},
    create: {
      id: uuid(952),
      companyId: uuid(1),
      clientCompanyId: uuid(3),
      projectId: uuid(22),
      invoiceNumber: 'INV-2025-010',
      invoiceDate: new Date('2025-11-30'),
      dueDate: new Date('2025-12-31'),
      subtotal: 920000,
      taxAmount: 92000,
      totalAmount: 1012000,
      taxRate: 10.00,
      qualifiedInvoice: true,
      invoiceRegNo: 'T1234567890123',
      status: 'issued',
      issuedAt: new Date('2025-11-30'),
      sentAt: new Date('2025-12-01'),
      notes: '2025年11月分 川崎倉庫 鉄筋工事 出来高請求',
    },
  });
  await prisma.invoiceLine.createMany({
    data: [
      { invoiceId: uuid(952), lineOrder: 1, description: '鉄筋工事 田中健一 11月分（20日）', quantity: 20, unit: '人工', unitPrice: 22000, amount: 440000 },
      { invoiceId: uuid(952), lineOrder: 2, description: '鉄筋工事 佐藤花子 11月分（18日）', quantity: 18, unit: '人工', unitPrice: 18000, amount: 324000 },
      { invoiceId: uuid(952), lineOrder: 3, description: '鉄筋資材費（結束線・スペーサー等）', quantity: 1, unit: '式', unitPrice: 156000, amount: 156000 },
    ],
    skipDuplicates: true,
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-003' },
    update: {},
    create: {
      id: uuid(953),
      companyId: uuid(1),
      clientCompanyId: uuid(2),
      projectId: uuid(20),
      invoiceNumber: 'INV-2026-003',
      invoiceDate: new Date('2026-01-15'),
      dueDate: new Date('2026-02-15'),
      subtotal: 580000,
      taxAmount: 58000,
      totalAmount: 638000,
      taxRate: 10.00,
      qualifiedInvoice: true,
      invoiceRegNo: 'T1234567890123',
      status: 'issued',
      issuedAt: new Date('2026-01-15'),
      sentAt: new Date('2026-01-16'),
      notes: '渋谷再開発 追加工事分（配管・ダクト）',
    },
  });
  await prisma.invoiceLine.createMany({
    data: [
      { invoiceId: uuid(953), lineOrder: 1, description: '配管追加工事', quantity: 1, unit: '式', unitPrice: 350000, amount: 350000 },
      { invoiceId: uuid(953), lineOrder: 2, description: 'ダクト延長工事', quantity: 1, unit: '式', unitPrice: 230000, amount: 230000 },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded 4 invoices with lines');

  // ==================================================================
  // 入金記録
  // ==================================================================
  await prisma.paymentReceived.create({
    data: {
      invoiceId: uuid(950),
      paymentDate: new Date('2026-02-25'),
      amount: 2750000,
      paymentMethod: 'bank_transfer',
      bankRef: '振込番号: TK-20260225-001',
    },
  });
  console.log('Seeded 1 payment received');

  // ==================================================================
  // 給与明細（Payroll）
  // ==================================================================
  const payroll1 = await prisma.payroll.upsert({
    where: { id: uuid(960) },
    update: {},
    create: {
      id: uuid(960),
      companyId: uuid(1),
      workerId: uuid(13),
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-01-31'),
      paymentDate: new Date('2026-02-25'),
      grossAmount: 440000,
      withholdingTax: 22000,
      deductions: 0,
      netAmount: 418000,
      status: 'paid',
      paidAt: new Date('2026-02-25'),
    },
  });

  await prisma.payrollLine.createMany({
    data: [
      { payrollId: uuid(960), projectId: uuid(20), workDate: new Date('2026-01-06'), manDays: 1.0, dailyRate: 22000, amount: 22000, description: '渋谷再開発 型枠工事' },
      { payrollId: uuid(960), projectId: uuid(20), workDate: new Date('2026-01-07'), manDays: 1.0, dailyRate: 22000, amount: 22000, description: '渋谷再開発 型枠工事' },
      { payrollId: uuid(960), projectId: uuid(20), workDate: new Date('2026-01-08'), manDays: 1.0, dailyRate: 22000, amount: 22000, description: '渋谷再開発 型枠工事' },
    ],
    skipDuplicates: true,
  });

  const payroll2 = await prisma.payroll.upsert({
    where: { id: uuid(961) },
    update: {},
    create: {
      id: uuid(961),
      companyId: uuid(1),
      workerId: uuid(11),
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-01-31'),
      paymentDate: new Date('2026-02-25'),
      grossAmount: 360000,
      withholdingTax: 18000,
      deductions: 0,
      netAmount: 342000,
      status: 'paid',
      paidAt: new Date('2026-02-25'),
    },
  });

  console.log('Seeded 2 payrolls');

  // ==================================================================
  // 原価台帳
  // ==================================================================
  const costLedgerEntries = [
    { companyId: uuid(1), projectId: uuid(20), costCategory: 'labor', transactionDate: new Date('2026-01-31'), description: '1月分 労務費（型枠工・田中）', amount: 440000, sourceType: 'payroll' },
    { companyId: uuid(1), projectId: uuid(20), costCategory: 'labor', transactionDate: new Date('2026-01-31'), description: '1月分 労務費（内装・佐藤）', amount: 360000, sourceType: 'payroll' },
    { companyId: uuid(1), projectId: uuid(20), costCategory: 'subcontract', transactionDate: new Date('2026-01-31'), description: '1月分 電気工事外注費（東京電設）', amount: 2500000, sourceType: 'invoice' },
    { companyId: uuid(1), projectId: uuid(20), costCategory: 'material', transactionDate: new Date('2026-02-05'), description: '型枠用合板・金物', amount: 850000 },
    { companyId: uuid(1), projectId: uuid(20), costCategory: 'equipment', transactionDate: new Date('2026-02-10'), description: 'クレーンリース料（2月分）', amount: 1200000 },
    { companyId: uuid(1), projectId: uuid(21), costCategory: 'labor', transactionDate: new Date('2026-02-28'), description: '2月分 左官工事労務費', amount: 738000, sourceType: 'payroll' },
    { companyId: uuid(1), projectId: uuid(21), costCategory: 'material', transactionDate: new Date('2026-02-15'), description: 'モルタル・補修材・塗料', amount: 412000 },
    { companyId: uuid(1), projectId: uuid(21), costCategory: 'equipment', transactionDate: new Date('2026-02-03'), description: '足場リース料', amount: 580000 },
  ];

  await prisma.costLedger.createMany({ data: costLedgerEntries, skipDuplicates: true });
  console.log(`Seeded ${costLedgerEntries.length} cost ledger entries`);

  // ==================================================================
  // 通知ログ
  // ==================================================================
  const notifications = [
    { userId: uuid(11), channel: 'in_app', notificationType: 'report_approved', title: '日報が承認されました', body: '2/20の日報（渋谷駅前再開発ビル新築工事）が承認されました。', isRead: true, readAt: new Date() },
    { userId: uuid(13), channel: 'in_app', notificationType: 'report_approved', title: '日報が承認されました', body: '2/20の日報（渋谷駅前再開発ビル新築工事）が承認されました。', isRead: true, readAt: new Date() },
    { userId: uuid(10), channel: 'in_app', notificationType: 'report_submitted', title: '日報が提出されました', body: '佐藤花子さんが2/22の日報を提出しました。確認してください。', isRead: false },
    { userId: uuid(10), channel: 'in_app', notificationType: 'demand_application', title: '募集に応募がありました', body: '「渋谷駅前再開発 鉄筋工事」に吉田隆司さんから応募がありました。', isRead: false },
    { userId: uuid(14), channel: 'in_app', notificationType: 'application_accepted', title: '応募が承認されました', body: '「渋谷駅前再開発 鉄筋工事」への応募が承認されました。3/1から勤務開始です。', isRead: true, readAt: new Date() },
    { userId: uuid(10), channel: 'in_app', notificationType: 'payment_received', title: '入金がありました', body: '請求書 INV-2026-001（東京電設工業）の入金￥2,750,000が確認されました。', isRead: true, readAt: new Date() },
  ];

  await prisma.notificationLog.createMany({ data: notifications, skipDuplicates: true });
  console.log(`Seeded ${notifications.length} notifications`);

  console.log('\n✅ Seed completed successfully!');
  console.log('───────────────────────────────');
  console.log('会社: 3社');
  console.log('ユーザー: 11名（管理者1 + オーナー2 + 作業者8）');
  console.log('案件: 5件（稼働中2 + 計画中2 + 完了1）');
  console.log('日報: 多数（過去2週間分）');
  console.log('マッチング: 募集6 + 人材公開2 + 応募3 + 成約8 + レビュー7');
  console.log('請求書: 4件 + 入金1件');
  console.log('給与: 2件');
  console.log('───────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
