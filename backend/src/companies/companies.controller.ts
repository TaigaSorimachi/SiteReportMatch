import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanySettingsDto } from './dto/company-settings.dto';
import { SearchCompanyDto } from './dto/search-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: '会社を作成' })
  @ApiResponse({ status: 201, description: '作成成功' })
  @ApiResponse({ status: 409, description: '法人番号重複' })
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.companiesService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: '会社一覧を取得（ページネーション付き）' })
  @ApiResponse({ status: 200, description: '会社一覧' })
  async findAll(@Query() query: SearchCompanyDto) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '会社詳細を取得' })
  @ApiParam({ name: 'id', description: '会社ID (UUID)' })
  @ApiResponse({ status: 200, description: '会社詳細' })
  @ApiResponse({ status: 404, description: '会社が見つからない' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '会社情報を更新' })
  @ApiParam({ name: 'id', description: '会社ID (UUID)' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '会社が見つからない' })
  @ApiResponse({ status: 409, description: '法人番号重複' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '会社を削除（ソフトデリート）' })
  @ApiParam({ name: 'id', description: '会社ID (UUID)' })
  @ApiResponse({ status: 200, description: '削除成功' })
  @ApiResponse({ status: 404, description: '会社が見つからない' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.companiesService.remove(id, userId);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: '会社設定を取得' })
  @ApiParam({ name: 'id', description: '会社ID (UUID)' })
  @ApiResponse({ status: 200, description: '会社設定' })
  @ApiResponse({ status: 404, description: '会社が見つからない' })
  async getSettings(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.getSettings(id);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: '会社設定を更新' })
  @ApiParam({ name: 'id', description: '会社ID (UUID)' })
  @ApiResponse({ status: 200, description: '設定更新成功' })
  @ApiResponse({ status: 404, description: '会社が見つからない' })
  async updateSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return this.companiesService.updateSettings(id, dto);
  }
}
