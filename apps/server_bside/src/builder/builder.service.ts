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
    const activeMaterials = materials.filter((m: any) => !m.is_deleted);

    const allowedStatuses =
      type === 'online'
        ? new Set<number>([MATERIAL_VERSION_PUBLISHED])
        : new Set<number>([MATERIAL_VERSION_DEV, MATERIAL_VERSION_PUBLISHED]);

    const items: ComponentListItemDto[] = await Promise.all(
      activeMaterials.map(async (raw: any) => {
        const material = this.mapMaterial(raw);
        const latestVersion = await this.resolveLatestMaterialVersion(
          material.id,
          type,
          allowedStatuses,
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
              business_id: this.grpcClient.wrapStringValue(businessId),
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
    allowedStatuses: Set<number>,
    metadata: any,
  ): Promise<ComponentVersionDto | null> {
    try {
      if (type === 'online') {
        const versions = await this.listAllVersionsForMaterialWithOptionalStatus(
          materialId,
          MATERIAL_VERSION_PUBLISHED,
          metadata,
        );
        const best = this.pickLatestByVersionCode(versions, allowedStatuses);
        return best ? this.mapVersion(best) : null;
      }

      const allVersions = await this.listAllVersionsForMaterial(materialId, metadata);
      const best = this.pickLatestByVersionCode(allVersions, allowedStatuses);
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
            material_id: materialId,
            page: grpcPage,
            limit,
            status: status === undefined ? undefined : this.grpcClient.wrapInt32Value(status),
          },
          metadata,
        ),
      );
      const rawBatch = result.data || [];
      acc.push(...rawBatch.filter((v: any) => !v.is_deleted));
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

  private pickLatestByVersionCode(versions: any[], allowedStatuses: Set<number>): any | null {
    let best: any | null = null;
    let bestCode = -1;
    for (const v of versions) {
      const st = Number(v.status);
      if (!allowedStatuses.has(st)) {
        continue;
      }
      const code = Number(v.version_code) || 0;
      if (code > bestCode) {
        bestCode = code;
        best = v;
      }
    }
    return best;
  }

  private mapMaterial(data: any): ComponentMaterialDto {
    return {
      id: data.id,
      materialUid: data.material_uid,
      materialName: data.material_name,
      description: data.description?.value,
      icon: data.icon?.value,
      platformId: data.platform_id,
      platformName: data.platform_name,
      typeId: data.type_id,
      typeName: data.type_name,
      categoryId: data.category_id,
      categoryName: data.category_name,
      status: data.status,
      visibility: data.visibility,
      businessId: data.business_id?.value,
      businessName: data.business_name?.value,
    };
  }

  private mapVersion(data: any): ComponentVersionDto {
    return {
      id: data.id,
      materialId: data.material_id,
      version: data.version,
      versionCode: data.version_code,
      changelog: data.changelog?.value,
      fileObjectKey: data.file_object_key,
      fileUrl: data.file_url?.value,
      sourceObjectKey: data.source_object_key?.value,
      sourceUrl: data.source_url?.value,
      status: data.status,
      isPublished: data.is_published,
      editorConfigJson: data.editor_config_json,
      releaseTime: this.normalizeTimestamp(data.release_time),
      createdAt: this.normalizeTimestamp(data.created_at),
      updatedAt: this.normalizeTimestamp(data.updated_at),
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
