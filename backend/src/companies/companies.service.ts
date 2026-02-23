import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanySettingsDto } from './dto/company-settings.dto';
import { SearchCompanyDto } from './dto/search-company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 会社を作成しデフォルト設定を同時に生成
   */
  async create(dto: CreateCompanyDto, userId: string) {
    try {
      const company = await this.prisma.company.create({
        data: {
          ...dto,
          settings: {
            create: {},
          },
        },
        include: {
          settings: true,
        },
      });

      this.logger.log(`Company created: ${company.id} by user: ${userId}`);
      return company;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          '法人番号が既に登録されています',
        );
      }
      throw error;
    }
  }

  /**
   * ページネーション付き会社一覧取得
   */
  async findAll(query: SearchCompanyDto) {
    const { page = 1, limit = 20, sort, companyType, keyword } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (companyType) {
      where.companyType = companyType;
    }

    if (keyword) {
      where.OR = [
        { companyName: { contains: keyword, mode: 'insensitive' } },
        { companyNameKana: { contains: keyword, mode: 'insensitive' } },
        { address: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.parseSort(sort);

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          settings: true,
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /**
   * 会社詳細取得
   */
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!company || company.isDeleted) {
      throw new NotFoundException(`会社が見つかりません: ${id}`);
    }

    return company;
  }

  /**
   * 会社更新
   */
  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);

    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: dto,
        include: {
          settings: true,
        },
      });

      return company;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          '法人番号が既に登録されています',
        );
      }
      throw error;
    }
  }

  /**
   * 会社ソフトデリート
   */
  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.company.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    this.logger.log(`Company soft-deleted: ${id} by user: ${userId}`);
    return { message: '会社を削除しました' };
  }

  /**
   * 会社設定取得
   */
  async getSettings(companyId: string) {
    await this.findOne(companyId);

    const settings = await this.prisma.companySetting.findUnique({
      where: { companyId },
    });

    if (!settings) {
      const newSettings = await this.prisma.companySetting.create({
        data: { companyId },
      });
      return newSettings;
    }

    return settings;
  }

  /**
   * 会社設定更新
   */
  async updateSettings(companyId: string, dto: UpdateCompanySettingsDto) {
    await this.findOne(companyId);

    const { extra, ...rest } = dto;
    const settings = await this.prisma.companySetting.upsert({
      where: { companyId },
      update: {
        ...rest,
        ...(extra !== undefined ? { extra: extra as any } : {}),
      },
      create: {
        companyId,
        ...rest,
        ...(extra !== undefined ? { extra: extra as any } : {}),
      },
    });

    return settings;
  }

  /**
   * ソート文字列をPrisma orderByオブジェクトに変換
   */
  private parseSort(sort?: string): Record<string, string> {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    const [field, direction] = sort.split(':');
    const allowedFields = [
      'companyName',
      'companyType',
      'createdAt',
      'updatedAt',
    ];

    if (!allowedFields.includes(field)) {
      return { createdAt: 'desc' };
    }

    return { [field]: direction === 'asc' ? 'asc' : 'desc' };
  }
}
