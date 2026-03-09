import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { GrpcClientService } from '../config/grpc-client.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, GrpcClientService],
  exports: [ProjectService],
})
export class ProjectModule {}
