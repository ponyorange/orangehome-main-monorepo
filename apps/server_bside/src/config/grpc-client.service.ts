import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CORE_GRPC_CLIENT } from './grpc-client.constants';

export interface ProjectService {
  createProject(data: any, metadata?: Metadata): Observable<any>;
  updateProject(data: any, metadata?: Metadata): Observable<any>;
  deleteProject(data: any, metadata?: Metadata): Observable<any>;
  getProject(data: any, metadata?: Metadata): Observable<any>;
  listProjects(data: any, metadata?: Metadata): Observable<any>;
}

export interface BusinessService {
  getBusiness(data: any, metadata?: Metadata): Observable<any>;
  listBusinesses(data: any, metadata?: Metadata): Observable<any>;
}

export interface PageService {
  createPage(data: any, metadata?: Metadata): Observable<any>;
  updatePage(data: any, metadata?: Metadata): Observable<any>;
  deletePage(data: any, metadata?: Metadata): Observable<any>;
  getPage(data: any, metadata?: Metadata): Observable<any>;
  listPages(data: any, metadata?: Metadata): Observable<any>;
}

export interface PageVersionService {
  savePageContent(data: any, metadata?: Metadata): Observable<any>;
  publishPageVersion(data: any, metadata?: Metadata): Observable<any>;
  listPageVersions(data: any, metadata?: Metadata): Observable<any>;
  rollbackPageVersion(data: any, metadata?: Metadata): Observable<any>;
  deletePageVersion(data: any, metadata?: Metadata): Observable<any>;
  getPageVersion(data: any, metadata?: Metadata): Observable<any>;
}

export interface MaterialGrpcService {
  listMaterials(data: any, metadata?: Metadata): Observable<any>;
}

export interface MaterialVersionGrpcService {
  listMaterialVersions(data: any, metadata?: Metadata): Observable<any>;
}

@Injectable()
export class GrpcClientService implements OnModuleInit {
  constructor(@Inject(CORE_GRPC_CLIENT) private readonly client: ClientGrpc) {}

  private businessService!: BusinessService;
  private projectService!: ProjectService;
  private pageService!: PageService;
  private pageVersionService!: PageVersionService;
  private materialGrpcService!: MaterialGrpcService;
  private materialVersionGrpcService!: MaterialVersionGrpcService;

  onModuleInit() {
    this.businessService = this.client.getService<BusinessService>('BusinessService');
    this.projectService = this.client.getService<ProjectService>('ProjectService');
    this.pageService = this.client.getService<PageService>('PageService');
    this.pageVersionService = this.client.getService<PageVersionService>('PageVersionService');
    this.materialGrpcService = this.client.getService<MaterialGrpcService>('MaterialService');
    this.materialVersionGrpcService = this.client.getService<MaterialVersionGrpcService>('MaterialVersionService');
  }

  get business(): BusinessService {
    return this.businessService;
  }

  get project(): ProjectService {
    return this.projectService;
  }

  get page(): PageService {
    return this.pageService;
  }

  get pageVersion(): PageVersionService {
    return this.pageVersionService;
  }

  get material(): MaterialGrpcService {
    return this.materialGrpcService;
  }

  get materialVersion(): MaterialVersionGrpcService {
    return this.materialVersionGrpcService;
  }

  createAuthMetadata(authHeader?: string): Metadata {
    const metadata = new Metadata();
    const normalized = authHeader?.trim();
    if (!normalized) {
      return metadata;
    }

    metadata.set(
      'authorization',
      /^Bearer\s+/i.test(normalized) ? normalized : `Bearer ${normalized}`,
    );
    return metadata;
  }

  wrapStringValue(value?: string): { value: string } | undefined {
    if (value === undefined) {
      return undefined;
    }
    return { value };
  }

  wrapInt32Value(value?: number): { value: number } | undefined {
    if (value === undefined) {
      return undefined;
    }
    return { value };
  }
}
