import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { GrpcClientService } from '../config/grpc-client.service';
import { PageService } from '../page/page.service';
import { PageVersionService } from '../page-version/page-version.service';
import { ProjectService } from '../project/project.service';
import {
  BuilderInitResponseDto,
  ComponentListItemDto,
  ComponentMaterialDto,
  ComponentVersionDto,
  GetComponentListResponseDto,
} from './dto/builder.dto';

/** 与物料版本表一致：0 开发中 1 测试中 2 已发布(上线) 3 已下线 */
const MATERIAL_VERSION_DEV = 0;
const MATERIAL_VERSION_PUBLISHED = 2;

@Injectable()
export class BuilderService {
  constructor(
    private readonly pageService: PageService,
    private readonly projectService: ProjectService,
    private readonly pageVersionService: PageVersionService,
    private readonly grpcClient: GrpcClientService,
  ) {}

  async init(pageId: string, authHeader?: string): Promise<BuilderInitResponseDto> {
    const page = await this.pageService.findOne(pageId, authHeader);

    const [project, pageVersion] = await Promise.all([
      this.projectService.findOne(page.projectId, authHeader),
      this.pageVersionService.findLatestByPage(pageId, authHeader),
    ]);

    return {
      project,
      page,
      pageVersion,
    };
  }

  async getComponentList(
    pageId: string,
    type: 'online' | 'dev',
    authHeader?: string,
  ): Promise<GetComponentListResponseDto> {
    const page = await this.pageService.findOne(pageId, authHeader);
    const project = await this.projectService.findOne(page.projectId, authHeader);
    const businessId = project.businessId;
    const metadata = this.grpcClient.createAuthMetadata(authHeader);

    const materials = await this.listAllMaterialsByBusinessId(businessId, metadata);
    const activeMaterials = materials.filter((m: any) => !(m.isDeleted ?? m.is_deleted));

    const items: ComponentListItemDto[] = await Promise.all(
      activeMaterials.map(async (raw: any) => {
        const material = this.mapMaterial(raw);
        const latestVersion = await this.resolveLatestMaterialVersion(
          material.id,
          type,
          metadata,
        );
        return {
          material,
          latestVersion,
        };
      }),
    );

    return { businessId, items };
  }

