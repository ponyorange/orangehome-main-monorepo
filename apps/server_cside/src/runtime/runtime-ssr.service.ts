import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { join } from 'path';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';
import { buildComponentsAmdMapFromRows } from './components-amd-map.util';
import { buildComponentsSsrMap } from './components-ssr-map.util';
import { loadSsrComponentRegistry } from './load-ssr-cjs-registry.util';
import {
  collectSchemaTypes,
  renderSchemaNode,
  type OhSchemaNode,
} from './schema-ssr-render.util';
import { collectMaterialUids } from './schema-material.util';
import {
  MATERIAL_VERSION_STATUSES_DEV,
  MATERIAL_VERSION_STATUSES_RELEASE_ONLY,
} from './material-version-status';
import type { RuntimeType } from './dto/runtime-params.dto';
import { parsePageSchemaJson, unwrapPageSchemaRoot } from './page-schema.util';

/** preview / dev：与 runtime 一致，取最新草稿页版本 */
const PAGE_VERSION_LATEST_DRAFT = 1;

export type RuntimeSsrMode = Extract<RuntimeType, 'preview' | 'dev'>;

@Injectable()
export class RuntimeSsrService {
  private readonly logger = new Logger(RuntimeSsrService.name);

  constructor(
    private readonly core: CoreGrpcClientService,
    private readonly config: ConfigService,
  ) {}

  /**
   * - **preview**：物料仅「已发布」最新版（与 SSG preview 一致）。
   * - **dev**：物料在开发中 / 测试中 / 已发布 中取「最新一条」，与 `runtime/dev` 一致。
   * 页 schema 均为最新草稿；SSR 规则同 `SchemaRender`。
   */
  async renderSsr(
    pageid: string,
    mode: RuntimeSsrMode,
    langQuery?: string,
  ): Promise<{ html: string; cacheControl: string }> {
    const started = Date.now();
    const versionStatuses =
      mode === 'dev'
        ? MATERIAL_VERSION_STATUSES_DEV
        : MATERIAL_VERSION_STATUSES_RELEASE_ONLY;
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
      const root = schema as OhSchemaNode;
      if (
        root === null ||
        typeof root !== 'object' ||
        typeof root.type !== 'string' ||
        !root.type.trim()
      ) {
        throw new BadGatewayException('Invalid schema root');
      }

      const uids = collectMaterialUids(schema);
      const uniqueUids = [...new Set(uids)];
      this.logger.log({
        msg: 'runtimeSsr.materials.collectedUids',
        pageId: pageid,
        mode,
        uidCount: uniqueUids.length,
        uids: uniqueUids,
      });

      let rows: unknown[] = [];
      if (uniqueUids.length > 0) {
        const matRes = await this.core.getMaterialsWithLatestVersion(
          uniqueUids,
          [...versionStatuses],
        );
        rows = matRes?.data ?? [];
        this.logger.log({
          msg: 'runtimeSsr.materials.getMaterialsWithLatestVersion',
          pageId: pageid,
          mode,
          versionStatuses: [...versionStatuses],
          requestedUids: uniqueUids,
          rowCount: rows.length,
        });
      }

      const componentsSsrMap = buildComponentsSsrMap(
        uniqueUids,
        rows,
        versionStatuses,
      );

      const componentsAmdMap = buildComponentsAmdMapFromRows(
        uniqueUids,
        rows,
        versionStatuses,
      );

      this.logger.log({
        msg: 'runtimeSsr.materials.maps',
        pageId: pageid,
        mode,
        ssrMapSize: Object.keys(componentsSsrMap).length,
        amdMapSize: Object.keys(componentsAmdMap).length,
      });

      const types = [...collectSchemaTypes(root)];
      let ssrHtml: string;
      try {
        const registry = await loadSsrComponentRegistry(types, componentsSsrMap);
        const tree = renderSchemaNode(root, registry);
        if (!tree) {
          throw new BadGatewayException(
            'SSR render failed: root component not in registry',
          );
        }
        ssrHtml = renderToString(
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(
              'main',
              { className: 'app' },
              React.createElement('div', { className: 'schema-root' }, tree),
            ),
          ),
        );
      } catch (e) {
        if (e instanceof BadGatewayException || e instanceof NotFoundException) {
          throw e;
        }
        this.logger.warn({
          msg: 'runtimeSsr.renderStringFailed',
          pageId: pageid,
          err: e instanceof Error ? e.message : String(e),
        });
        throw new BadGatewayException(
          e instanceof Error ? e.message : String(e),
        );
      }

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
        msg: 'runtimeSsr.renderSsr',
        pageId: pageid,
        mode,
        durationMs: Date.now() - started,
      });
    }
  }
}
