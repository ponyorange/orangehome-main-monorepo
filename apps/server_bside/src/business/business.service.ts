import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { BusinessPlatformDto, BusinessResponseDto } from './dto/business.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BusinessService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  private getField<T = any>(data: any, camelKey: string, snakeKey?: string): T | undefined {
    if (!data) return undefined;
    if (data[camelKey] !== undefined) return data[camelKey] as T;
    if (snakeKey && data[snakeKey] !== undefined) return data[snakeKey] as T;
    return undefined;
  }

  async findOne(id: string, authHeader?: string): Promise<BusinessResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(this.grpcClient.business.getBusiness({ id }, metadata));
      return this.mapToDto(result?.data || result);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findAll(query: { page?: number; limit?: number; search?: string; platformId?: string }, authHeader?: string): Promise<{
    data: BusinessResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const metadata = this.grpcClient.createAuthMetadata(authHeader);

      const result = await firstValueFrom(
        this.grpcClient.business.listBusinesses({
          page,
          limit,
          search: query.search ? this.grpcClient.wrapStringValue(query.search) : undefined,
          platformId: query.platformId ? this.grpcClient.wrapStringValue(query.platformId) : undefined,
        }, metadata),
      );

      const list =
        result?.data ||
        result?.items ||
        result?.businesses ||
        result?.records ||
        [];

      return {
        data: list.map((item: any) => this.mapToDto(item)),
        total: result?.total ?? result?.count ?? list.length,
        page: result?.page ?? page,
        limit: result?.limit ?? limit,
      };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private mapPlatformToDto(data: any): BusinessPlatformDto {
    return {
      platformId: this.getField(data, 'platformId', 'platform_id') || '',
      platformCode: this.getField(data, 'platformCode', 'platform_code') || '',
      platformName: this.getField(data, 'platformName', 'platform_name') || '',
    };
  }

  private mapToDto(data: any): BusinessResponseDto {
    const platforms = this.getField<any[]>(data, 'platforms') || [];

    return {
      id: this.getField(data, 'id') || '',
      businessCode: this.getField(data, 'businessCode', 'business_code') || '',
      businessName: this.getField(data, 'businessName', 'business_name') || '',
      description: this.getField(data, 'description') || undefined,
      owner: this.getField(data, 'owner') || undefined,
      platforms: platforms.map((item: any) => this.mapPlatformToDto(item)),
      config: this.getField(data, 'config') || undefined,
      createdAt: this.getField(data, 'createdAt', 'created_at') || new Date(0),
      updatedAt: this.getField(data, 'updatedAt', 'updated_at') || new Date(0),
    };
  }

  private handleGrpcError(error: any): never {
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    if (error.code === 16) {
      throw new UnauthorizedException(error.details || error.message || '请提供有效的 Bearer Token');
    }
    throw new HttpException(error.details || error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
