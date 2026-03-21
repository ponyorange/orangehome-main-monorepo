import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuilderService } from './builder.service';
import { BuilderInitResponseDto } from './dto/builder.dto';

@ApiTags('builder')
@ApiBearerAuth()
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
}
