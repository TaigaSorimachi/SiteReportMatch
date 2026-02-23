import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFieldDefDto } from './dto/create-field-def.dto';
import { UpdateFieldDefDto } from './dto/update-field-def.dto';
import { SortOrderItemDto } from './dto/update-sort-order.dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Field Definitions ──────────────────────────────────────────────

  async findDefs(companyId: string, targetType?: string) {
    const where: any = {
      companyId,
      isActive: true,
    };

    if (targetType) {
      where.targetType = targetType;
    }

    return this.prisma.customFieldDef.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createDef(companyId: string, dto: CreateFieldDefDto) {
    // Check uniqueness of fieldKey within company + targetType
    const existing = await this.prisma.customFieldDef.findUnique({
      where: {
        companyId_targetType_fieldKey: {
          companyId,
          targetType: dto.targetType,
          fieldKey: dto.fieldKey,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Field key "${dto.fieldKey}" already exists for targetType "${dto.targetType}" in this company`,
      );
    }

    return this.prisma.customFieldDef.create({
      data: {
        companyId,
        targetType: dto.targetType,
        fieldLabel: dto.fieldLabel,
        fieldKey: dto.fieldKey,
        inputType: dto.inputType,
        options: (dto.options as any) ?? undefined,
        isRequired: dto.isRequired ?? false,
        sortOrder: dto.sortOrder ?? 0,
        placeholder: dto.placeholder,
        helpText: dto.helpText,
      },
    });
  }

  async updateDef(id: string, dto: UpdateFieldDefDto) {
    const existing = await this.prisma.customFieldDef.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new NotFoundException(`CustomFieldDef with id ${id} not found`);
    }

    const data: any = {};
    if (dto.fieldLabel !== undefined) data.fieldLabel = dto.fieldLabel;
    if (dto.inputType !== undefined) data.inputType = dto.inputType;
    if (dto.options !== undefined) data.options = dto.options;
    if (dto.isRequired !== undefined) data.isRequired = dto.isRequired;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.placeholder !== undefined) data.placeholder = dto.placeholder;
    if (dto.helpText !== undefined) data.helpText = dto.helpText;
    // Note: targetType and fieldKey changes are generally not allowed after creation
    // to prevent orphaning existing values. If the DTO contains them, we allow update.
    if (dto.targetType !== undefined) data.targetType = dto.targetType;
    if (dto.fieldKey !== undefined) data.fieldKey = dto.fieldKey;

    return this.prisma.customFieldDef.update({
      where: { id },
      data,
    });
  }

  async removeDef(id: string) {
    const existing = await this.prisma.customFieldDef.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new NotFoundException(`CustomFieldDef with id ${id} not found`);
    }

    return this.prisma.customFieldDef.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateSortOrder(items: SortOrderItemDto[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.customFieldDef.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { updated: items.length };
  }

  // ─── Field Values ───────────────────────────────────────────────────

  async getVals(targetType: string, targetId: string) {
    const vals = await this.prisma.customFieldVal.findMany({
      where: {
        targetType,
        targetId,
      },
      include: {
        fieldDef: {
          select: {
            id: true,
            fieldLabel: true,
            fieldKey: true,
            inputType: true,
            options: true,
            isRequired: true,
            sortOrder: true,
            placeholder: true,
            helpText: true,
          },
        },
      },
      orderBy: {
        fieldDef: { sortOrder: 'asc' },
      },
    });

    return vals;
  }

  async saveVals(
    companyId: string,
    targetType: string,
    targetId: string,
    values: Record<string, any>,
  ) {
    // Get all field definitions for this company + targetType
    const defs = await this.prisma.customFieldDef.findMany({
      where: {
        companyId,
        targetType,
        isActive: true,
      },
    });

    const defByKey = new Map(defs.map((d) => [d.fieldKey, d]));

    // Validate required fields
    const missingRequired: string[] = [];
    for (const def of defs) {
      if (def.isRequired && (values[def.fieldKey] === undefined || values[def.fieldKey] === null || values[def.fieldKey] === '')) {
        missingRequired.push(def.fieldLabel);
      }
    }

    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Required custom fields are missing: ${missingRequired.join(', ')}`,
      );
    }

    // Upsert values for each key
    const results: any[] = [];
    for (const [key, value] of Object.entries(values)) {
      const def = defByKey.get(key);
      if (!def) {
        // Skip unknown keys silently
        continue;
      }

      const fieldValue = value !== null && value !== undefined ? String(value) : null;

      const upserted = await this.prisma.customFieldVal.upsert({
        where: {
          fieldDefId_targetId: {
            fieldDefId: def.id,
            targetId,
          },
        },
        create: {
          fieldDefId: def.id,
          targetType,
          targetId,
          fieldValue,
        },
        update: {
          fieldValue,
        },
      });

      results.push(upserted);
    }

    return results;
  }
}
