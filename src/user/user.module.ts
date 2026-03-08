import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CoreServiceModule } from '../core-service/core-service.module';

@Module({
  imports: [CoreServiceModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
