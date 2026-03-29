import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectModule } from '../project/project.module';
import { PageVersionController } from './page-version.controller';
import { PageVersionService } from './page-version.service';

@Module({
  imports: [AuthModule, ProjectModule],
  controllers: [PageVersionController],
  providers: [PageVersionService],
  exports: [PageVersionService],
})
export class PageVersionModule {}
