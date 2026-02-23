import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { SearchContractsDto } from './dto/search-contracts.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CancelContractDto } from './dto/cancel-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 成約一覧（ページネーション＋フィルタ） */
  async findAll(query: SearchContractsDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }
    if (query.companyId) {
      where.OR = [
        { clientCompanyId: query.companyId },
        { workerCompanyId: query.companyId },
      ];
    }
    if (query.dateFrom) {
      where.workDateEnd = { gte: new Date(query.dateFrom) };
    }
    if (query.dateTo) {
      where.workDateStart = { ...where.workDateStart, lte: new Date(query.dateTo) };
    }

    // Parse sort parameter
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction || 'asc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.matchContract.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          clientCompany: { select: { id: true, companyName: true } },
          workerUser: {
            select: { id: true, lastName: true, firstName: true, avatarUrl: true },
          },
          workerCompany: { select: { id: true, companyName: true } },
          demandPosting: {
            select: { id: true, siteName: true, sitePrefecture: true, siteCity: true },
          },
          supplyPosting: {
            select: { id: true, title: true, availablePrefecture: true },
          },
          project: { select: { id: true, projectName: true } },
        },
      }),
      this.prisma.matchContract.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /** 成約詳細 */
  async findOne(id: string) {
    const contract = await this.prisma.matchContract.findFirst({
      where: { id, isDeleted: false },
      include: {
        clientCompany: { select: { id: true, companyName: true } },
        workerUser: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
            phone: true,
            email: true,
            company: { select: { id: true, companyName: true } },
            workerProfile: {
              select: {
                experienceYears: true,
                skillLevel: true,
                avgRating: true,
              },
            },
          },
        },
        workerCompany: { select: { id: true, companyName: true } },
        demandPosting: {
          include: {
            workType: { select: { id: true, workTypeName: true } },
            structure: { select: { id: true, structureName: true } },
          },
        },
        supplyPosting: {
          include: {
            workType: { select: { id: true, workTypeName: true } },
          },
        },
        project: { select: { id: true, projectName: true, projectCode: true } },
        reviews: {
          include: {
            reviewer: { select: { id: true, lastName: true, firstName: true } },
            reviewee: { select: { id: true, lastName: true, firstName: true } },
          },
        },
        cancelLogs: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('成約が見つかりません');
    }

    return contract;
  }

  /** 成約を完了 */
  async complete(id: string) {
    const contract = await this.prisma.matchContract.findFirst({
      where: { id, isDeleted: false },
    });

    if (!contract) {
      throw new NotFoundException('成約が見つかりません');
    }

    if (contract.status !== 'active') {
      throw new BadRequestException('アクティブな成約のみ完了できます');
    }

    return this.prisma.matchContract.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }

  /** 成約をキャンセル */
  async cancel(id: string, userId: string, dto: CancelContractDto) {
    const contract = await this.prisma.matchContract.findFirst({
      where: { id, isDeleted: false },
    });

    if (!contract) {
      throw new NotFoundException('成約が見つかりません');
    }

    if (contract.status !== 'active') {
      throw new BadRequestException('アクティブな成約のみキャンセルできます');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update contract status
      const updatedContract = await tx.matchContract.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: dto.cancelReason,
        },
      });

      // 2. Create MatchCancelLog
      const cancelLog = await tx.matchCancelLog.create({
        data: {
          contractId: id,
          demandPostingId: contract.demandPostingId,
          supplyPostingId: contract.supplyPostingId,
          cancelledBy: userId,
          cancelReason: dto.cancelReason,
          cancelType: dto.cancelType,
          penaltyAmount: dto.penaltyAmount ?? 0,
        },
      });

      return { contract: updatedContract, cancelLog };
    });
  }

  /** レビュー追加 */
  async addReview(contractId: string, reviewerId: string, dto: CreateReviewDto) {
    const contract = await this.prisma.matchContract.findFirst({
      where: { id: contractId, isDeleted: false },
    });

    if (!contract) {
      throw new NotFoundException('成約が見つかりません');
    }

    if (contract.status !== 'completed' && contract.status !== 'active') {
      throw new BadRequestException('アクティブまたは完了済みの成約にのみレビューできます');
    }

    // Check for duplicate review
    const existing = await this.prisma.matchReview.findFirst({
      where: {
        contractId,
        reviewerId,
        reviewType: dto.reviewType,
      },
    });

    if (existing) {
      throw new BadRequestException('既にこの成約にレビュー済みです');
    }

    return this.prisma.matchReview.create({
      data: {
        contractId,
        reviewerId,
        revieweeId: dto.revieweeId,
        reviewType: dto.reviewType,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        reviewer: { select: { id: true, lastName: true, firstName: true } },
        reviewee: { select: { id: true, lastName: true, firstName: true } },
      },
    });
  }

  /** ダッシュボード — 今週の人員過不足データ */
  async getDashboard(companyId: string) {
    const now = new Date();
    // Get start of current week (Monday)
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get staffing requirements for the week
    const staffingRequirements = await this.prisma.projectStaffing.findMany({
      where: {
        project: { companyId, isDeleted: false },
        targetDate: { gte: weekStart, lte: weekEnd },
      },
      include: {
        project: { select: { id: true, projectName: true } },
        workType: { select: { id: true, workTypeName: true } },
      },
      orderBy: { targetDate: 'asc' },
    });

    // Get active demand postings
    const openDemands = await this.prisma.demandPosting.count({
      where: {
        companyId,
        status: 'open',
        isDeleted: false,
        workDateStart: { lte: weekEnd },
        workDateEnd: { gte: weekStart },
      },
    });

    // Get active contracts for the week
    const activeContracts = await this.prisma.matchContract.count({
      where: {
        clientCompanyId: companyId,
        status: 'active',
        isDeleted: false,
        workDateStart: { lte: weekEnd },
        workDateEnd: { gte: weekStart },
      },
    });

    // Calculate shortage/surplus per day
    const dailySummary: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStaffing = staffingRequirements.filter(
        (s) => s.targetDate.toISOString().split('T')[0] === dateStr,
      );

      const totalRequired = dayStaffing.reduce((sum, s) => sum + s.requiredCount, 0);
      const totalConfirmed = dayStaffing.reduce((sum, s) => sum + s.confirmedCount, 0);

      dailySummary.push({
        date: dateStr,
        required: totalRequired,
        confirmed: totalConfirmed,
        shortage: Math.max(0, totalRequired - totalConfirmed),
        surplus: Math.max(0, totalConfirmed - totalRequired),
      });
    }

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      dailySummary,
      openDemands,
      activeContracts,
      staffingDetails: staffingRequirements,
    };
  }

  /** マッチングKPI */
  async getKpi(companyId?: string) {
    const baseWhere: any = { isDeleted: false };
    if (companyId) {
      baseWhere.clientCompanyId = companyId;
    }

    // Total contracts
    const totalContracts = await this.prisma.matchContract.count({
      where: baseWhere,
    });

    // Active contracts
    const activeContracts = await this.prisma.matchContract.count({
      where: { ...baseWhere, status: 'active' },
    });

    // Completed contracts
    const completedContracts = await this.prisma.matchContract.count({
      where: { ...baseWhere, status: 'completed' },
    });

    // Cancelled contracts
    const cancelledContracts = await this.prisma.matchContract.count({
      where: { ...baseWhere, status: 'cancelled' },
    });

    // Average time to match (hours)
    const matchTimeResult = await this.prisma.matchContract.aggregate({
      where: {
        ...baseWhere,
        timeToMatchHours: { not: null },
      },
      _avg: { timeToMatchHours: true },
    });

    // Average review rating
    const reviewWhere: any = {};
    if (companyId) {
      reviewWhere.contract = {
        OR: [
          { clientCompanyId: companyId },
          { workerCompanyId: companyId },
        ],
      };
    }
    const ratingResult = await this.prisma.matchReview.aggregate({
      where: reviewWhere,
      _avg: { rating: true },
      _count: { id: true },
    });

    // Demand posting stats
    const demandBaseWhere: any = { isDeleted: false };
    if (companyId) {
      demandBaseWhere.companyId = companyId;
    }

    const totalDemands = await this.prisma.demandPosting.count({
      where: demandBaseWhere,
    });

    const openDemands = await this.prisma.demandPosting.count({
      where: { ...demandBaseWhere, status: 'open' },
    });

    const filledDemands = await this.prisma.demandPosting.count({
      where: { ...demandBaseWhere, status: 'filled' },
    });

    // Fill rate
    const fillRate = totalDemands > 0
      ? Math.round((filledDemands / totalDemands) * 1000) / 10
      : 0;

    // Cancel rate
    const cancelRate = totalContracts > 0
      ? Math.round((cancelledContracts / totalContracts) * 1000) / 10
      : 0;

    return {
      contracts: {
        total: totalContracts,
        active: activeContracts,
        completed: completedContracts,
        cancelled: cancelledContracts,
        cancelRate,
      },
      matching: {
        avgTimeToMatchHours: matchTimeResult._avg.timeToMatchHours
          ? Number(matchTimeResult._avg.timeToMatchHours)
          : null,
      },
      reviews: {
        avgRating: ratingResult._avg.rating ?? null,
        totalReviews: ratingResult._count.id,
      },
      demand: {
        total: totalDemands,
        open: openDemands,
        filled: filledDemands,
        fillRate,
      },
    };
  }
}
