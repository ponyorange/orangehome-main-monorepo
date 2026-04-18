import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RuntimeParamsDto } from './dto/runtime-params.dto';
import { RuntimeSsrService } from './runtime-ssr.service';

@Controller()
export class RuntimeSsrController {
  constructor(private readonly runtimeSsr: RuntimeSsrService) {}

  @Get('orangehome/runtime-ssr/:type/:pageid')
  async getRuntimeSsrPage(
    @Param() params: RuntimeParamsDto,
    @Query('lang') lang: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    if (params.type !== 'preview') {
      res.status(501);
      res.setHeader('Cache-Control', 'no-store');
      res.type('json');
      return JSON.stringify({
        error: 'SSR is only implemented for preview',
        type: params.type,
      });
    }

    const { html, cacheControl } = await this.runtimeSsr.renderPreview(
      params.pageid,
      lang,
    );
    res.setHeader('Cache-Control', cacheControl);
    res.type('html');
    return html;
  }
}
