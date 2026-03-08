import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CoreServiceModule } from '../core-service/core-service.module';

@Module({
  imports: [CoreServiceModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
