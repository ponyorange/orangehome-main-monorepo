import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('Page Management Module')
@Controller('page')
@ApiBearerAuth()
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @ApiOperation({ summary: 'Create new page' })
  create(@Body() createPageDto: CreatePageDto) {
    return this.pageService.create(createPageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get page list for project' })
  @ApiQuery({ name: 'projectId', description: 'Project ID to get pages for' })
  findAll(@Query('projectId') projectId: string) {
    return this.pageService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page details by ID' })
  findOne(@Param('id') id: string) {
    return this.pageService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update page information' })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pageService.update(id, updatePageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page' })
  remove(@Param('id') id: string) {
    return this.pageService.remove(id);
  }
}
