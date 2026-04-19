import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { join } from 'path';
import { CoreGrpcClientService } from '../core-grpc/core-grpc-client.service';
import { buildComponentsAmdMapFromRows } from './components-amd-map.util';
import { parsePageSchemaJson, unwrapPageSchemaRoot } from './page-schema.util';
import { collectMaterialUids } from './schema-material.util';
import type { RuntimeType } from './dto/runtime-params.dto';
import {
  MATERIAL_VERSION_STATUSES_DEV,
  MATERIAL_VERSION_STATUSES_RELEASE_ONLY,
} from './material-version-status';

/** core GetLatestPageVersionByStatus: 1=latest_draft, 2=published */
const PAGE_VERSION_LATEST_DRAFT = 1;
const PAGE_VERSION_PUBLISHED = 2;

@Injectable()
export class RuntimeService {
  private readonly logger = new Logger(RuntimeService.name);

  constructor(
    private readonly core: CoreGrpcClientService,
    private readonly config: ConfigService,
  ) { }

  async render(
    type: RuntimeType,
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

      const parsed = await this.resolvePageSchemaByRuntimeType(type, pageid);
      const schema = unwrapPageSchemaRoot(parsed);

      this.logger.log({
        msg: 'runtime.materials.schemaShape',
        pageId: pageid,
        runtimeType: type,
        ...this.schemaShapeForLog(parsed, schema),
      });

      const uids = collectMaterialUids(schema);
      this.logger.log({
        msg: 'runtime.materials.collectedUids',
        pageId: pageid,
        runtimeType: type,
        uidCount: uids.length,
        uids,
      });

      /** release / preview：仅已发布物料；dev：含开发中/测试中 */
      const versionStatuses =
        type === 'dev'
          ? MATERIAL_VERSION_STATUSES_DEV
          : MATERIAL_VERSION_STATUSES_RELEASE_ONLY;
      const componentsAmdMap = await this.buildComponentsMapWithMaterialVersionStatus(
        uids,
        pageid,
        type,
        versionStatuses,
      );

      this.logger.log({
        msg: 'runtime.materials.componentsAmdMap',
        pageId: pageid,
        runtimeType: type,
        mapSize: Object.keys(componentsAmdMap).length,
        mapKeys: Object.keys(componentsAmdMap),
      });

      const templatePath = join(__dirname, 'views', 'runtime-page.ejs');
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
          },
          (err, str) => {
            if (err) reject(err);
            else resolve(str);
          },
        );
      });

      const cacheControl =
        type === 'release'
          ? `public, max-age=${this.config.get<number>('releaseCacheMaxAge') ?? 60}, stale-while-revalidate=${this.config.get<number>('releaseCacheStaleWhileRevalidate') ?? 300}`
          : 'private, no-store';

      return { html, cacheControl };
    } finally {
      this.logger.log({
        msg: 'runtime.render',
        type,
        pageId: pageid,
        durationMs: Date.now() - started,
      });
    }
  }

  /** 仅用于日志：解析结果顶层键、是否使用 `{ schema: ... }` 解包、根节点 type、子节点 type 抽样 */
  private schemaShapeForLog(parsed: unknown, root: unknown): {
    parsedTopKeys: string[];
    usedInnerSchemaWrapper: boolean;
    rootType: string | undefined;
    rootChildCount: number;
    childTypesSample: string[];
  } {
    const parsedTopKeys =
      parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? Object.keys(parsed as object)
        : [];
    const usedInnerSchemaWrapper = root !== parsed;
    let rootType: string | undefined;
    let rootChildCount = 0;
    let childTypesSample: string[] = [];
    if (root !== null && typeof root === 'object' && !Array.isArray(root)) {
      const r = root as Record<string, unknown>;
      rootType = typeof r.type === 'string' ? r.type : undefined;
      const ch = r.children;
      if (Array.isArray(ch)) {
        rootChildCount = ch.length;
        childTypesSample = ch.slice(0, 24).map((c) => {
          if (c !== null && typeof c === 'object' && !Array.isArray(c)) {
            const t = (c as Record<string, unknown>).type;
            return typeof t === 'string' ? t : '(no string type)';
          }
          return '(non-object)';
        });
      }
    }
    return {
      parsedTopKeys,
      usedInnerSchemaWrapper,
      rootType,
      rootChildCount,
      childTypesSample,
    };
  }

  /**
   * 使用 core `GetLatestPageVersionByStatus`：release=已发布最新，preview/dev=当前最新草稿。
   */
  private async resolvePageSchemaByRuntimeType(
    type: RuntimeType,
    pageid: string,
  ): Promise<unknown> {
    const versionStatus =
      type === 'release' ? PAGE_VERSION_PUBLISHED : PAGE_VERSION_LATEST_DRAFT;
    const res = await this.core.getLatestPageVersionByStatus(
      pageid,
      versionStatus,
    );
    const hit = res?.data;
    if (!hit) {
      throw new NotFoundException('No page version available');
    }
    return parsePageSchemaJson(hit.pageSchemaJson);
  }

  /** MaterialService.getMaterialsWithLatestVersion，`versionStatus` 为允许的状态集合 */
  private async buildComponentsMapWithMaterialVersionStatus(
    uids: string[],
    pageId: string,
    runtimeType: RuntimeType,
    versionStatuses: readonly number[],
  ): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    if (uids.length === 0) {
      this.logger.log({
        msg: 'runtime.materials.skipGrpcEmptyUids',
        pageId,
        runtimeType,
      });
      return map;
    }

    const res = await this.core.getMaterialsWithLatestVersion(
      uids,
      [...versionStatuses],
    );
    const rows: any[] = res?.data ?? [];
    this.logger.log({
      msg: 'runtime.materials.getMaterialsWithLatestVersion',
      pageId,
      runtimeType,
      versionStatuses: [...versionStatuses],
      requestedUids: uids,
      rowCount: rows.length,
      rowMaterialUids: rows
        .map((row) => row?.material?.materialUid)
        .filter((x: unknown): x is string => typeof x === 'string'),
    });

    return buildComponentsAmdMapFromRows(uids, rows, versionStatuses);
  }
}
