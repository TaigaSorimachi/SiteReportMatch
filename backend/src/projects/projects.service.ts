import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SearchProjectDto } from './dto/search-project.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { UpdateStaffingDto } from './dto/update-staffing.dto';
import { StaffingSummaryResponseDto } from './dto/staffing-summary.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { Prisma } from '@prisma/client';

/** Valid project status values */
const PROJECT_STATUSES = [
  'planning',
  'active',
  'suspended',
  'completed',
  'cancelled',
] as const;

/** Allowed status transitions: from -> [to, ...] */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  planning: ['active', 'cancelled'],
  active: ['suspended', 'completed', 'cancelled'],
  suspended: ['active', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Projects CRUD
  // =========================================================================

  async create(dto: CreateProjectDto) {
    const data: Prisma.ProjectCreateInput = {
      company: { connect: { id: dto.companyId } },
      projectCode: dto.projectCode,
      projectName: dto.projectName,
      description: dto.description,
      contractTier: dto.contractTier ?? 1,
      floorCount: dto.floorCount,
      propertyType: dto.propertyType,
      siteName: dto.siteName,
      sitePostalCode: dto.sitePostalCode,
      sitePrefecture: dto.sitePrefecture,
      siteCity: dto.siteCity,
      siteAddress: dto.siteAddress,
      siteLat: dto.siteLat,
      siteLng: dto.siteLng,
      geofenceRadiusM: dto.geofenceRadiusM ?? 300,
      scheduledStart: dto.scheduledStart
        ? new Date(dto.scheduledStart)
        : undefined,
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
      contractAmount: dto.contractAmount,
      estimatedCost: dto.estimatedCost,
      taxRate: dto.taxRate ?? 10.0,
      safetyDocSystem: dto.safetyDocSystem,
      ccusRequired: dto.ccusRequired ?? false,
      notes: dto.notes,
      status: 'planning',
    };

    if (dto.clientCompanyId) {
      data.clientCompany = { connect: { id: dto.clientCompanyId } };
    }
    if (dto.primeContractorId) {
      data.primeContractor = { connect: { id: dto.primeContractorId } };
    }
    if (dto.primaryWorkTypeId) {
      data.primaryWorkType = { connect: { id: dto.primaryWorkTypeId } };
    }
    if (dto.structureId) {
      data.structure = { connect: { id: dto.structureId } };
    }
    if (dto.salesPersonId) {
      data.salesPerson = { connect: { id: dto.salesPersonId } };
    }
    if (dto.siteManagerId) {
      data.siteManager = { connect: { id: dto.siteManagerId } };
    }
    if (dto.foremanId) {
      data.foreman = { connect: { id: dto.foremanId } };
    }

    return this.prisma.project.create({
      data,
      include: {
        company: true,
        clientCompany: true,
        primeContractor: true,
        primaryWorkType: true,
        structure: true,
        salesPerson: true,
        siteManager: true,
        foreman: true,
      },
    });
  }

  async findAll(query: SearchProjectDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.dateFrom || query.dateTo) {
      where.scheduledStart = {};
      if (query.dateFrom) {
        where.scheduledStart.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.scheduledEnd = { lte: new Date(query.dateTo) };
      }
    }

    if (query.keyword) {
      where.OR = [
        { projectName: { contains: query.keyword, mode: 'insensitive' } },
        { siteName: { contains: query.keyword, mode: 'insensitive' } },
        { projectCode: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    // Parse sort parameter
    let orderBy: Prisma.ProjectOrderByWithRelationInput = {
      createdAt: 'desc',
    };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      if (field && (direction === 'asc' || direction === 'desc')) {
        orderBy = { [field]: direction };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: true,
          clientCompany: true,
          primeContractor: true,
          primaryWorkType: true,
          salesPerson: true,
          siteManager: true,
          foreman: true,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, isDeleted: false },
      include: {
        company: true,
        clientCompany: true,
        primeContractor: true,
        primaryWorkType: true,
        structure: true,
        salesPerson: true,
        siteManager: true,
        foreman: true,
        phases: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(id);

    const data: Prisma.ProjectUpdateInput = {};

    // Map scalar fields
    if (dto.projectCode !== undefined) data.projectCode = dto.projectCode;
    if (dto.projectName !== undefined) data.projectName = dto.projectName;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.contractTier !== undefined) data.contractTier = dto.contractTier;
    if (dto.floorCount !== undefined) data.floorCount = dto.floorCount;
    if (dto.propertyType !== undefined) data.propertyType = dto.propertyType;
    if (dto.siteName !== undefined) data.siteName = dto.siteName;
    if (dto.sitePostalCode !== undefined)
      data.sitePostalCode = dto.sitePostalCode;
    if (dto.sitePrefecture !== undefined)
      data.sitePrefecture = dto.sitePrefecture;
    if (dto.siteCity !== undefined) data.siteCity = dto.siteCity;
    if (dto.siteAddress !== undefined) data.siteAddress = dto.siteAddress;
    if (dto.siteLat !== undefined) data.siteLat = dto.siteLat;
    if (dto.siteLng !== undefined) data.siteLng = dto.siteLng;
    if (dto.geofenceRadiusM !== undefined)
      data.geofenceRadiusM = dto.geofenceRadiusM;
    if (dto.scheduledStart !== undefined)
      data.scheduledStart = dto.scheduledStart
        ? new Date(dto.scheduledStart)
        : null;
    if (dto.scheduledEnd !== undefined)
      data.scheduledEnd = dto.scheduledEnd
        ? new Date(dto.scheduledEnd)
        : null;
    if (dto.contractAmount !== undefined)
      data.contractAmount = dto.contractAmount;
    if (dto.estimatedCost !== undefined) data.estimatedCost = dto.estimatedCost;
    if (dto.taxRate !== undefined) data.taxRate = dto.taxRate;
    if (dto.safetyDocSystem !== undefined)
      data.safetyDocSystem = dto.safetyDocSystem;
    if (dto.ccusRequired !== undefined) data.ccusRequired = dto.ccusRequired;
    if (dto.notes !== undefined) data.notes = dto.notes;

    // Map relation fields
    if (dto.companyId !== undefined) {
      data.company = { connect: { id: dto.companyId } };
    }
    if (dto.clientCompanyId !== undefined) {
      data.clientCompany = dto.clientCompanyId
        ? { connect: { id: dto.clientCompanyId } }
        : { disconnect: true };
    }
    if (dto.primeContractorId !== undefined) {
      data.primeContractor = dto.primeContractorId
        ? { connect: { id: dto.primeContractorId } }
        : { disconnect: true };
    }
    if (dto.primaryWorkTypeId !== undefined) {
      data.primaryWorkType = dto.primaryWorkTypeId
        ? { connect: { id: dto.primaryWorkTypeId } }
        : { disconnect: true };
    }
    if (dto.structureId !== undefined) {
      data.structure = dto.structureId
        ? { connect: { id: dto.structureId } }
        : { disconnect: true };
    }
    if (dto.salesPersonId !== undefined) {
      data.salesPerson = dto.salesPersonId
        ? { connect: { id: dto.salesPersonId } }
        : { disconnect: true };
    }
    if (dto.siteManagerId !== undefined) {
      data.siteManager = dto.siteManagerId
        ? { connect: { id: dto.siteManagerId } }
        : { disconnect: true };
    }
    if (dto.foremanId !== undefined) {
      data.foreman = dto.foremanId
        ? { connect: { id: dto.foremanId } }
        : { disconnect: true };
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        company: true,
        clientCompany: true,
        primeContractor: true,
        primaryWorkType: true,
        structure: true,
        salesPerson: true,
        siteManager: true,
        foreman: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureProjectExists(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const project = await this.ensureProjectExists(id);

    if (!PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
      throw new BadRequestException(
        `Invalid status "${status}". Valid statuses: ${PROJECT_STATUSES.join(', ')}`,
      );
    }

    const allowedTransitions = STATUS_TRANSITIONS[project.status] || [];
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from "${project.status}" to "${status}". Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    const data: Prisma.ProjectUpdateInput = { status };

    // Set actual dates on status transitions
    if (status === 'active' && !project.actualStart) {
      data.actualStart = new Date();
    }
    if (status === 'completed' && !project.actualEnd) {
      data.actualEnd = new Date();
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        company: true,
        clientCompany: true,
        primeContractor: true,
      },
    });
  }

  // =========================================================================
  // Phases
  // =========================================================================

  async getPhases(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectPhase.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      include: {
        workType: true,
      },
    });
  }

  async addPhase(projectId: string, dto: CreatePhaseDto) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectPhase.create({
      data: {
        project: { connect: { id: projectId } },
        phaseName: dto.phaseName,
        workType: dto.workTypeId
          ? { connect: { id: dto.workTypeId } }
          : undefined,
        sortOrder: dto.sortOrder ?? 0,
        scheduledStart: dto.scheduledStart
          ? new Date(dto.scheduledStart)
          : undefined,
        scheduledEnd: dto.scheduledEnd
          ? new Date(dto.scheduledEnd)
          : undefined,
        notes: dto.notes,
      },
      include: {
        workType: true,
      },
    });
  }

  async updatePhase(projectId: string, phaseId: string, dto: UpdatePhaseDto) {
    await this.ensureProjectExists(projectId);
    await this.ensurePhaseExists(projectId, phaseId);

    const data: Prisma.ProjectPhaseUpdateInput = {};

    if (dto.phaseName !== undefined) data.phaseName = dto.phaseName;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.scheduledStart !== undefined)
      data.scheduledStart = dto.scheduledStart
        ? new Date(dto.scheduledStart)
        : null;
    if (dto.scheduledEnd !== undefined)
      data.scheduledEnd = dto.scheduledEnd
        ? new Date(dto.scheduledEnd)
        : null;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.workTypeId !== undefined) {
      data.workType = dto.workTypeId
        ? { connect: { id: dto.workTypeId } }
        : { disconnect: true };
    }

    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data,
      include: {
        workType: true,
      },
    });
  }

  // =========================================================================
  // Staffing
  // =========================================================================

  async getStaffing(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectStaffing.findMany({
      where: { projectId },
      orderBy: [{ targetDate: 'asc' }, { workTypeId: 'asc' }],
      include: {
        workType: true,
      },
    });
  }

  async updateStaffing(projectId: string, dto: UpdateStaffingDto) {
    await this.ensureProjectExists(projectId);

    const results = await Promise.all(
      dto.entries.map(async (entry) => {
        const targetDate = new Date(entry.targetDate);
        const workTypeId = entry.workTypeId ?? null;

        // Find existing entry using findFirst to safely handle nullable workTypeId
        const existing = await this.prisma.projectStaffing.findFirst({
          where: { projectId, workTypeId, targetDate },
        });

        if (existing) {
          return this.prisma.projectStaffing.update({
            where: { id: existing.id },
            data: {
              requiredCount: entry.requiredCount,
              notes: entry.notes,
            },
            include: { workType: true },
          });
        }

        return this.prisma.projectStaffing.create({
          data: {
            project: { connect: { id: projectId } },
            workType: entry.workTypeId
              ? { connect: { id: entry.workTypeId } }
              : undefined,
            targetDate,
            requiredCount: entry.requiredCount,
            notes: entry.notes,
          },
          include: { workType: true },
        });
      }),
    );

    return results;
  }

  async getStaffingSummary(
    projectId: string,
  ): Promise<StaffingSummaryResponseDto> {
    await this.ensureProjectExists(projectId);

    const staffingEntries = await this.prisma.projectStaffing.findMany({
      where: { projectId },
      include: { workType: true },
      orderBy: [{ targetDate: 'asc' }, { workTypeId: 'asc' }],
    });

    // Aggregate by work type
    const workTypeMap = new Map<
      string,
      { workTypeName: string | null; totalRequired: number; totalConfirmed: number }
    >();
    // Aggregate by date
    const dateMap = new Map<
      string,
      { totalRequired: number; totalConfirmed: number }
    >();

    let totalRequired = 0;
    let totalConfirmed = 0;

    for (const entry of staffingEntries) {
      const wtKey = entry.workTypeId ?? '__none__';
      const wtName = entry.workType?.workTypeName ?? null;
      const dateKey = entry.targetDate.toISOString().split('T')[0];

      // Work type aggregation
      if (!workTypeMap.has(wtKey)) {
        workTypeMap.set(wtKey, {
          workTypeName: wtName,
          totalRequired: 0,
          totalConfirmed: 0,
        });
      }
      const wt = workTypeMap.get(wtKey)!;
      wt.totalRequired += entry.requiredCount;
      wt.totalConfirmed += entry.confirmedCount;

      // Date aggregation
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { totalRequired: 0, totalConfirmed: 0 });
      }
      const dt = dateMap.get(dateKey)!;
      dt.totalRequired += entry.requiredCount;
      dt.totalConfirmed += entry.confirmedCount;

      totalRequired += entry.requiredCount;
      totalConfirmed += entry.confirmedCount;
    }

    const byWorkType = Array.from(workTypeMap.entries()).map(
      ([key, val]) => ({
        workTypeId: key === '__none__' ? null : key,
        workTypeName: val.workTypeName,
        totalRequired: val.totalRequired,
        totalConfirmed: val.totalConfirmed,
        shortage: val.totalRequired - val.totalConfirmed,
      }),
    );

    const byDate = Array.from(dateMap.entries()).map(([dateKey, val]) => ({
      targetDate: dateKey,
      totalRequired: val.totalRequired,
      totalConfirmed: val.totalConfirmed,
      shortage: val.totalRequired - val.totalConfirmed,
    }));

    return {
      projectId,
      byWorkType,
      byDate,
      totalRequired,
      totalConfirmed,
      totalShortage: totalRequired - totalConfirmed,
    };
  }

  // =========================================================================
  // Assignments
  // =========================================================================

  async getAssignments(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectAssignment.findMany({
      where: { projectId, isDeleted: false },
      orderBy: [{ targetDate: 'asc' }, { createdAt: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true,
            role: true,
            avatarUrl: true,
          },
        },
        workType: true,
      },
    });
  }

  async addAssignment(projectId: string, dto: CreateAssignmentDto) {
    await this.ensureProjectExists(projectId);

    const assignment = await this.prisma.projectAssignment.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: dto.userId } },
        targetDate: new Date(dto.targetDate),
        workType: dto.workTypeId
          ? { connect: { id: dto.workTypeId } }
          : undefined,
        contractType: dto.contractType,
        dailyRate: dto.dailyRate,
        hourlyRate: dto.hourlyRate,
        source: dto.source ?? 'direct',
        demandPosting: dto.demandPostingId
          ? { connect: { id: dto.demandPostingId } }
          : undefined,
        supplyPosting: dto.supplyPostingId
          ? { connect: { id: dto.supplyPostingId } }
          : undefined,
        contract: dto.contractId
          ? { connect: { id: dto.contractId } }
          : undefined,
        status: 'confirmed',
      },
      include: {
        user: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true,
            role: true,
          },
        },
        workType: true,
      },
    });

    // Recalculate staffing confirmed count
    await this.recalculateStaffingConfirmedCount(
      projectId,
      dto.workTypeId ?? null,
      new Date(dto.targetDate),
    );

    return assignment;
  }

  async updateAssignment(
    projectId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    await this.ensureProjectExists(projectId);
    const existing = await this.ensureAssignmentExists(projectId, assignmentId);

    const data: Prisma.ProjectAssignmentUpdateInput = {};

    if (dto.userId !== undefined) {
      data.user = { connect: { id: dto.userId } };
    }
    if (dto.targetDate !== undefined) {
      data.targetDate = new Date(dto.targetDate);
    }
    if (dto.workTypeId !== undefined) {
      data.workType = dto.workTypeId
        ? { connect: { id: dto.workTypeId } }
        : { disconnect: true };
    }
    if (dto.contractType !== undefined) data.contractType = dto.contractType;
    if (dto.dailyRate !== undefined) data.dailyRate = dto.dailyRate;
    if (dto.hourlyRate !== undefined) data.hourlyRate = dto.hourlyRate;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.demandPostingId !== undefined) {
      data.demandPosting = dto.demandPostingId
        ? { connect: { id: dto.demandPostingId } }
        : { disconnect: true };
    }
    if (dto.supplyPostingId !== undefined) {
      data.supplyPosting = dto.supplyPostingId
        ? { connect: { id: dto.supplyPostingId } }
        : { disconnect: true };
    }
    if (dto.contractId !== undefined) {
      data.contract = dto.contractId
        ? { connect: { id: dto.contractId } }
        : { disconnect: true };
    }

    const updated = await this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data,
      include: {
        user: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true,
            role: true,
          },
        },
        workType: true,
      },
    });

    // Recalculate for old and new work type / date if changed
    await this.recalculateStaffingConfirmedCount(
      projectId,
      existing.workTypeId,
      existing.targetDate,
    );

    if (
      dto.workTypeId !== undefined &&
      dto.workTypeId !== existing.workTypeId
    ) {
      await this.recalculateStaffingConfirmedCount(
        projectId,
        dto.workTypeId ?? null,
        dto.targetDate ? new Date(dto.targetDate) : existing.targetDate,
      );
    } else if (dto.targetDate !== undefined) {
      await this.recalculateStaffingConfirmedCount(
        projectId,
        existing.workTypeId,
        new Date(dto.targetDate),
      );
    }

    return updated;
  }

  async removeAssignment(projectId: string, assignmentId: string) {
    await this.ensureProjectExists(projectId);
    const existing = await this.ensureAssignmentExists(projectId, assignmentId);

    const deleted = await this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Recalculate staffing after removal
    await this.recalculateStaffingConfirmedCount(
      projectId,
      existing.workTypeId,
      existing.targetDate,
    );

    return deleted;
  }

  // =========================================================================
  // Documents
  // =========================================================================

  async addDocument(
    projectId: string,
    dto: UploadDocumentDto,
    uploadedBy: string,
  ) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectDocument.create({
      data: {
        project: { connect: { id: projectId } },
        docType: dto.docType,
        docName: dto.docName,
        fileUrl: dto.fileUrl,
        fileSizeBytes: dto.fileSizeBytes,
        uploader: { connect: { id: uploadedBy } },
      },
      include: {
        uploader: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
          },
        },
      },
    });
  }

  async getDocuments(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectDocument.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
          },
        },
      },
    });
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private async ensureProjectExists(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, isDeleted: false },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  private async ensurePhaseExists(projectId: string, phaseId: string) {
    const phase = await this.prisma.projectPhase.findFirst({
      where: { id: phaseId, projectId },
    });
    if (!phase) {
      throw new NotFoundException(
        `Phase with ID "${phaseId}" not found in project "${projectId}"`,
      );
    }
    return phase;
  }

  private async ensureAssignmentExists(
    projectId: string,
    assignmentId: string,
  ) {
    const assignment = await this.prisma.projectAssignment.findFirst({
      where: { id: assignmentId, projectId, isDeleted: false },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID "${assignmentId}" not found in project "${projectId}"`,
      );
    }
    return assignment;
  }

  /**
   * Recalculate ProjectStaffing.confirmedCount based on actual
   * non-deleted assignments for the given project + workType + date.
   */
  private async recalculateStaffingConfirmedCount(
    projectId: string,
    workTypeId: string | null,
    targetDate: Date,
  ) {
    const confirmedCount = await this.prisma.projectAssignment.count({
      where: {
        projectId,
        workTypeId,
        targetDate,
        isDeleted: false,
        status: 'confirmed',
      },
    });

    // Only update if the staffing entry exists
    // Use findFirst to handle nullable workTypeId safely
    const staffing = await this.prisma.projectStaffing.findFirst({
      where: {
        projectId,
        workTypeId,
        targetDate,
      },
    });

    if (staffing) {
      await this.prisma.projectStaffing.update({
        where: { id: staffing.id },
        data: { confirmedCount },
      });
    }
  }
}
