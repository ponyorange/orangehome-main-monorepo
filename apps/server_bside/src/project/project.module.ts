import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectController } from './project.controller';
import { ProjectMembershipService } from './project-membership.service';
import { ProjectService } from './project.service';

@Module({
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectMembershipService],
  exports: [ProjectService, ProjectMembershipService],
})
export class ProjectModule {}
