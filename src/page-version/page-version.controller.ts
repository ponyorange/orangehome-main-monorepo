import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PageVersionService } from './page-version.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';

@ApiTags('Page Version Management Module')
@Controller('page-version')
@ApiBearerAuth()
export class PageVersionController {
  constructor(private readonly pageVersionService: PageVersionService) {}

  @Post()
  @ApiOperation({ summary: 'Create new page version' })
  create(@Body() createPageVersionDto: CreatePageVersionDto) {
    return this.pageVersionService.create(createPageVersionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get version list for page' })
  @ApiQuery({ name: 'pageId', description: 'Page ID to get versions for' })
  findAll(@Query('pageId') pageId: string) {
    return this.pageVersionService.findAll(pageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page version details by ID' })
  findOne(@Param('id') id: string) {
    return this.pageVersionService.findOne(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish page version' })
  publish(@Param('id') id: string) {
    return this.pageVersionService.publish(id);
  }

  @Put('/page/:pageId/rollback/:versionId')
  @ApiOperation({ summary: 'Rollback page to specific version' })
  rollback(
    @Param('pageId') pageId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.pageVersionService.rollback(pageId, versionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page version' })
  remove(@Param('id') id: string) {
    return this.pageVersionService.remove(id);
  }
}
