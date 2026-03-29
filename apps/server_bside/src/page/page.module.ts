import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectModule } from '../project/project.module';
import { PageVersionModule } from '../page-version/page-version.module';
import { PageService } from './page.service';
import { PageController } from './page.controller';

@Module({
  imports: [AuthModule, ProjectModule, PageVersionModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
