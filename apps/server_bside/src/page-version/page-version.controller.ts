import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PageVersionService } from './page-version.service';
import { SavePageContentDto, PageVersionResponseDto, ListPageVersionsQueryDto } from './dto/page-version.dto';

@ApiTags('page-versions')
@ApiBearerAuth()
@Controller('page-versions')
export class PageVersionController {
  constructor(private readonly pageVersionService: PageVersionService) {}

  @Post('save')
  @ApiOperation({ summary: '保存页面内容' })
  @ApiResponse({ status: 201, description: '保存成功', type: PageVersionResponseDto })
  async saveContent(@Body() dto: SavePageContentDto) {
    return this.pageVersionService.saveContent(dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布页面版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '发布成功', type: PageVersionResponseDto })
  async publish(@Param('id') id: string) {
    return this.pageVersionService.publish(id);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '回滚成功', type: PageVersionResponseDto })
  async rollback(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    // 从 token 中解析 userId，这里简化处理，实际应该从 token 中获取
    // 暂时使用一个默认值
    const userId = 'default-user';
    return this.pageVersionService.rollback(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除页面版本' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    await this.pageVersionService.delete(id);
    return { message: '删除成功' };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取版本详情' })
  @ApiParam({ name: 'id', description: '版本ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: PageVersionResponseDto })
  async findOne(@Param('id') id: string) {
    return this.pageVersionService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: '页面版本列表' })
  @ApiQuery({ name: 'pageId', description: '页面ID', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: { pageId?: string } & ListPageVersionsQueryDto) {
    if (!query.pageId) {
      throw new Error('pageId is required');
    }
    return this.pageVersionService.findByPage(query.pageId, {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
  }
}
