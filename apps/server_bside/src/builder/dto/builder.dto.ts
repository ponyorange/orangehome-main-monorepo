import { PageResponseDto } from '../../page/dto/page.dto';
import { PageVersionResponseDto } from '../../page-version/dto/page-version.dto';
import { ProjectResponseDto } from '../../project/dto/project.dto';

export class BuilderInitResponseDto {
  project: ProjectResponseDto;
  page: PageResponseDto;
  pageVersion: PageVersionResponseDto;
}
