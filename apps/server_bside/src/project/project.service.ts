import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    try {
      const result = await this.grpcClient.project.createProject({
        projectCode: dto.projectCode,
        projectName: dto.projectName,
        businessId: dto.businessId,
        description: dto.description || '',
        config: dto.config || '',
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    try {
      const result = await this.grpcClient.project.updateProject({
        id,
        ...dto,
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async delete(id: string, permanent: boolean = false): Promise<void> {
    try {
      await this.grpcClient.project.deleteProject({ id, permanent });
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    try {
      const result = await this.grpcClient.project.getProject({ id });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; businessId?: string }): Promise<{
    data: ProjectResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const result = await this.grpcClient.project.listProjects({
        page,
        limit,
        search: query.search || undefined,
        businessId: query.businessId || undefined,
      });

      return {
        data: result.data.map((item: any) => this.mapToDto(item)),
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private handleGrpcError(error: any): never {
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    throw new HttpException(error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
