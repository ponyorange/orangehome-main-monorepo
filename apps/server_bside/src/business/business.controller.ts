import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { BusinessResponseDto, ListBusinessesQueryDto } from './dto/business.dto';

@ApiTags('businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: '业务线列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'platformId', required: false })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: ListBusinessesQueryDto, @Headers('authorization') authHeader?: string) {
    return this.businessService.findAll({
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      platformId: query.platformId,
    }, authHeader);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取业务线详情' })
  @ApiParam({ name: 'id', description: '业务线ID' })
  @ApiResponse({ status: 200, description: '查询成功', type: BusinessResponseDto })
  async findOne(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.businessService.findOne(id, authHeader);
  }
}
