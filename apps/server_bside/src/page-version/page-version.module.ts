import { Module } from '@nestjs/common';
import { PageVersionService } from './page-version.service';
import { PageVersionController } from './page-version.controller';
import { GrpcClientService } from '../config/grpc-client.service';

@Module({
  controllers: [PageVersionController],
  providers: [PageVersionService, GrpcClientService],
  exports: [PageVersionService],
})
export class PageVersionModule {}
