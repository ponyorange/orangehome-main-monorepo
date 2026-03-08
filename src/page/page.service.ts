import { Injectable } from '@nestjs/common';
import { CoreService } from '../core-service/core-service.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PageService {
  constructor(private coreService: CoreService) {}

  async create(createPageDto: CreatePageDto) {
    return this.coreService.post('/page', createPageDto);
  }

  async findAll(projectId: string) {
    return this.coreService.get(`/page?projectId=${projectId}`);
  }

  async findOne(id: string) {
    return this.coreService.get(`/page/${id}`);
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    return this.coreService.put(`/page/${id}`, updatePageDto);
  }

  async remove(id: string) {
    return this.coreService.delete(`/page/${id}`);
  }
}
