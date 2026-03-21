import { Module } from '@nestjs/common';
import { PageModule } from '../page/page.module';
import { PageVersionModule } from '../page-version/page-version.module';
import { ProjectModule } from '../project/project.module';
import { BuilderController } from './builder.controller';
import { BuilderService } from './builder.service';

@Module({
  imports: [ProjectModule, PageModule, PageVersionModule],
  controllers: [BuilderController],
  providers: [BuilderService],
  exports: [BuilderService],
})
export class BuilderModule {}
