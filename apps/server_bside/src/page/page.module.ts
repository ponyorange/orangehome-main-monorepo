import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { GrpcClientService } from '../config/grpc-client.service';

@Module({
  controllers: [PageController],
  providers: [PageService, GrpcClientService],
  exports: [PageService],
})
export class PageModule {}
