import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomFieldsService } from './custom-fields.service';
import { CreateFieldDefDto } from './dto/create-field-def.dto';
import { UpdateFieldDefDto } from './dto/update-field-def.dto';
import { SaveFieldValsDto } from './dto/save-field-vals.dto';
import { UpdateSortOrderDto } from './dto/update-sort-order.dto';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@Controller('api/v1/custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  // ─── Definition endpoints ───────────────────────────────────────────

  @Get('defs')
  @ApiOperation({ summary: 'カスタムフィールド定義一覧' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'targetType', required: false })
  findDefs(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.customFieldsService.findDefs(companyId, targetType);
  }

  @Post('defs')
  @ApiOperation({ summary: 'カスタムフィールド定義作成' })
  @ApiQuery({ name: 'companyId', required: true })
  createDef(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateFieldDefDto,
  ) {
    return this.customFieldsService.createDef(companyId, dto);
  }

  @Patch('defs/:id')
  @ApiOperation({ summary: 'カスタムフィールド定義更新' })
  updateDef(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldDefDto,
  ) {
    return this.customFieldsService.updateDef(id, dto);
  }

  @Delete('defs/:id')
  @ApiOperation({ summary: 'カスタムフィールド定義削除（論理削除）' })
  removeDef(@Param('id', ParseUUIDPipe) id: string) {
    return this.customFieldsService.removeDef(id);
  }

  @Put('defs/sort')
  @ApiOperation({ summary: 'カスタムフィールド定義の表示順一括更新' })
  updateSortOrder(@Body() dto: UpdateSortOrderDto) {
    return this.customFieldsService.updateSortOrder(dto.items);
  }

  // ─── Value endpoints ────────────────────────────────────────────────

  @Get('vals/:targetType/:targetId')
  @ApiOperation({ summary: 'カスタムフィールド値取得' })
  getVals(
    @Param('targetType') targetType: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return this.customFieldsService.getVals(targetType, targetId);
  }

  @Put('vals/:targetType/:targetId')
  @ApiOperation({ summary: 'カスタムフィールド値保存（upsert）' })
  @ApiQuery({ name: 'companyId', required: true })
  saveVals(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Param('targetType') targetType: string,
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @Body() dto: SaveFieldValsDto,
  ) {
    return this.customFieldsService.saveVals(
      companyId,
      targetType,
      targetId,
      dto.values,
    );
  }
}
