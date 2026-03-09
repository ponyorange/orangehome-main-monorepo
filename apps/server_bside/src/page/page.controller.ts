import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PageService } from './page.service';
import { CreatePageDto, UpdatePageDto, PageResponseDto, ListPagesQueryDto } from './dto/page.dto';

@ApiTags('pages')
@ApiBearerAuth()
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @ApiOperation({ summary: '新建页面' })
  @ApiResponse({ status: 201, description: '创建成功', type: PageResponseDto })
  async create(@Body() dto: CreatePageDto) {
    return this.pageService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '页面列表' })
  @ApiQuery({ name: 'projectId', description: '项目ID', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: { projectId?: string } & ListPagesQueryDto) {
    if (!query.projectId) {
      throw new Error('projectId is required');
    }
    return this.pageService.findByProject(query.projectId, {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取页面详情' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: PageResponseDto })
  async findOne(@Param('id') id: string) {
    return this.pageService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '修改页面信息' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '修改成功', type: PageResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiQuery({ name: 'permanent', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string, @Query('permanent') permanent?: string) {
    await this.pageService.delete(id, permanent === 'true');
    return { message: '删除成功' };
  }
}
