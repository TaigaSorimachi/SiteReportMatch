import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { PaginatedResponse } from '../common/dto/pagination.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { WorkerSkillEntry } from './dto/update-skills.dto.js';
import { CreateLicenseDto, UpdateLicenseDto } from './dto/create-license.dto.js';
import { CreateEvaluationDto } from './dto/create-evaluation.dto.js';
import { CalendarEntry } from './dto/update-calendar.dto.js';
import { SearchWorkersDto } from './dto/search-workers.dto.js';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Profile ──────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        lastNameKana: true,
        firstNameKana: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        avatarUrl: true,
        postalCode: true,
        address: true,
        addressLat: true,
        addressLng: true,
        role: true,
        isIndividual: true,
        defaultDailyRate: true,
        defaultHourlyRate: true,
        employmentStatus: true,
        availability: true,
        ccusWorkerId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
        workerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`ユーザー (ID: ${userId}) が見つかりません`);
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`ユーザー (ID: ${userId}) が見つかりません`);
    }

    const profile = await this.prisma.workerProfile.upsert({
      where: { userId },
      create: {
        userId,
        experienceYears: dto.experienceYears,
        skillLevel: dto.skillLevel,
        specialties: dto.specialties,
        careerSummary: dto.careerSummary,
        preferredArea: dto.preferredArea,
        maxCommuteKm: dto.maxCommuteKm,
        hasVehicle: dto.hasVehicle,
        hasOwnTools: dto.hasOwnTools,
        canDriveTruck: dto.canDriveTruck,
        availableHours: dto.availableHours,
        desiredDailyMin: dto.desiredDailyMin,
        desiredDailyMax: dto.desiredDailyMax,
        desiredMonthly: dto.desiredMonthly,
      },
      update: {
        ...(dto.experienceYears !== undefined && {
          experienceYears: dto.experienceYears,
        }),
        ...(dto.skillLevel !== undefined && { skillLevel: dto.skillLevel }),
        ...(dto.specialties !== undefined && { specialties: dto.specialties }),
        ...(dto.careerSummary !== undefined && {
          careerSummary: dto.careerSummary,
        }),
        ...(dto.preferredArea !== undefined && {
          preferredArea: dto.preferredArea,
        }),
        ...(dto.maxCommuteKm !== undefined && {
          maxCommuteKm: dto.maxCommuteKm,
        }),
        ...(dto.hasVehicle !== undefined && { hasVehicle: dto.hasVehicle }),
        ...(dto.hasOwnTools !== undefined && { hasOwnTools: dto.hasOwnTools }),
        ...(dto.canDriveTruck !== undefined && {
          canDriveTruck: dto.canDriveTruck,
        }),
        ...(dto.availableHours !== undefined && {
          availableHours: dto.availableHours,
        }),
        ...(dto.desiredDailyMin !== undefined && {
          desiredDailyMin: dto.desiredDailyMin,
        }),
        ...(dto.desiredDailyMax !== undefined && {
          desiredDailyMax: dto.desiredDailyMax,
        }),
        ...(dto.desiredMonthly !== undefined && {
          desiredMonthly: dto.desiredMonthly,
        }),
      },
    });

    return profile;
  }

  // ── Skills ───────────────────────────────────────────────

  async getSkills(userId: string) {
    await this.ensureUserExists(userId);

    const skills = await this.prisma.workerSkill.findMany({
      where: { userId },
      include: {
        workType: {
          select: {
            id: true,
            workTypeName: true,
            category: true,
            level: true,
            parent: {
              select: {
                id: true,
                workTypeName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return skills;
  }

  async updateSkills(userId: string, skills: WorkerSkillEntry[]) {
    await this.ensureUserExists(userId);

    // Validate all workTypeIds exist
    if (skills.length > 0) {
      const workTypeIds = skills.map((s) => s.workTypeId);
      const existingWorkTypes = await this.prisma.workTypeMaster.findMany({
        where: { id: { in: workTypeIds }, isActive: true },
        select: { id: true },
      });
      const existingIds = new Set(existingWorkTypes.map((wt) => wt.id));
      const missingIds = workTypeIds.filter((id) => !existingIds.has(id));
      if (missingIds.length > 0) {
        throw new BadRequestException(
          `無効な工種ID: ${missingIds.join(', ')}`,
        );
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Delete all existing skills
      await tx.workerSkill.deleteMany({ where: { userId } });

      // Create new skills
      if (skills.length > 0) {
        await tx.workerSkill.createMany({
          data: skills.map((s) => ({
            userId,
            workTypeId: s.workTypeId,
            proficiency: s.proficiency ?? 'capable',
            yearsExperience: s.yearsExperience,
          })),
        });
      }

      // Return updated skills with work type info
      return tx.workerSkill.findMany({
        where: { userId },
        include: {
          workType: {
            select: {
              id: true,
              workTypeName: true,
              category: true,
              level: true,
              parent: {
                select: {
                  id: true,
                  workTypeName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });

    return result;
  }

  // ── Licenses ─────────────────────────────────────────────

  async getLicenses(userId: string) {
    await this.ensureUserExists(userId);

    const licenses = await this.prisma.userLicense.findMany({
      where: { userId, isDeleted: false },
      include: {
        license: {
          select: {
            id: true,
            licenseName: true,
            licenseCategory: true,
            hasExpiry: true,
            renewalMonths: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return licenses;
  }

  async addLicense(userId: string, dto: CreateLicenseDto) {
    await this.ensureUserExists(userId);

    // Validate license master exists
    const licenseMaster = await this.prisma.licenseMaster.findUnique({
      where: { id: dto.licenseId, isActive: true },
    });
    if (!licenseMaster) {
      throw new BadRequestException(
        `資格マスタ (ID: ${dto.licenseId}) が見つかりません`,
      );
    }

    // Check if user already has this license (including soft-deleted)
    const existing = await this.prisma.userLicense.findUnique({
      where: {
        userId_licenseId: { userId, licenseId: dto.licenseId },
      },
    });

    if (existing && !existing.isDeleted) {
      throw new BadRequestException('この資格は既に登録されています');
    }

    // If soft-deleted, restore and update; otherwise create new
    if (existing && existing.isDeleted) {
      const restored = await this.prisma.userLicense.update({
        where: { id: existing.id },
        data: {
          licenseNumber: dto.licenseNumber,
          issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          issuingAuthority: dto.issuingAuthority,
          documentUrl: dto.documentUrl,
          isVerified: false,
          isDeleted: false,
          deletedAt: null,
        },
        include: {
          license: {
            select: {
              id: true,
              licenseName: true,
              licenseCategory: true,
              hasExpiry: true,
            },
          },
        },
      });
      return restored;
    }

    const license = await this.prisma.userLicense.create({
      data: {
        userId,
        licenseId: dto.licenseId,
        licenseNumber: dto.licenseNumber,
        issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        issuingAuthority: dto.issuingAuthority,
        documentUrl: dto.documentUrl,
      },
      include: {
        license: {
          select: {
            id: true,
            licenseName: true,
            licenseCategory: true,
            hasExpiry: true,
          },
        },
      },
    });

    return license;
  }

  async updateLicense(
    userId: string,
    userLicenseId: string,
    dto: UpdateLicenseDto,
  ) {
    const existing = await this.prisma.userLicense.findFirst({
      where: { id: userLicenseId, userId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(
        `資格 (ID: ${userLicenseId}) が見つかりません`,
      );
    }

    const updated = await this.prisma.userLicense.update({
      where: { id: userLicenseId },
      data: {
        ...(dto.licenseNumber !== undefined && {
          licenseNumber: dto.licenseNumber,
        }),
        ...(dto.issuedDate !== undefined && {
          issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
        }),
        ...(dto.expiryDate !== undefined && {
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        }),
        ...(dto.issuingAuthority !== undefined && {
          issuingAuthority: dto.issuingAuthority,
        }),
        ...(dto.documentUrl !== undefined && {
          documentUrl: dto.documentUrl,
        }),
      },
      include: {
        license: {
          select: {
            id: true,
            licenseName: true,
            licenseCategory: true,
            hasExpiry: true,
          },
        },
      },
    });

    return updated;
  }

  async removeLicense(userId: string, userLicenseId: string) {
    const existing = await this.prisma.userLicense.findFirst({
      where: { id: userLicenseId, userId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(
        `資格 (ID: ${userLicenseId}) が見つかりません`,
      );
    }

    await this.prisma.userLicense.update({
      where: { id: userLicenseId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: '資格を削除しました' };
  }

  // ── Evaluations ──────────────────────────────────────────

  async getEvaluations(userId: string) {
    await this.ensureUserExists(userId);

    const evaluations = await this.prisma.workerEvaluation.findMany({
      where: { workerId: userId },
      include: {
        evaluator: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            avatarUrl: true,
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  async addEvaluation(evaluatorId: string, dto: CreateEvaluationDto) {
    // Validate worker exists
    await this.ensureUserExists(dto.workerId);

    // Validate evaluator exists
    const evaluator = await this.prisma.user.findUnique({
      where: { id: evaluatorId, isDeleted: false },
      select: { id: true },
    });
    if (!evaluator) {
      throw new NotFoundException(
        `評価者 (ID: ${evaluatorId}) が見つかりません`,
      );
    }

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId, isDeleted: false },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException(
        `案件 (ID: ${dto.projectId}) が見つかりません`,
      );
    }

    // Cannot evaluate yourself
    if (evaluatorId === dto.workerId) {
      throw new BadRequestException('自分自身を評価することはできません');
    }

    // Calculate overall rating as average of all 5 ratings
    const ratingOverall =
      (dto.ratingSkill +
        dto.ratingSpeed +
        dto.ratingAttitude +
        dto.ratingSafety +
        dto.ratingCommunication) /
      5;

    const evaluation = await this.prisma.workerEvaluation.create({
      data: {
        workerId: dto.workerId,
        evaluatorId,
        projectId: dto.projectId,
        evaluationDate: new Date(),
        ratingSkill: dto.ratingSkill,
        ratingSpeed: dto.ratingSpeed,
        ratingAttitude: dto.ratingAttitude,
        ratingSafety: dto.ratingSafety,
        ratingCommunication: dto.ratingCommunication,
        ratingOverall: Math.round(ratingOverall * 10) / 10,
        comment: dto.comment,
        isPublic: dto.isPublic ?? false,
      },
      include: {
        evaluator: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });

    // Update worker profile avg_rating
    const avgResult = await this.prisma.workerEvaluation.aggregate({
      where: { workerId: dto.workerId },
      _avg: { ratingOverall: true },
    });

    if (avgResult._avg.ratingOverall !== null) {
      await this.prisma.workerProfile.updateMany({
        where: { userId: dto.workerId },
        data: {
          avgRating:
            Math.round(Number(avgResult._avg.ratingOverall) * 10) / 10,
        },
      });
    }

    return evaluation;
  }

  // ── Calendar ─────────────────────────────────────────────

  async getCalendar(userId: string, startDate: string, endDate: string) {
    await this.ensureUserExists(userId);

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate と endDate は必須です');
    }

    const entries = await this.prisma.workerAvailability.findMany({
      where: {
        userId,
        targetDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
      },
      orderBy: { targetDate: 'asc' },
    });

    return entries;
  }

  async updateCalendar(userId: string, entries: CalendarEntry[]) {
    await this.ensureUserExists(userId);

    if (entries.length === 0) {
      return [];
    }

    // Validate project IDs if provided
    const projectIds = entries
      .filter((e) => e.projectId)
      .map((e) => e.projectId!);
    if (projectIds.length > 0) {
      const uniqueProjectIds = [...new Set(projectIds)];
      const existingProjects = await this.prisma.project.findMany({
        where: { id: { in: uniqueProjectIds }, isDeleted: false },
        select: { id: true },
      });
      const existingIds = new Set(existingProjects.map((p) => p.id));
      const missing = uniqueProjectIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(
          `無効な案件ID: ${missing.join(', ')}`,
        );
      }
    }

    const result = await this.prisma.$transaction(
      entries.map((entry) =>
        this.prisma.workerAvailability.upsert({
          where: {
            userId_targetDate: {
              userId,
              targetDate: new Date(entry.targetDate),
            },
          },
          create: {
            userId,
            targetDate: new Date(entry.targetDate),
            status: entry.status,
            projectId: entry.projectId ?? null,
            notes: entry.notes ?? null,
          },
          update: {
            status: entry.status,
            projectId: entry.projectId ?? null,
            notes: entry.notes ?? null,
          },
        }),
      ),
    );

    return result;
  }

  // ── Search Available Workers ─────────────────────────────

  async findAvailable(query: SearchWorkersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const userWhere: Record<string, unknown> = {
      isDeleted: false,
      isActive: true,
      role: 'worker',
    };

    // Filter by skill level via worker profile
    const profileWhere: Record<string, unknown> = {};
    if (query.skillLevel) {
      profileWhere.skillLevel = query.skillLevel;
    }
    if (query.hasVehicle === 'true') {
      profileWhere.hasVehicle = true;
    }
    if (query.hasOwnTools === 'true') {
      profileWhere.hasOwnTools = true;
    }

    if (Object.keys(profileWhere).length > 0) {
      userWhere.workerProfile = profileWhere;
    }

    // Filter by work type via worker skills
    if (query.workTypeId) {
      userWhere.workerSkills = {
        some: { workTypeId: query.workTypeId },
      };
    }

    // Filter by prefecture via address
    if (query.prefecture) {
      userWhere.address = { contains: query.prefecture };
    }

    // Filter by availability on a specific date
    if (query.availableDate) {
      userWhere.workerAvailability = {
        some: {
          targetDate: new Date(query.availableDate),
          status: 'available',
        },
      };
    }

    const [total, workers] = await Promise.all([
      this.prisma.user.count({ where: userWhere }),
      this.prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          lastName: true,
          firstName: true,
          lastNameKana: true,
          firstNameKana: true,
          avatarUrl: true,
          address: true,
          defaultDailyRate: true,
          availability: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
          workerProfile: {
            select: {
              experienceYears: true,
              skillLevel: true,
              specialties: true,
              maxCommuteKm: true,
              hasVehicle: true,
              hasOwnTools: true,
              desiredDailyMin: true,
              desiredDailyMax: true,
              avgRating: true,
              totalProjects: true,
              attendanceRate: true,
            },
          },
          workerSkills: {
            select: {
              proficiency: true,
              yearsExperience: true,
              workType: {
                select: {
                  id: true,
                  workTypeName: true,
                  category: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return PaginatedResponse.create(workers, total, page, limit);
  }

  // ── Helpers ──────────────────────────────────────────────

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`ユーザー (ID: ${userId}) が見つかりません`);
    }
  }
}
