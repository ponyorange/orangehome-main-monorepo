import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { join } from 'path';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';
import { buildComponentsSsrMap } from './components-ssr-map.util';
import { collectMaterialUids } from './schema-material.util';
import { MATERIAL_VERSION_STATUSES_RELEASE_PREVIEW } from './material-version-status';
import { parsePageSchemaJson, unwrapPageSchemaRoot } from './page-schema.util';

/** preview：与 runtime 一致，取最新草稿页版本 */
const PAGE_VERSION_LATEST_DRAFT = 1;

@Injectable()
export class RuntimeSsrService {
  private readonly logger = new Logger(RuntimeSsrService.name);

  constructor(
    private readonly core: CoreGrpcClientService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 仅 preview：解析 schema、校验全部物料具备 SSR URL，生成带 `#app` 内 SSR 占位 HTML 的页面。
   * TODO: 按 componentsSsrMap URL 加载 CJS 并渲染真实组件树，替换当前 `oh-ssr-root` 占位。
   */
  async renderPreview(
    pageid: string,
    langQuery?: string,
  ): Promise<{ html: string; cacheControl: string }> {
    const started = Date.now();
    try {
      const page = await this.core.getPage(pageid);
      const pageData = page?.data;
      if (!pageData) {
        throw new NotFoundException('Page not found');
      }

      const pageTitle = pageData.title ?? 'Page';
      const siteName = this.config.get<string>('runtimeSiteName') ?? 'OrangeHome';
      const lang = (langQuery?.trim() || 'zh-CN') as string;

      const res = await this.core.getLatestPageVersionByStatus(
        pageid,
        PAGE_VERSION_LATEST_DRAFT,
      );
      const hit = res?.data;
      if (!hit) {
        throw new NotFoundException('No page version available');
      }

      const parsed = parsePageSchemaJson(hit.pageSchemaJson);
      const schema = unwrapPageSchemaRoot(parsed);

      const uids = collectMaterialUids(schema);
      this.logger.log({
        msg: 'runtimeSsr.materials.collectedUids',
        pageId: pageid,
        uidCount: uids.length,
        uids,
      });

      const versionStatuses = MATERIAL_VERSION_STATUSES_RELEASE_PREVIEW;
      let rows: unknown[] = [];
      if (uids.length > 0) {
        const matRes = await this.core.getMaterialsWithLatestVersion(
          uids,
          [...versionStatuses],
        );
        rows = matRes?.data ?? [];
        this.logger.log({
          msg: 'runtimeSsr.materials.getMaterialsWithLatestVersion',
          pageId: pageid,
          versionStatuses: [...versionStatuses],
          requestedUids: uids,
          rowCount: rows.length,
        });
      }

      const componentsAmdMap = buildComponentsSsrMap(
        uids,
        rows,
        versionStatuses,
      );

      const ssrHtml = renderToString(
        React.createElement(
          'div',
          { id: 'oh-ssr-root', className: 'oh-ssr-stub' },
          pageTitle,
        ),
      );

      const templatePath = join(__dirname, 'views', 'runtime-page-ssr.ejs');
      const html = await new Promise<string>((resolve, reject) => {
        ejs.renderFile(
          templatePath,
          {
            lang,
            pageTitle,
            siteName,
            pageSchema: schema,
            componentsAmdMap,
            pageScripts: '',
            ssrHtml,
          },
          (err, str) => {
            if (err) reject(err);
            else resolve(str);
          },
        );
      });

      return { html, cacheControl: 'private, no-store' };
    } finally {
      this.logger.log({
        msg: 'runtimeSsr.renderPreview',
        pageId: pageid,
        durationMs: Date.now() - started,
      });
    }
  }
}
