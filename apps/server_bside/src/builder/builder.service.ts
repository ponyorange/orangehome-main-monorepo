import { Injectable } from '@nestjs/common';
import { PageService } from '../page/page.service';
import { PageVersionService } from '../page-version/page-version.service';
import { ProjectService } from '../project/project.service';
import { BuilderInitResponseDto } from './dto/builder.dto';

@Injectable()
export class BuilderService {
  constructor(
    private readonly pageService: PageService,
    private readonly projectService: ProjectService,
    private readonly pageVersionService: PageVersionService,
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
}
