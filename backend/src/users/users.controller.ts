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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'ユーザーを作成' })
  @ApiResponse({ status: 201, description: '作成成功' })
  @ApiResponse({ status: 409, description: 'LINE User ID 重複' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'ユーザー一覧を取得（ページネーション付き）' })
  @ApiResponse({ status: 200, description: 'ユーザー一覧' })
  async findAll(@Query() query: SearchUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー詳細を取得' })
  @ApiParam({ name: 'id', description: 'ユーザーID (UUID)' })
  @ApiResponse({ status: 200, description: 'ユーザー詳細' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ユーザー情報を更新' })
  @ApiParam({ name: 'id', description: 'ユーザーID (UUID)' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  @ApiResponse({ status: 409, description: 'LINE User ID 重複' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ユーザーを削除（ソフトデリート）' })
  @ApiParam({ name: 'id', description: 'ユーザーID (UUID)' })
  @ApiResponse({ status: 200, description: '削除成功' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.remove(id, userId);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'ユーザーの稼働状況を更新' })
  @ApiParam({ name: 'id', description: 'ユーザーID (UUID)' })
  @ApiResponse({ status: 200, description: '稼働状況更新成功' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async updateAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.usersService.updateAvailability(id, dto.availability);
  }
}
