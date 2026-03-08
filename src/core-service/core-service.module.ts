import { Module } from '@nestjs/common';
import { CoreService } from './core-service.service';

@Module({
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreServiceModule {}
