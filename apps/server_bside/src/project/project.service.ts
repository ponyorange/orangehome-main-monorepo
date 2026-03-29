import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto/project.dto';
import { ProjectMembershipService } from './project-membership.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectService {
  constructor(
    private readonly grpcClient: GrpcClientService,
    private readonly membership: ProjectMembershipService,
  ) { }

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

  async create(dto: CreateProjectDto, authHeader?: string): Promise<ProjectResponseDto> {
    try {
      const ownerEmail = await this.membership.getCallerEmail(authHeader);
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(
        this.grpcClient.project.createProject({
          projectCode: dto.projectCode,
          projectName: dto.projectName,
          businessId: dto.businessId,
          description: this.grpcClient.wrapStringValue(dto.description),
          config: this.grpcClient.wrapStringValue(dto.config),
          owner: ownerEmail,
          collaborators: dto.collaborators || [],
        }, metadata),
      );
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async update(id: string, dto: UpdateProjectDto, authHeader?: string): Promise<ProjectResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const existing = await firstValueFrom(this.grpcClient.project.getProject({ id }, metadata));
      await this.membership.requireProjectMember(authHeader, {
        owner: existing.data?.owner,
        collaborators: existing.data?.collaborators,
      });
      const result = await firstValueFrom(
        this.grpcClient.project.updateProject({
          id,
          projectName: this.grpcClient.wrapStringValue(dto.projectName),
          description: this.grpcClient.wrapStringValue(dto.description),
          config: this.grpcClient.wrapStringValue(dto.config),
          owner: this.grpcClient.wrapStringValue(dto.owner),
          collaborators: dto.collaborators,
        }, metadata),
      );
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async delete(id: string, permanent: boolean = false, authHeader?: string): Promise<void> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const existing = await firstValueFrom(this.grpcClient.project.getProject({ id }, metadata));
      await this.membership.requireProjectMember(authHeader, {
        owner: existing.data?.owner,
        collaborators: existing.data?.collaborators,
      });
      await firstValueFrom(this.grpcClient.project.deleteProject({ id, permanent }, metadata));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(id: string, authHeader?: string): Promise<ProjectResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(this.grpcClient.project.getProject({ id }, metadata));
      await this.membership.requireProjectMember(authHeader, {
        owner: result.data?.owner,
        collaborators: result.data?.collaborators,
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; businessId?: string }, authHeader?: string): Promise<{
    data: ProjectResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const email = await this.membership.getCallerEmail(authHeader);
      const emailFilter = this.grpcClient.wrapStringValue(email);
      const result = await firstValueFrom(
        this.grpcClient.project.listProjects({
          page,
          limit,
          search: query.search ? this.grpcClient.wrapStringValue(query.search) : undefined,
          businessId: query.businessId ? this.grpcClient.wrapStringValue(query.businessId) : undefined,
          owner: emailFilter,
          collaborators: emailFilter,
        }, metadata),
      );
      return {
        data: result.data?.map((item: any) => this.mapToDto(item)) || [],
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private mapToDto(data: any): ProjectResponseDto {
    return {
      id: data.id,
      projectCode: data.projectCode,
      projectName: data.projectName,
      businessId: data.businessId,
      businessName: data.businessName,
      description: data.description || undefined,
      config: data.config || undefined,
      owner: data.owner || undefined,
      collaborators: data.collaborators || [],
      createdAt: this.normalizeTimestamp(data.createdAt),
      updatedAt: this.normalizeTimestamp(data.updatedAt),
    };
  }

  private handleGrpcError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    if (error.code === 7) {
      throw new ForbiddenException(error.details || error.message || '无权限操作该项目');
    }
    if (error.code === 16) {
      throw new UnauthorizedException(error.details || error.message || '请提供有效的 Bearer Token');
    }
    throw new HttpException(error.details || error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
