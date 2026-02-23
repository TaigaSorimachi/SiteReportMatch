import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { RecordLocationDto } from './dto/record-location.dto';
import { GeofenceCheckDto } from './dto/geofence-check.dto';
import { SearchLocationDto } from './dto/search-location.dto';

@Injectable()
export class GeolocationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 位置情報を記録する
   */
  async recordLocation(userId: string, dto: RecordLocationDto) {
    const locationLog = await this.prisma.locationLog.create({
      data: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracyM: dto.accuracyM,
        eventType: dto.eventType,
        projectId: dto.projectId,
        reportId: dto.reportId,
        recordedAt: new Date(),
      },
    });

    return locationLog;
  }

  /**
   * ジオフェンスチェック
   * 指定座標がプロジェクト現場のジオフェンス内かどうか判定する
   */
  async checkGeofence(userId: string, dto: GeofenceCheckDto) {
    let projects: Array<{
      id: string;
      projectName: string;
      siteLat: any;
      siteLng: any;
      geofenceRadiusM: number;
    }> = [];

    if (dto.projectId) {
      // 特定プロジェクトに対してチェック
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: {
          id: true,
          projectName: true,
          siteLat: true,
          siteLng: true,
          geofenceRadiusM: true,
        },
      });

      if (!project) {
        throw new NotFoundException('プロジェクトが見つかりません');
      }
      if (!project.siteLat || !project.siteLng) {
        throw new BadRequestException(
          'プロジェクトに現場座標が設定されていません',
        );
      }

      projects = [project];
    } else {
      // 当日配置されているプロジェクトを検索
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      );

      const assignments = await this.prisma.projectAssignment.findMany({
        where: {
          userId,
          targetDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: 'confirmed',
          isDeleted: false,
        },
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              siteLat: true,
              siteLng: true,
              geofenceRadiusM: true,
            },
          },
        },
      });

      projects = assignments
        .map((a) => a.project)
        .filter((p) => p.siteLat && p.siteLng);

      if (projects.length === 0) {
        return {
          isInsideGeofence: false,
          distanceMeters: null,
          projectId: null,
          projectName: null,
          event: null,
          message: '当日配置されたプロジェクトが見つかりません',
        };
      }
    }

    // 各プロジェクトに対して距離を計算し、最も近いものを選択
    let closestProject: (typeof projects)[0] | null = null;
    let closestDistance = Infinity;

    for (const project of projects) {
      const distance = this.haversineDistance(
        dto.lat,
        dto.lng,
        Number(project.siteLat),
        Number(project.siteLng),
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestProject = project;
      }
    }

    if (!closestProject) {
      return {
        isInsideGeofence: false,
        distanceMeters: null,
        projectId: null,
        projectName: null,
        event: null,
      };
    }

    const isInside = closestDistance <= closestProject.geofenceRadiusM;
    const distanceMeters = Math.round(closestDistance * 10) / 10;

    // 最後のジオフェンスイベントを取得して状態変化を検出
    const lastEvent = await this.prisma.geofenceEvent.findFirst({
      where: {
        userId,
        projectId: closestProject.id,
      },
      orderBy: { eventAt: 'desc' },
    });

    const lastWasInside = lastEvent?.eventType === 'enter';
    let event: any = null;

    // 状態が変化した場合にイベントを作成
    if (isInside && !lastWasInside) {
      // ジオフェンスに入った
      event = await this.prisma.geofenceEvent.create({
        data: {
          userId,
          projectId: closestProject.id,
          eventType: 'enter',
          eventAt: new Date(),
          latitude: dto.lat,
          longitude: dto.lng,
          accuracyM: dto.accuracy,
          distanceM: distanceMeters,
        },
      });
    } else if (!isInside && lastWasInside) {
      // ジオフェンスから出た
      event = await this.prisma.geofenceEvent.create({
        data: {
          userId,
          projectId: closestProject.id,
          eventType: 'exit',
          eventAt: new Date(),
          latitude: dto.lat,
          longitude: dto.lng,
          accuracyM: dto.accuracy,
          distanceM: distanceMeters,
        },
      });
    }

    // 位置ログも記録
    await this.prisma.locationLog.create({
      data: {
        userId,
        latitude: dto.lat,
        longitude: dto.lng,
        accuracyM: dto.accuracy,
        eventType: 'geofence_check',
        projectId: closestProject.id,
        recordedAt: new Date(),
      },
    });

    return {
      isInsideGeofence: isInside,
      distanceMeters,
      projectId: closestProject.id,
      projectName: closestProject.projectName,
      event,
    };
  }

  /**
   * 位置情報ログ一覧取得
   */
  async getLocationLogs(query: SearchLocationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.dateFrom || query.dateTo) {
      where.recordedAt = {};
      if (query.dateFrom) {
        where.recordedAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        // 終了日の翌日0時まで
        const endDate = new Date(query.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.recordedAt.lt = endDate;
      }
    }

    let orderBy: any = { recordedAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.locationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, lastName: true, firstName: true },
          },
          project: {
            select: { id: true, projectName: true },
          },
        },
      }),
      this.prisma.locationLog.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /**
   * ジオフェンスイベント一覧取得
   */
  async getGeofenceEvents(query: SearchLocationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.dateFrom || query.dateTo) {
      where.eventAt = {};
      if (query.dateFrom) {
        where.eventAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const endDate = new Date(query.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.eventAt.lt = endDate;
      }
    }

    let orderBy: any = { eventAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.geofenceEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, lastName: true, firstName: true },
          },
          project: {
            select: { id: true, projectName: true },
          },
        },
      }),
      this.prisma.geofenceEvent.count({ where }),
    ]);

    return PaginatedResponse.create(data, total, page, limit);
  }

  /**
   * Haversine距離計算 (メートル単位)
   * 2点の緯度・経度から地表面上の距離を求める
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000; // 地球の半径 (メートル)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * 度をラジアンに変換
   */
  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
