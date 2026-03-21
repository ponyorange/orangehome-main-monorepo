import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PageVersionModule } from '../page-version/page-version.module';
import { PageService } from './page.service';
import { PageController } from './page.controller';

@Module({
  imports: [AuthModule, PageVersionModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
