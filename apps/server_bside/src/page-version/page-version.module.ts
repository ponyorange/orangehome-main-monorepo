import { Module } from '@nestjs/common';
import { PageVersionService } from './page-version.service';
import { PageVersionController } from './page-version.controller';

@Module({
  controllers: [PageVersionController],
  providers: [PageVersionService],
  exports: [PageVersionService],
})
export class PageVersionModule {}
