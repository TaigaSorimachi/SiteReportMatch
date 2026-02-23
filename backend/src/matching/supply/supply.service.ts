import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { SearchSupplyDto } from './dto/search-supply.dto';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class SupplyService {
  constructor(private readonly prisma: PrismaService) {}

  /** 人材公開票を作成（下書き状態） */
  async create(userId: string, companyId: string | undefined, dto: CreateSupplyDto) {
    return this.prisma.supplyPosting.create({
      data: {
        userId,
        companyId,
        isSelfPosting: !companyId,
        workTypeId: dto.workTypeId,
        workTypeSubId: dto.workTypeSubId,
        contractType: dto.contractType,
        desiredDailyRate: dto.desiredDailyRate,
        desiredMonthlyRate: dto.desiredMonthlyRate,
        availableStart: new Date(dto.availableStart),
        availableEnd: new Date(dto.availableEnd),
        availableHours: dto.availableHours,
        availablePrefecture: dto.availablePrefecture,
        availableArea: dto.availableArea,
        skillLevel: dto.skillLevel,
        experienceYears: dto.experienceYears,
        licenses: dto.licenses ?? [],
        title: dto.title,
        description: dto.description,
        notes: dto.notes,
        status: 'draft',
      },
      include: {
        workType: true,
        workTypeSub: true,
        user: {
          select: { id: true, lastName: true, firstName: true, avatarUrl: true },
        },
      },
    });
  }

  /** 人材公開票一覧（ページネーション＋フィルタ） */
  async findAll(query: SearchSupplyDto): Promise<PaginatedResponse<any>> {
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
      where.availablePrefecture = query.prefecture;
    }
    if (query.workTypeId) {
      where.workTypeId = query.workTypeId;
    }
    if (query.contractType) {
      where.contractType = query.contractType;
    }
    if (query.rateMin !== undefined) {
      where.desiredDailyRate = { gte: query.rateMin };
    }
    if (query.rateMax !== undefined) {
      where.desiredDailyRate = { ...where.desiredDailyRate, lte: query.rateMax };
    }
    if (query.dateFrom) {
      where.availableEnd = { gte: new Date(query.dateFrom) };
    }
    if (query.dateTo) {
      where.availableStart = { ...where.availableStart, lte: new Date(query.dateTo) };
    }

    // Parse sort parameter
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction || 'asc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.supplyPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              lastName: true,
              firstName: true,
              avatarUrl: true,
              company: { select: { id: true, companyName: true } },
            },
          },
          workType: { select: { id: true, workTypeName: true } },
          workTypeSub: { select: { id: true, workTypeName: true } },
          _count: { select: { inquiries: true } },
        },
      }),
      this.prisma.supplyPosting.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /** 人材公開票詳細 */
  async findOne(id: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
            company: { select: { id: true, companyName: true } },
            workerProfile: {
              select: {
                experienceYears: true,
                skillLevel: true,
                specialties: true,
                avgRating: true,
                totalProjects: true,
                attendanceRate: true,
              },
            },
          },
        },
        workType: true,
        workTypeSub: true,
        _count: { select: { inquiries: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    // Increment view count
    await this.prisma.supplyPosting.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return posting;
  }

  /** 人材公開票更新 */
  async update(id: string, dto: UpdateSupplyDto) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    const data: any = { ...dto };

    if (dto.availableStart) data.availableStart = new Date(dto.availableStart);
    if (dto.availableEnd) data.availableEnd = new Date(dto.availableEnd);

    return this.prisma.supplyPosting.update({
      where: { id },
      data,
      include: {
        workType: true,
        workTypeSub: true,
        user: {
          select: { id: true, lastName: true, firstName: true, avatarUrl: true },
        },
      },
    });
  }

  /** 人材公開票を公開 */
  async publish(id: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    if (posting.status !== 'draft') {
      throw new BadRequestException('下書き状態の公開票のみ公開できます');
    }

    // Validate required fields
    if (!posting.workTypeId) {
      throw new BadRequestException('工種は必須です');
    }
    if (!posting.availableStart || !posting.availableEnd) {
      throw new BadRequestException('稼働可能期間は必須です');
    }
    if (!posting.availablePrefecture) {
      throw new BadRequestException('稼働可能都道府県は必須です');
    }

    return this.prisma.supplyPosting.update({
      where: { id },
      data: {
        status: 'open',
        publishedAt: new Date(),
      },
    });
  }

  /** 人材公開票をクローズ */
  async close(id: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    if (posting.status !== 'open') {
      throw new BadRequestException('公開中の公開票のみクローズできます');
    }

    return this.prisma.supplyPosting.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  /** 人材公開票を削除（論理削除） */
  async remove(id: string, userId: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    return this.prisma.supplyPosting.update({
      where: { id },
      data: {
        status: 'cancelled',
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  // ========== 問い合わせ関連 ==========

  /** 人材に問い合わせ */
  async inquire(
    postingId: string,
    inquirerId: string,
    companyId: string | undefined,
    dto: CreateInquiryDto,
  ) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    if (posting.status !== 'open') {
      throw new BadRequestException('公開中の公開票にのみ問い合わせできます');
    }

    // Check for duplicate inquiry
    const existing = await this.prisma.supplyInquiry.findFirst({
      where: {
        supplyPostingId: postingId,
        inquirerId,
        isDeleted: false,
        status: { not: 'rejected' },
      },
    });

    if (existing) {
      throw new ConflictException('既にこの人材に問い合わせ済みです');
    }

    const inquiry = await this.prisma.supplyInquiry.create({
      data: {
        supplyPostingId: postingId,
        inquirerId,
        inquirerCompanyId: companyId,
        projectId: dto.projectId,
        proposedRate: dto.proposedRate,
        proposedPeriod: dto.proposedPeriod,
        message: dto.message,
        status: 'pending',
      },
      include: {
        inquirer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            company: { select: { id: true, companyName: true } },
          },
        },
      },
    });

    // Update inquiry count on posting
    await this.prisma.supplyPosting.update({
      where: { id: postingId },
      data: { inquiryCount: { increment: 1 } },
    });

    return inquiry;
  }

  /** 問い合わせ一覧取得 */
  async getInquiries(postingId: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    return this.prisma.supplyInquiry.findMany({
      where: {
        supplyPostingId: postingId,
        isDeleted: false,
      },
      include: {
        inquirer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
            company: { select: { id: true, companyName: true } },
          },
        },
        project: { select: { id: true, projectName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 問い合わせを承認 → 成約作成 */
  async acceptInquiry(postingId: string, inquiryId: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    const inquiry = await this.prisma.supplyInquiry.findFirst({
      where: { id: inquiryId, supplyPostingId: postingId, isDeleted: false },
      include: { inquirer: { select: { id: true, companyId: true } } },
    });

    if (!inquiry) {
      throw new NotFoundException('問い合わせが見つかりません');
    }

    if (inquiry.status !== 'pending') {
      throw new BadRequestException('保留中の問い合わせのみ承認できます');
    }

    // Calculate timeToMatchHours
    let timeToMatchHours: number | undefined;
    if (posting.publishedAt) {
      const diffMs = Date.now() - posting.publishedAt.getTime();
      timeToMatchHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update inquiry status
      const updatedInquiry = await tx.supplyInquiry.update({
        where: { id: inquiryId },
        data: {
          status: 'accepted',
          respondedAt: new Date(),
        },
      });

      // 2. Create MatchContract
      const contract = await tx.matchContract.create({
        data: {
          supplyPostingId: postingId,
          supplyInquiryId: inquiryId,
          clientCompanyId: inquiry.inquirerCompanyId!,
          workerUserId: posting.userId,
          workerCompanyId: posting.companyId,
          projectId: inquiry.projectId,
          contractType: posting.contractType,
          agreedDailyRate: inquiry.proposedRate ?? posting.desiredDailyRate,
          workDateStart: posting.availableStart,
          workDateEnd: posting.availableEnd,
          agreedCount: 1,
          status: 'active',
          timeToMatchHours,
        },
      });

      return { inquiry: updatedInquiry, contract };
    });

    return result;
  }

  /** 問い合わせを却下 */
  async rejectInquiry(postingId: string, inquiryId: string) {
    const inquiry = await this.prisma.supplyInquiry.findFirst({
      where: { id: inquiryId, supplyPostingId: postingId, isDeleted: false },
    });

    if (!inquiry) {
      throw new NotFoundException('問い合わせが見つかりません');
    }

    if (inquiry.status !== 'pending') {
      throw new BadRequestException('保留中の問い合わせのみ却下できます');
    }

    return this.prisma.supplyInquiry.update({
      where: { id: inquiryId },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
      },
    });
  }

  // ========== メッセージ関連 ==========

  /** メッセージ一覧 */
  async getMessages(postingId: string) {
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    return this.prisma.supplyMessage.findMany({
      where: { supplyPostingId: postingId },
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
    const posting = await this.prisma.supplyPosting.findFirst({
      where: { id: postingId, isDeleted: false },
    });

    if (!posting) {
      throw new NotFoundException('人材公開票が見つかりません');
    }

    return this.prisma.supplyMessage.create({
      data: {
        supplyPostingId: postingId,
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