  private async listAllMaterialsByBusinessId(businessId: string, metadata: any): Promise<any[]> {
    const acc: any[] = [];
    let grpcPage = 1;
    const limit = 100;
    try {
      for (;;) {
        const result = await firstValueFrom(
          this.grpcClient.material.listMaterials(
            {
              page: grpcPage,
              limit,
              businessId: this.grpcClient.wrapStringValue(businessId),
            },
            metadata,
          ),
        );
        const batch = result.data || [];
        acc.push(...batch);
        const total = Number(result.total) || 0;
        if (batch.length < limit || acc.length >= total) {
          break;
        }
        grpcPage += 1;
      }
      return acc;
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private async resolveLatestMaterialVersion(
    materialId: string,
    type: 'online' | 'dev',
    metadata: any,
  ): Promise<ComponentVersionDto | null> {
    try {
      if (type === 'online') {
        const versions = await this.listAllVersionsForMaterialWithOptionalStatus(
          materialId,
          MATERIAL_VERSION_PUBLISHED,
          metadata,
        );
        const best = this.pickLatestVersion(versions, (v) => this.versionMatchesOnline(v));
        return best ? this.mapVersion(best) : null;
      }

      const allVersions = await this.listAllVersionsForMaterial(materialId, metadata);
      const best = this.pickLatestVersion(allVersions, (v) => this.versionMatchesDev(v));
      return best ? this.mapVersion(best) : null;
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private async listAllVersionsForMaterialWithOptionalStatus(
    materialId: string,
    status: number | undefined,
    metadata: any,
  ): Promise<any[]> {
    const acc: any[] = [];
    let grpcPage = 1;
    const limit = 100;
    for (;;) {
      const result = await firstValueFrom(
        this.grpcClient.materialVersion.listMaterialVersions(
          {
            materialId,
            page: grpcPage,
            limit,
            status: status === undefined ? undefined : this.grpcClient.wrapInt32Value(status),
          },
          metadata,
        ),
      );
      const rawBatch = result.data || [];
      acc.push(...rawBatch.filter((v: any) => !(v.isDeleted ?? v.is_deleted)));
      if (rawBatch.length < limit) {
        break;
      }
      grpcPage += 1;
    }
    return acc;
  }

  private async listAllVersionsForMaterial(materialId: string, metadata: any): Promise<any[]> {
    return this.listAllVersionsForMaterialWithOptionalStatus(materialId, undefined, metadata);
  }

  /** 已上线：状态为已发布(2)，或 core 标记 isPublished */
  private versionMatchesOnline(v: any): boolean {
    const st = this.numericStatus(v);
    const published = this.field(v, 'isPublished', 'is_published') === true;
    return st === MATERIAL_VERSION_PUBLISHED || published;
  }

  /** 开发环境：开发中(0)、已发布(2)，或已标记发布 */
  private versionMatchesDev(v: any): boolean {
    const st = this.numericStatus(v);
    const published = this.field(v, 'isPublished', 'is_published') === true;
    return st === MATERIAL_VERSION_DEV || st === MATERIAL_VERSION_PUBLISHED || published;
  }

  private toNumber(v: any): number {
    if (v === undefined || v === null) {
      return 0;
    }
    if (typeof v === 'number') {
      return v;
    }
    if (typeof v === 'object' && v.low !== undefined) {
      return Number(v.low);
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private numericStatus(v: any): number {
    return this.toNumber(this.field(v, 'status', 'status'));
  }

  private pickLatestVersion(versions: any[], predicate: (v: any) => boolean): any | null {
    let best: any | null = null;
    let bestCode = -1;
    for (const v of versions) {
      if (!predicate(v)) {
        continue;
      }
      const code = this.toNumber(this.field(v, 'versionCode', 'version_code'));
      if (code > bestCode) {
        bestCode = code;
        best = v;
      }
    }
    return best;
  }

  private field(data: any, camel: string, snake: string): any {
    if (data[camel] !== undefined && data[camel] !== null) {
      return data[camel];
    }
    return data[snake];
  }

  private unwrapStringField(v: any): string | undefined {
    if (v === undefined || v === null) {
      return undefined;
    }
    if (typeof v === 'string') {
      return v;
    }
    if (typeof v === 'object' && v.value !== undefined && v.value !== null) {
      return String(v.value);
    }
    return undefined;
  }

  private mapMaterial(data: any): ComponentMaterialDto {
    return {
      id: data.id,
      materialUid: String(this.field(data, 'materialUid', 'material_uid') ?? ''),
      materialName: String(this.field(data, 'materialName', 'material_name') ?? ''),
      description: this.unwrapStringField(data.description),
      icon: this.unwrapStringField(data.icon),
      platformId: String(this.field(data, 'platformId', 'platform_id') ?? ''),
      platformName: String(this.field(data, 'platformName', 'platform_name') ?? ''),
      typeId: String(this.field(data, 'typeId', 'type_id') ?? ''),
      typeName: String(this.field(data, 'typeName', 'type_name') ?? ''),
      categoryId: String(this.field(data, 'categoryId', 'category_id') ?? ''),
      categoryName: String(this.field(data, 'categoryName', 'category_name') ?? ''),
      status: String(this.field(data, 'status', 'status') ?? ''),
      visibility: String(this.field(data, 'visibility', 'visibility') ?? ''),
      businessId: this.unwrapStringField(this.field(data, 'businessId', 'business_id')),
      businessName: this.unwrapStringField(this.field(data, 'businessName', 'business_name')),
    };
  }

  private mapVersion(data: any): ComponentVersionDto {
    const materialId = this.field(data, 'materialId', 'material_id');
    return {
      id: data.id,
      materialId: String(materialId ?? ''),
      version: String(this.field(data, 'version', 'version') ?? ''),
      versionCode: this.toNumber(this.field(data, 'versionCode', 'version_code')),
      changelog: this.unwrapStringField(this.field(data, 'changelog', 'changelog')),
      fileObjectKey: String(this.field(data, 'fileObjectKey', 'file_object_key') ?? ''),
      fileUrl: this.unwrapStringField(this.field(data, 'fileUrl', 'file_url')),
      sourceObjectKey: this.unwrapStringField(this.field(data, 'sourceObjectKey', 'source_object_key')),
      sourceUrl: this.unwrapStringField(this.field(data, 'sourceUrl', 'source_url')),
      status: this.numericStatus(data),
      isPublished: Boolean(this.field(data, 'isPublished', 'is_published')),
      editorConfigJson: this.field(data, 'editorConfigJson', 'editor_config_json'),
      releaseTime: this.normalizeTimestamp(this.field(data, 'releaseTime', 'release_time')),
      createdAt: this.normalizeTimestamp(this.field(data, 'createdAt', 'created_at')),
      updatedAt: this.normalizeTimestamp(this.field(data, 'updatedAt', 'updated_at')),
    };
  }

  private normalizeTimestamp(value: any): Date {
    if (!value) {
      return new Date(0);
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? new Date(0) : date;
    }
    if (typeof value === 'object' && value.seconds !== undefined) {
      const seconds = Number(value.seconds) || 0;
      const nanos = Number(value.nanos) || 0;
      return new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
    }
    return new Date(0);
  }

  private handleGrpcError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    if (error.code === 16) {
      throw new UnauthorizedException(error.details || error.message || '请提供有效的 Bearer Token');
    }
    throw new HttpException(error.details || error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
