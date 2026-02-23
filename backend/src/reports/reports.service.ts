import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateReportBatchDto } from './dto/create-report-batch.dto';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { SearchReportDto } from './dto/search-report.dto';
import { CreateSafetyRecordDto } from './dto/create-safety-record.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 一括入力モードで日報を作成する
   */
  async createBatch(workerId: string, dto: CreateReportBatchDto) {
    const clockInDate = new Date(dto.clockIn);
    const clockOutDate = new Date(dto.clockOut);
    const breakMinutes = dto.breakMinutes ?? 0;

    // バリデーション: clockOut > clockIn
    if (clockOutDate <= clockInDate) {
      throw new BadRequestException(
        '退勤時刻は出勤時刻より後である必要があります',
      );
    }

    // バリデーション: 24時間以内
    const diffMs = clockOutDate.getTime() - clockInDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > 24) {
      throw new BadRequestException(
        '出勤時刻と退勤時刻の差は24時間以内である必要があります',
      );
    }

    // 作業時間計算
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    if (breakMinutes > totalMinutes) {
      throw new BadRequestException(
        '休憩時間が勤務時間を超えています',
      );
    }
    const workMinutes = totalMinutes - breakMinutes;

    // 会社設定を取得して人工数・残業を計算
    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
      select: { companyId: true },
    });
    if (!worker || !worker.companyId) {
      throw new BadRequestException('作業者の会社情報が見つかりません');
    }

    const companySetting = await this.prisma.companySetting.findUnique({
      where: { companyId: worker.companyId },
    });

    const standardWorkHours = companySetting
      ? Number(companySetting.standardWorkHours)
      : 8.0;
    const overtimeThresholdHours = companySetting
      ? Number(companySetting.overtimeThresholdHours)
      : 8.0;

    // 人工数計算 (0.25単位に丸め)
    const rawManDays = workMinutes / (standardWorkHours * 60);
    const manDays =
      dto.manDays ?? Math.round(rawManDays * 4) / 4;

    // 残業時間計算
    const overtimeMinutes = Math.max(
      0,
      workMinutes - overtimeThresholdHours * 60,
    );

    // 重複チェック
    const existing = await this.prisma.dailyReport.findUnique({
      where: {
        workerId_reportDate_projectId: {
          workerId,
          reportDate: new Date(dto.reportDate),
          projectId: dto.projectId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        '同一作業者・日付・プロジェクトの日報が既に存在します',
      );
    }

    // トランザクションで日報と原価明細を作成
    const report = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dailyReport.create({
        data: {
          companyId: worker.companyId!,
          projectId: dto.projectId,
          workerId,
          reportDate: new Date(dto.reportDate),
          inputMode: dto.inputMode ?? 'batch',
          clockIn: clockInDate,
          clockOut: clockOutDate,
          breakMinutes,
          workMinutes,
          manDays,
          overtimeMinutes,
          workContent: dto.workContent,
          progressPct: dto.progressPct,
          weather: dto.weather,
          status: 'draft',
          clockInLat: dto.location?.lat,
          clockInLng: dto.location?.lng,
        },
        include: {
          costItems: true,
          project: { select: { id: true, projectName: true } },
        },
      });

      // 原価明細を作成
      if (dto.costItems && dto.costItems.length > 0) {
        await tx.reportCostItem.createMany({
          data: dto.costItems.map((item) => ({
            reportId: created.id,
            costType: item.costType,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        });
      }

      // costItemsを含めて再取得
      return tx.dailyReport.findUnique({
        where: { id: created.id },
        include: {
          costItems: true,
          project: { select: { id: true, projectName: true } },
        },
      });
    });

    return report;
  }

  /**
   * リアルタイム出勤打刻
   */
  async clockIn(workerId: string, dto: ClockInDto) {
    // 進行中の日報がないかチェック
    const inProgress = await this.prisma.dailyReport.findFirst({
      where: {
        workerId,
        status: 'in_progress',
        isDeleted: false,
      },
    });
    if (inProgress) {
      throw new ConflictException(
        '進行中の日報が既に存在します。先に退勤打刻を行ってください',
      );
    }

    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
      select: { companyId: true },
    });
    if (!worker || !worker.companyId) {
      throw new BadRequestException('作業者の会社情報が見つかりません');
    }

    const now = new Date();
    const reportDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const report = await this.prisma.dailyReport.create({
      data: {
        companyId: worker.companyId,
        projectId: dto.projectId,
        workerId,
        reportDate,
        inputMode: 'realtime',
        clockIn: now,
        status: 'in_progress',
        clockInLat: dto.location?.lat,
        clockInLng: dto.location?.lng,
      },
      include: {
        project: { select: { id: true, projectName: true } },
      },
    });

    return report;
  }

  /**
   * リアルタイム退勤打刻
   */
  async clockOut(reportId: string, workerId: string, dto: ClockOutDto) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: { breakLogs: true },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.workerId !== workerId) {
      throw new ForbiddenException('この日報の退勤打刻権限がありません');
    }
    if (report.status !== 'in_progress') {
      throw new BadRequestException(
        '進行中の日報のみ退勤打刻できます',
      );
    }

    const now = new Date();
    const clockIn = report.clockIn!;
    const diffMs = now.getTime() - clockIn.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // breakLogsの合計休憩時間を計算
    const totalBreakMinutes = report.breakLogs.reduce(
      (sum, log) => sum + (log.breakMinutes ?? 0),
      0,
    );

    const workMinutes = Math.max(0, totalMinutes - totalBreakMinutes);

    // 会社設定から人工数・残業を計算
    const companySetting = await this.prisma.companySetting.findUnique({
      where: { companyId: report.companyId },
    });

    const standardWorkHours = companySetting
      ? Number(companySetting.standardWorkHours)
      : 8.0;
    const overtimeThresholdHours = companySetting
      ? Number(companySetting.overtimeThresholdHours)
      : 8.0;

    const rawManDays = workMinutes / (standardWorkHours * 60);
    const manDays = Math.round(rawManDays * 4) / 4;
    const overtimeMinutes = Math.max(
      0,
      workMinutes - overtimeThresholdHours * 60,
    );

    // トランザクションで更新
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReport = await tx.dailyReport.update({
        where: { id: reportId },
        data: {
          clockOut: now,
          breakMinutes: totalBreakMinutes,
          workMinutes,
          manDays,
          overtimeMinutes,
          status: 'draft',
          workContent: dto.workContent,
          progressPct: dto.progressPct,
          clockOutLat: dto.location?.lat,
          clockOutLng: dto.location?.lng,
        },
        include: {
          costItems: true,
          project: { select: { id: true, projectName: true } },
        },
      });

      // 原価明細を作成
      if (dto.costItems && dto.costItems.length > 0) {
        await tx.reportCostItem.createMany({
          data: dto.costItems.map((item) => ({
            reportId,
            costType: item.costType,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        });
      }

      return tx.dailyReport.findUnique({
        where: { id: reportId },
        include: {
          costItems: true,
          project: { select: { id: true, projectName: true } },
        },
      });
    });

    return updated;
  }

  /**
   * 休憩開始
   */
  async startBreak(reportId: string, workerId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.workerId !== workerId) {
      throw new ForbiddenException('この日報の休憩操作権限がありません');
    }
    if (report.status !== 'in_progress') {
      throw new BadRequestException(
        '進行中の日報のみ休憩を開始できます',
      );
    }

    // 終了していない休憩がないかチェック
    const openBreak = await this.prisma.breakLog.findFirst({
      where: {
        reportId,
        breakEnd: null,
      },
    });
    if (openBreak) {
      throw new ConflictException(
        '終了していない休憩が既に存在します',
      );
    }

    const breakLog = await this.prisma.breakLog.create({
      data: {
        reportId,
        breakStart: new Date(),
      },
    });

    return breakLog;
  }

  /**
   * 休憩終了
   */
  async endBreak(reportId: string, workerId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.workerId !== workerId) {
      throw new ForbiddenException('この日報の休憩操作権限がありません');
    }
    if (report.status !== 'in_progress') {
      throw new BadRequestException(
        '進行中の日報のみ休憩を終了できます',
      );
    }

    // 最新の未終了休憩を取得
    const openBreak = await this.prisma.breakLog.findFirst({
      where: {
        reportId,
        breakEnd: null,
      },
      orderBy: { breakStart: 'desc' },
    });
    if (!openBreak) {
      throw new BadRequestException(
        '開始済みの休憩が見つかりません',
      );
    }

    const now = new Date();
    const breakMinutes = Math.floor(
      (now.getTime() - openBreak.breakStart.getTime()) / (1000 * 60),
    );

    // トランザクションで休憩ログ更新 + 日報の休憩合計を更新
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedBreak = await tx.breakLog.update({
        where: { id: openBreak.id },
        data: {
          breakEnd: now,
          breakMinutes,
        },
      });

      // 全休憩ログの合計を再計算
      const allBreaks = await tx.breakLog.findMany({
        where: { reportId },
      });
      const totalBreakMinutes = allBreaks.reduce(
        (sum, log) => sum + (log.breakMinutes ?? 0),
        0,
      );

      await tx.dailyReport.update({
        where: { id: reportId },
        data: { breakMinutes: totalBreakMinutes },
      });

      return updatedBreak;
    });

    return result;
  }

  /**
   * 日報更新
   */
  async update(reportId: string, dto: UpdateReportDto) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.isDeleted) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.status === 'approved') {
      throw new BadRequestException('承認済みの日報は更新できません');
    }

    const updated = await this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        workContent: dto.workContent ?? undefined,
        progressPct: dto.progressPct ?? undefined,
        weather: dto.weather ?? undefined,
        notes: dto.notes ?? undefined,
      },
      include: {
        costItems: true,
        project: { select: { id: true, projectName: true } },
      },
    });

    return updated;
  }

  /**
   * 日報提出 (draft -> submitted)
   */
  async submit(reportId: string, workerId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.workerId !== workerId) {
      throw new ForbiddenException('この日報の提出権限がありません');
    }
    if (report.status !== 'draft') {
      throw new BadRequestException(
        '下書き状態の日報のみ提出できます',
      );
    }

    const updated = await this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        costItems: true,
        project: { select: { id: true, projectName: true } },
      },
    });

    return updated;
  }

  /**
   * 日報承認 (submitted -> approved)
   */
  async approve(reportId: string, approverId: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.status !== 'submitted') {
      throw new BadRequestException(
        '提出済みの日報のみ承認できます',
      );
    }

    const updated = await this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        costItems: true,
        project: { select: { id: true, projectName: true } },
      },
    });

    return updated;
  }

  /**
   * 日報差戻し (submitted -> rejected)
   */
  async reject(reportId: string, approverId: string, reason: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.status !== 'submitted') {
      throw new BadRequestException(
        '提出済みの日報のみ差戻しできます',
      );
    }

    const updated = await this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        status: 'rejected',
        approvedBy: approverId,
        rejectionReason: reason,
      },
      include: {
        costItems: true,
        project: { select: { id: true, projectName: true } },
      },
    });

    return updated;
  }

  /**
   * 日報一覧取得 (ページネーション + フィルタ)
   */
  async findAll(query: SearchReportDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.workerId) {
      where.workerId = query.workerId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.dateFrom || query.dateTo) {
      where.reportDate = {};
      if (query.dateFrom) {
        where.reportDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.reportDate.lte = new Date(query.dateTo);
      }
    }

    // ソート解析
    let orderBy: any = { reportDate: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyReport.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          project: {
            select: { id: true, projectName: true, projectCode: true },
          },
          worker: {
            select: { id: true, lastName: true, firstName: true },
          },
          costItems: true,
        },
      }),
      this.prisma.dailyReport.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /**
   * 日報詳細取得
   */
  async findOne(id: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
            siteName: true,
          },
        },
        worker: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
          },
        },
        approver: {
          select: { id: true, lastName: true, firstName: true },
        },
        costItems: true,
        photos: true,
        breakLogs: {
          orderBy: { breakStart: 'asc' },
        },
        safetyRecords: true,
      },
    });

    if (!report || report.isDeleted) {
      throw new NotFoundException('日報が見つかりません');
    }

    return report;
  }

  /**
   * 原価明細追加
   */
  async addCostItem(reportId: string, dto: CreateCostItemDto) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.isDeleted) {
      throw new NotFoundException('日報が見つかりません');
    }
    if (report.status === 'approved') {
      throw new BadRequestException(
        '承認済みの日報には原価明細を追加できません',
      );
    }

    const costItem = await this.prisma.reportCostItem.create({
      data: {
        reportId,
        costType: dto.costType,
        itemName: dto.itemName,
        quantity: dto.quantity,
        unit: dto.unit,
        unitPrice: dto.unitPrice,
        amount: dto.amount,
      },
    });

    return costItem;
  }

  /**
   * 写真追加
   */
  async addPhoto(
    reportId: string,
    photoUrl: string,
    photoType?: string,
    caption?: string,
  ) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.isDeleted) {
      throw new NotFoundException('日報が見つかりません');
    }

    const photo = await this.prisma.reportPhoto.create({
      data: {
        reportId,
        photoUrl,
        photoType,
        caption,
        takenAt: new Date(),
      },
    });

    return photo;
  }

  /**
   * 安全KY記録追加
   */
  async addSafetyRecord(
    reportId: string,
    recordedBy: string,
    dto: CreateSafetyRecordDto,
  ) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.isDeleted) {
      throw new NotFoundException('日報が見つかりません');
    }

    const safetyRecord = await this.prisma.safetyRecord.create({
      data: {
        reportId,
        projectId: dto.projectId,
        recordedBy,
        recordDate: dto.recordDate
          ? new Date(dto.recordDate)
          : new Date(),
        hazardIdentified: dto.hazardIdentified,
        countermeasure: dto.countermeasure,
        safetyOfficer: dto.safetyOfficer,
        participants: dto.participants ?? [],
        participantCount:
          dto.participantCount ?? dto.participants?.length ?? 0,
      },
    });

    return safetyRecord;
  }
}
