import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { CreatePageDto, UpdatePageDto, PageResponseDto } from './dto/page.dto';

@Injectable()
export class PageService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async create(dto: CreatePageDto): Promise<PageResponseDto> {
    try {
      const result = await this.grpcClient.page.createPage({
        projectId: dto.projectId,
        path: dto.path,
        title: dto.title,
        description: dto.description || '',
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async update(id: string, dto: UpdatePageDto): Promise<PageResponseDto> {
    try {
      const result = await this.grpcClient.page.updatePage({
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
      await this.grpcClient.page.deletePage({ id, permanent });
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(id: string): Promise<PageResponseDto> {
    try {
      const result = await this.grpcClient.page.getPage({ id });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findByProject(projectId: string, query: { page?: number; limit?: number; search?: string }): Promise<{
    data: PageResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const result = await this.grpcClient.page.listPages({
        projectId,
        page,
        limit,
        search: query.search || undefined,
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

  private mapToDto(data: any): PageResponseDto {
    return {
      id: data.id,
      projectId: data.projectId,
      projectName: data.projectName,
      path: data.path,
      title: data.title,
      description: data.description || undefined,
      publishedVersionId: data.publishedVersionId || undefined,
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
