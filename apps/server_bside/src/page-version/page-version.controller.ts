import { Controller, Get, Post, Delete, Body, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { SavePageContentDto, PageVersionResponseDto, ListPageVersionsQueryDto } from './dto/page-version.dto';
import { PageVersionService } from './page-version.service';

@ApiTags('page-versions')
@ApiBearerAuth()
@Controller('page-versions')
export class PageVersionController {
  constructor(
    private readonly pageVersionService: PageVersionService,
    private readonly authService: AuthService,
  ) {}

  @Post('save')
  @ApiOperation({ summary: '保存页面内容' })
  @ApiResponse({ status: 201, description: '保存成功', type: PageVersionResponseDto })
  async saveContent(@Body() dto: SavePageContentDto, @Headers('authorization') authHeader?: string) {
    return this.pageVersionService.saveContent(dto, authHeader);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布页面版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '发布成功', type: PageVersionResponseDto })
  async publish(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.pageVersionService.publish(id, authHeader);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '回滚成功', type: PageVersionResponseDto })
  async rollback(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      throw new UnauthorizedException('请提供有效的 Bearer Token');
    }
    const currentUser = await this.authService.getCurrentUser(accessToken);
    return this.pageVersionService.rollback(id, currentUser.id, authHeader);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除页面版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    await this.pageVersionService.delete(id, authHeader);
    return { message: '删除成功' };
  }

  @Get('latest')
  @ApiOperation({ summary: '获取页面最新版本' })
  @ApiQuery({ name: 'pageId', description: '页面ID', required: true })
  @ApiResponse({ status: 200, description: '查询成功', type: PageVersionResponseDto })
  async findLatest(@Query('pageId') pageId: string, @Headers('authorization') authHeader?: string) {
    if (!pageId) {
      throw new Error('pageId is required');
    }
    return this.pageVersionService.findLatestByPage(pageId, authHeader);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取版本详情' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: PageVersionResponseDto })
  async findOne(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.pageVersionService.findOne(id, authHeader);
  }

  @Get()
  @ApiOperation({ summary: '页面版本列表' })
  @ApiQuery({ name: 'pageId', description: '页面ID', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: { pageId?: string } & ListPageVersionsQueryDto, @Headers('authorization') authHeader?: string) {
    if (!query.pageId) {
      throw new Error('pageId is required');
    }
    return this.pageVersionService.findByPage(query.pageId, {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    }, authHeader);
  }
}
