import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto, ListProjectsQueryDto } from './dto/project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: '新建项目' })
  @ApiResponse({ status: 201, description: '创建成功', type: ProjectResponseDto })
  async create(@Body() dto: CreateProjectDto, @Headers('authorization') authHeader?: string) {
    return this.projectService.create(dto, authHeader);
  }

  @Get()
  @ApiOperation({ summary: '项目列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: ListProjectsQueryDto, @Headers('authorization') authHeader?: string) {
    return this.projectService.findAll({
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      businessId: query.businessId,
    }, authHeader);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  @ApiParam({ name: 'id', description: '项目ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: ProjectResponseDto })
  async findOne(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.projectService.findOne(id, authHeader);
  }

  @Put(':id')
  @ApiOperation({ summary: '修改项目信息' })
  @ApiParam({ name: 'id', description: '项目ID' })
  @ApiResponse({ status: 200, description: '修改成功', type: ProjectResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Headers('authorization') authHeader?: string) {
    return this.projectService.update(id, dto, authHeader);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  @ApiParam({ name: 'id', description: '项目ID' })
  @ApiQuery({ name: 'permanent', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string, @Query('permanent') permanent?: string, @Headers('authorization') authHeader?: string) {
    await this.projectService.delete(id, permanent === 'true', authHeader);
    return { message: '删除成功' };
  }
}
