import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RuntimeParamsDto } from './dto/runtime-params.dto';
import { RuntimeService } from './runtime.service';

@Controller()
export class RuntimeController {
  constructor(private readonly runtime: RuntimeService) {}

  @Get('orangehome/runtime/:type/:pageid')
  async getRuntimePage(
    @Param() params: RuntimeParamsDto,
    @Query('lang') lang: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { html, cacheControl } = await this.runtime.render(
      params.type,
      params.pageid,
      lang,
    );
    res.setHeader('Cache-Control', cacheControl);
    res.type('html');
    return html;
  }
}
