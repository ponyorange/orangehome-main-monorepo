import { Module } from '@nestjs/common';
import { PageVersionController } from './page-version.controller';
import { PageVersionService } from './page-version.service';
import { CoreServiceModule } from '../core-service/core-service.module';

@Module({
  imports: [CoreServiceModule],
  controllers: [PageVersionController],
  providers: [PageVersionService],
})
export class PageVersionModule {}
