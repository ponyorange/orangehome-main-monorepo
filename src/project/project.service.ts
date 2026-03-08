import { Injectable } from '@nestjs/common';
import { CoreService } from '../core-service/core-service.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private coreService: CoreService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.coreService.post('/project', createProjectDto);
  }

  async findAll(userId: string) {
    return this.coreService.get(`/project?userId=${userId}`);
  }

  async findOne(id: string) {
    return this.coreService.get(`/project/${id}`);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.coreService.put(`/project/${id}`, updateProjectDto);
  }

  async remove(id: string) {
    return this.coreService.delete(`/project/${id}`);
  }
}
