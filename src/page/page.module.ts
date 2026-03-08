import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { CoreServiceModule } from '../core-service/core-service.module';

@Module({
  imports: [CoreServiceModule],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}
