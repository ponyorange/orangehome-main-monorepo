import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';

export interface ProjectService {
  createProject(data: any): Promise<any>;
  updateProject(data: any): Promise<any>;
  deleteProject(data: any): Promise<any>;
  getProject(data: any): Promise<any>;
  listProjects(data: any): Promise<any>;
}

export interface PageService {
  createPage(data: any): Promise<any>;
  updatePage(data: any): Promise<any>;
  deletePage(data: any): Promise<any>;
  getPage(data: any): Promise<any>;
  listPages(data: any): Promise<any>;
}

export interface PageVersionService {
  savePageContent(data: any): Promise<any>;
  publishPageVersion(data: any): Promise<any>;
  listPageVersions(data: any): Promise<any>;
  rollbackPageVersion(data: any): Promise<any>;
  deletePageVersion(data: any): Promise<any>;
  getPageVersion(data: any): Promise<any>;
}

@Injectable()
export class GrpcClientService implements OnModuleInit {
  @Client({
    transport: 4, // Transport.GRPC
    options: {
      package: 'orangehome.core',
      protoPath: join(__dirname, '../../proto/core.proto'),
      url: process.env.CORE_SERVICE_GRPC_URL || 'localhost:50051',
    },
  })
  private readonly client!: ClientGrpc;

  private projectService!: ProjectService;
  private pageService!: PageService;
  private pageVersionService!: PageVersionService;

  onModuleInit() {
    this.projectService = this.client.getService<ProjectService>('ProjectService');
    this.pageService = this.client.getService<PageService>('PageService');
    this.pageVersionService = this.client.getService<PageVersionService>('PageVersionService');
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
}
