import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SearchProjectDto } from './dto/search-project.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { UpdateStaffingDto } from './dto/update-staffing.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // =========================================================================
  // Projects CRUD
  // =========================================================================

  @Post()
  @ApiOperation({ summary: '案件を作成' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '案件一覧を取得（ページネーション・フィルタ対応）' })
  findAll(@Query() query: SearchProjectDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '案件詳細を取得' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '案件を更新' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '案件を論理削除' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectsService.remove(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '案件ステータスを変更' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['planning', 'active', 'suspended', 'completed', 'cancelled'],
        },
      },
      required: ['status'],
    },
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.projectsService.updateStatus(id, status);
  }

  // =========================================================================
  // Phases
  // =========================================================================

  @Get(':id/phases')
  @ApiOperation({ summary: '工程一覧を取得' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  getPhases(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getPhases(id);
  }

  @Post(':id/phases')
  @ApiOperation({ summary: '工程を追加' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  addPhase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePhaseDto,
  ) {
    return this.projectsService.addPhase(id, dto);
  }

  @Patch(':id/phases/:phaseId')
  @ApiOperation({ summary: '工程を更新' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  @ApiParam({ name: 'phaseId', description: '工程ID', type: String })
  updatePhase(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
    @Body() dto: UpdatePhaseDto,
  ) {
    return this.projectsService.updatePhase(id, phaseId, dto);
  }

  // =========================================================================
  // Staffing
  // =========================================================================

  @Get(':id/staffing')
  @ApiOperation({ summary: '人員計画を取得' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  getStaffing(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getStaffing(id);
  }

  @Put(':id/staffing')
  @ApiOperation({ summary: '人員計画を一括更新 (upsert)' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  updateStaffing(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffingDto,
  ) {
    return this.projectsService.updateStaffing(id, dto);
  }

  @Get(':id/staffing/summary')
  @ApiOperation({ summary: '人員計画サマリを取得 (工種別・日付別)' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  getStaffingSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getStaffingSummary(id);
  }

  // =========================================================================
  // Assignments
  // =========================================================================

  @Get(':id/assignments')
  @ApiOperation({ summary: '配置一覧を取得' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  getAssignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getAssignments(id);
  }

  @Post(':id/assignments')
  @ApiOperation({ summary: '配置を追加（人員計画のconfirmedCountも更新）' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  addAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.projectsService.addAssignment(id, dto);
  }

  @Patch(':id/assignments/:assignmentId')
  @ApiOperation({ summary: '配置を更新' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  @ApiParam({ name: 'assignmentId', description: '配置ID', type: String })
  updateAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.projectsService.updateAssignment(id, assignmentId, dto);
  }

  @Delete(':id/assignments/:assignmentId')
  @ApiOperation({ summary: '配置を論理削除（人員計画のconfirmedCountも更新）' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  @ApiParam({ name: 'assignmentId', description: '配置ID', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    await this.projectsService.removeAssignment(id, assignmentId);
  }

  // =========================================================================
  // Documents
  // =========================================================================

  @Post(':id/documents')
  @ApiOperation({ summary: '案件書類を追加' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  addDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addDocument(id, dto, userId);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: '案件書類一覧を取得' })
  @ApiParam({ name: 'id', description: '案件ID', type: String })
  getDocuments(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getDocuments(id);
  }
}
