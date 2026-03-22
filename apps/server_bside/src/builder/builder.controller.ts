import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuilderService } from './builder.service';
import {
  BuilderInitResponseDto,
  GetComponentListQueryDto,
  GetComponentListResponseDto,
} from './dto/builder.dto';

@ApiTags('builder')
@ApiBearerAuth()
@ApiExtraModels(GetComponentListResponseDto)
@Controller('builder')
export class BuilderController {
  constructor(private readonly builderService: BuilderService) {}

  @Get('init')
  @ApiOperation({ summary: '获取编辑器初始化数据' })
  @ApiQuery({ name: 'pageId', description: '页面ID', required: true })
  @ApiResponse({ status: 200, description: '查询成功', type: BuilderInitResponseDto })
  async init(@Query('pageId') pageId: string, @Headers('authorization') authHeader?: string) {
    if (!pageId) {
      throw new Error('pageId is required');
    }
    return this.builderService.init(pageId, authHeader);
  }

  @Get('component-list')
  @ApiOperation({ summary: '获取组件列表（按页面业务线物料 + 各物料满足条件的最新版本）' })
  @ApiResponse({ status: 200, description: '查询成功', type: GetComponentListResponseDto })
  async getComponentList(
    @Query() query: GetComponentListQueryDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<GetComponentListResponseDto> {
    return this.builderService.getComponentList(query.pageId, query.type, authHeader);
  }
}
