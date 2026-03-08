import { Injectable } from '@nestjs/common';
import { CoreService } from '../core-service/core-service.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';

@Injectable()
export class PageVersionService {
  constructor(private coreService: CoreService) {}

  async create(createPageVersionDto: CreatePageVersionDto) {
    return this.coreService.post('/page-version', createPageVersionDto);
  }

  async findAll(pageId: string) {
    return this.coreService.get(`/page-version?pageId=${pageId}`);
  }

  async findOne(id: string) {
    return this.coreService.get(`/page-version/${id}`);
  }

  async publish(id: string) {
    return this.coreService.put(`/page-version/${id}/publish`);
  }

  async rollback(pageId: string, versionId: string) {
    return this.coreService.put(`/page/${pageId}/rollback/${versionId}`);
  }

  async remove(id: string) {
    return this.coreService.delete(`/page-version/${id}`);
  }
}
