import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Delete,
  Param,
  Body,
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
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { WorkersService } from './workers.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdateSkillsDto } from './dto/update-skills.dto.js';
import { CreateLicenseDto, UpdateLicenseDto } from './dto/create-license.dto.js';
import { CreateEvaluationDto } from './dto/create-evaluation.dto.js';
import { UpdateCalendarDto } from './dto/update-calendar.dto.js';
import { SearchWorkersDto } from './dto/search-workers.dto.js';

@ApiTags('workers')
@ApiBearerAuth()
@Controller('api/v1/workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  // ── Available Workers Search ──────────────────────────────

  @Get('available')
  @ApiOperation({ summary: '稼働可能な職人を検索' })
  @ApiResponse({ status: 200, description: '検索結果を返却' })
  findAvailable(@Query() query: SearchWorkersDto) {
    return this.workersService.findAvailable(query);
  }

  // ── Profile ───────────────────────────────────────────────

  @Get(':id/profile')
  @ApiOperation({ summary: '職人プロフィール取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: 'プロフィールを返却' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.getProfile(id);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: '職人プロフィール更新' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新後プロフィールを返却' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.workersService.updateProfile(id, dto);
  }

  // ── Skills ────────────────────────────────────────────────

  @Get(':id/skills')
  @ApiOperation({ summary: '対応可能工種一覧取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: 'スキル一覧を返却' })
  getSkills(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.getSkills(id);
  }

  @Put(':id/skills')
  @ApiOperation({ summary: '対応可能工種を一括更新（全置換）' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新後スキル一覧を返却' })
  updateSkills(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillsDto,
  ) {
    return this.workersService.updateSkills(id, dto.skills);
  }

  // ── Licenses ──────────────────────────────────────────────

  @Get(':id/licenses')
  @ApiOperation({ summary: '保有資格一覧取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: '資格一覧を返却' })
  getLicenses(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.getLicenses(id);
  }

  @Post(':id/licenses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '資格を追加' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 201, description: '追加された資格を返却' })
  @ApiResponse({ status: 400, description: '資格マスタが無効、または既に登録済み' })
  addLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLicenseDto,
  ) {
    return this.workersService.addLicense(id, dto);
  }

  @Patch(':id/licenses/:lid')
  @ApiOperation({ summary: '資格情報を更新' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiParam({ name: 'lid', description: '保有資格ID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新後の資格情報を返却' })
  @ApiResponse({ status: 404, description: '資格が見つかりません' })
  updateLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lid', ParseUUIDPipe) lid: string,
    @Body() dto: UpdateLicenseDto,
  ) {
    return this.workersService.updateLicense(id, lid, dto);
  }

  @Delete(':id/licenses/:lid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '資格を削除（論理削除）' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiParam({ name: 'lid', description: '保有資格ID', type: 'string' })
  @ApiResponse({ status: 200, description: '削除完了' })
  @ApiResponse({ status: 404, description: '資格が見つかりません' })
  removeLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lid', ParseUUIDPipe) lid: string,
  ) {
    return this.workersService.removeLicense(id, lid);
  }

  // ── Evaluations ───────────────────────────────────────────

  @Get(':id/evaluations')
  @ApiOperation({ summary: '評価一覧取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID（被評価者）', type: 'string' })
  @ApiResponse({ status: 200, description: '評価一覧を返却' })
  getEvaluations(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.getEvaluations(id);
  }

  @Post(':id/evaluations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '評価を追加' })
  @ApiParam({
    name: 'id',
    description: '評価者のユーザーID',
    type: 'string',
  })
  @ApiResponse({ status: 201, description: '追加された評価を返却' })
  @ApiResponse({ status: 400, description: '自分自身は評価できません' })
  @ApiResponse({ status: 404, description: '職人または案件が見つかりません' })
  addEvaluation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.workersService.addEvaluation(id, dto);
  }

  // ── Calendar ──────────────────────────────────────────────

  @Get(':id/calendar')
  @ApiOperation({ summary: '稼働カレンダー取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-03-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-03-31' })
  @ApiResponse({ status: 200, description: 'カレンダーエントリを返却' })
  getCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.workersService.getCalendar(id, startDate, endDate);
  }

  @Put(':id/calendar')
  @ApiOperation({ summary: '稼働カレンダー一括更新（upsert）' })
  @ApiParam({ name: 'id', description: 'ユーザーID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新後のエントリを返却' })
  updateCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.workersService.updateCalendar(id, dto.entries);
  }
}
