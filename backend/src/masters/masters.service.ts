import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class MastersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 工種マスタを階層構造で取得（親→子の2階層）
   */
  async getWorkTypes() {
    const parents = await this.prisma.workTypeMaster.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      select: {
        id: true,
        workTypeName: true,
        category: true,
        level: true,
        sortOrder: true,
        children: {
          where: { isActive: true },
          select: {
            id: true,
            workTypeName: true,
            category: true,
            level: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return parents;
  }

  /**
   * 構造マスタ一覧取得（有効なもののみ）
   */
  async getStructures() {
    const structures = await this.prisma.structureMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        structureName: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return structures;
  }

  /**
   * 資格マスタ一覧取得（有効なもののみ）
   */
  async getLicenses() {
    const licenses = await this.prisma.licenseMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        licenseName: true,
        licenseCategory: true,
        hasExpiry: true,
        renewalMonths: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return licenses;
  }

  /**
   * 勘定科目マスタ一覧取得（有効なもののみ）
   */
  async getAccounts() {
    const accounts = await this.prisma.accountMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        accountCode: true,
        accountName: true,
        accountType: true,
        parentCode: true,
        isConstruction: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return accounts;
  }
}
