import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { SearchDemandDto } from './dto/search-demand.dto';
import { ApplyDemandDto } from './dto/apply-demand.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class DemandService {
  constructor(private readonly prisma: PrismaService) {}

  /** 募集票を作成（下書き状態） */
  async create(companyId: string, postedBy: string, dto: CreateDemandDto) {
    return this.prisma.demandPosting.create({
      data: {
        companyId,
        postedBy,
        projectId: dto.projectId,
        siteName: dto.siteName,
        sitePrefecture: dto.sitePrefecture,
        siteCity: dto.siteCity,
        siteAddress: dto.siteAddress,
        contractType: dto.contractType,
        workTypeId: dto.workTypeId,
        workTypeSubId: dto.workTypeSubId,
        workDateStart: new Date(dto.workDateStart),
        workDateEnd: new Date(dto.workDateEnd),
        requiredCount: dto.requiredCount,
        dailyRateMin: dto.dailyRateMin,
        dailyRateMax: dto.dailyRateMax,
        fixedPrice: dto.fixedPrice ? BigInt(dto.fixedPrice) : undefined,
        fixedScope: dto.fixedScope,
        structureId: dto.structureId,
        floorCount: dto.floorCount,
        primeContractor: dto.primeContractor,
        contractTier: dto.contractTier,
        workTimeStart: dto.workTimeStart ? new Date(`1970-01-01T${dto.workTimeStart}:00Z`) : undefined,
        workTimeEnd: dto.workTimeEnd ? new Date(`1970-01-01T${dto.workTimeEnd}:00Z`) : undefined,
        transportationType: dto.transportationType,
        safetyDocSystem: dto.safetyDocSystem,
        ccusRequired: dto.ccusRequired ?? false,
        requiredSkillLevel: dto.requiredSkillLevel,
        requiredLicenses: dto.requiredLicenses ?? [],
        providesParking: dto.providesParking ?? false,
        providesTools: dto.providesTools ?? false,
        providesMeals: dto.providesMeals ?? false,
        description: dto.description,
        notes: dto.notes,
        status: 'draft',
      },
      include: {
        workType: true,
        workTypeSub: true,
        structure: true,
        company: { select: { id: true, companyName: true } },
      },
    });
  }

  /** 募集票一覧（ページネーション＋フィルタ） */
  async findAll(query: SearchDemandDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }
    if (query.prefecture) {
      where.sitePrefecture = query.prefecture;
    }
    if (query.city) {
      where.siteCity = { contains: query.city };
    }
    if (query.workTypeId) {
      where.workTypeId = query.workTypeId;
    }
    if (query.contractType) {
      where.contractType = query.contractType;
    }
    if (query.rateMin !== undefined) {
      where.dailyRateMax = { gte: query.rateMin };
    }
    if (query.rateMax !== undefined) {
      where.dailyRateMin = { ...where.dailyRateMin, lte: query.rateMax };
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
      this.prisma.demandPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: { select: { id: true, companyName: true } },
          workType: { select: { id: true, workTypeName: true } },
          workTypeSub: { select: { id: true, workTypeName: true } },
          structure: { select: { id: true, structureName: true } },
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.demandPosting.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /** 募集票詳細 */
  async findOne(id: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
      include: {
        company: { select: { id: true, companyName: true } },
        workType: true,
        workTypeSub: true,
        structure: true,
        project: { select: { id: true, projectName: true } },
        poster: { select: { id: true, lastName: true, firstName: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    // Increment view count
    await this.prisma.demandPosting.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return posting;
  }

  /** 募集票更新 */
  async update(id: string, dto: UpdateDemandDto) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    const data: any = { ...dto };

    if (dto.workDateStart) data.workDateStart = new Date(dto.workDateStart);
    if (dto.workDateEnd) data.workDateEnd = new Date(dto.workDateEnd);
    if (dto.fixedPrice !== undefined) data.fixedPrice = BigInt(dto.fixedPrice);
    if (dto.workTimeStart) data.workTimeStart = new Date(`1970-01-01T${dto.workTimeStart}:00Z`);
    if (dto.workTimeEnd) data.workTimeEnd = new Date(`1970-01-01T${dto.workTimeEnd}:00Z`);

    return this.prisma.demandPosting.update({
      where: { id },
      data,
      include: {
        workType: true,
        workTypeSub: true,
        structure: true,
        company: { select: { id: true, companyName: true } },
      },
    });
  }

  /** 募集票を公開 */
  async publish(id: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    if (posting.status !== 'draft') {
      throw new BadRequestException('下書き状態の募集票のみ公開できます');
    }

    // Validate required fields
    if (!posting.siteName || !posting.sitePrefecture || !posting.siteCity) {
      throw new BadRequestException('現場名・都道府県・市区町村は必須です');
    }
    if (!posting.workTypeId) {
      throw new BadRequestException('工種は必須です');
    }
    if (!posting.workDateStart || !posting.workDateEnd) {
      throw new BadRequestException('作業期間は必須です');
    }
    if (!posting.contractType) {
      throw new BadRequestException('契約形態は必須です');
    }

    return this.prisma.demandPosting.update({
      where: { id },
      data: {
        status: 'open',
        publishedAt: new Date(),
      },
    });
  }

  /** 募集票を一時停止 */
  async suspend(id: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    if (posting.status !== 'open') {
      throw new BadRequestException('公開中の募集票のみ一時停止できます');
    }

    return this.prisma.demandPosting.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }

  /** 募集票をクローズ */
  async close(id: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    if (posting.status !== 'open') {
      throw new BadRequestException('公開中の募集票のみクローズできます');
    }

    return this.prisma.demandPosting.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  /** 募集票を削除（論理削除） */
  async remove(id: string, userId: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    return this.prisma.demandPosting.update({
      where: { id },
      data: {
        status: 'cancelled',
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  // ========== 応募関連 ==========

  /** 募集に応募 */
  async apply(postingId: string, applicantId: string, dto: ApplyDemandDto) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    if (posting.status !== 'open') {
      throw new BadRequestException('公開中の募集票にのみ応募できます');
    }

    // Check for duplicate application
    const existing = await this.prisma.demandApplication.findFirst({
      where: {
        postingId,
        applicantId,
        isDeleted: false,
        status: { not: 'rejected' },
      },
    });

    if (existing) {
      throw new ConflictException('既にこの募集に応募済みです');
    }

    // Get applicant info for applicantType
    const applicant = await this.prisma.user.findUnique({
      where: { id: applicantId },
      select: { companyId: true, isIndividual: true },
    });

    const application = await this.prisma.demandApplication.create({
      data: {
        postingId,
        applicantId,
        applicantCompanyId: applicant?.companyId,
        applicantType: applicant?.isIndividual ? 'individual' : 'company',
        proposedRate: dto.proposedRate,
        proposedPrice: dto.proposedPrice ? BigInt(dto.proposedPrice) : undefined,
        availableCount: dto.availableCount ?? 1,
        availableDates: dto.availableDates?.map((d) => new Date(d)) ?? [],
        message: dto.message,
        status: 'pending',
      },
      include: {
        applicant: {
          select: { id: true, lastName: true, firstName: true, companyId: true },
        },
      },
    });

    // Update application count on posting
    await this.prisma.demandPosting.update({
      where: { id: postingId },
      data: { applicationCount: { increment: 1 } },
    });

    return application;
  }

  /** 応募一覧取得 */
  async getApplications(postingId: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    return this.prisma.demandApplication.findMany({
      where: {
        postingId,
        isDeleted: false,
      },
      include: {
        applicant: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
            companyId: true,
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 応募を承認 → 成約作成 */
  async acceptApplication(postingId: string, applicationId: string, responderId: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    const application = await this.prisma.demandApplication.findFirst({
      where: { id: applicationId, postingId, isDeleted: false },
      include: { applicant: { select: { id: true, companyId: true } } },
    });

    if (!application) {
      throw new NotFoundException('応募が見つかりません');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('保留中の応募のみ承認できます');
    }

    // Calculate timeToMatchHours
    let timeToMatchHours: number | undefined;
    if (posting.publishedAt) {
      const diffMs = Date.now() - posting.publishedAt.getTime();
      timeToMatchHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }

    // Determine agreed rate
    const agreedDailyRate = application.proposedRate ?? posting.dailyRateMin ?? undefined;
    const agreedFixedPrice = application.proposedPrice ?? posting.fixedPrice ?? undefined;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApplication = await tx.demandApplication.update({
        where: { id: applicationId },
        data: {
          status: 'accepted',
          respondedAt: new Date(),
          respondedBy: responderId,
        },
      });

      // 2. Create MatchContract
      const contract = await tx.matchContract.create({
        data: {
          demandPostingId: postingId,
          demandAppId: applicationId,
          clientCompanyId: posting.companyId,
          workerUserId: application.applicantId,
          workerCompanyId: application.applicantCompanyId,
          projectId: posting.projectId,
          contractType: posting.contractType,
          agreedDailyRate,
          agreedFixedPrice,
          workDateStart: posting.workDateStart,
          workDateEnd: posting.workDateEnd,
          agreedCount: application.availableCount,
          status: 'active',
          timeToMatchHours,
        },
      });

      // 3. Update confirmedCount
      const newConfirmedCount = posting.confirmedCount + application.availableCount;
      const updateData: any = { confirmedCount: newConfirmedCount };

      // If confirmedCount >= requiredCount, set status to 'filled'
      if (newConfirmedCount >= posting.requiredCount) {
        updateData.status = 'filled';
      }

      await tx.demandPosting.update({
        where: { id: postingId },
        data: updateData,
      });

      return { application: updatedApplication, contract };
    });

    return result;
  }

  /** 応募を却下 */
  async rejectApplication(
    postingId: string,
    applicationId: string,
    responderId: string,
    reason?: string,
  ) {
    const application = await this.prisma.demandApplication.findFirst({
      where: { id: applicationId, postingId, isDeleted: false },
    });

    if (!application) {
      throw new NotFoundException('応募が見つかりません');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('保留中の応募のみ却下できます');
    }

    return this.prisma.demandApplication.update({
      where: { id: applicationId },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
        respondedBy: responderId,
        rejectionReason: reason,
      },
    });
  }

  // ========== メッセージ関連 ==========

  /** メッセージ一覧 */
  async getMessages(postingId: string) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    return this.prisma.demandMessage.findMany({
      where: { postingId },
      include: {
        sender: {
          select: { id: true, lastName: true, firstName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** メッセージ送信 */
  async sendMessage(postingId: string, senderId: string, dto: SendMessageDto) {
    const posting = await this.prisma.demandPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('募集票が見つかりません');
    }

    return this.prisma.demandMessage.create({
      data: {
        postingId,
        senderId,
        messageText: dto.messageText,
      },
      include: {
        sender: {
          select: { id: true, lastName: true, firstName: true, avatarUrl: true },
        },
      },
    });
  }
}
