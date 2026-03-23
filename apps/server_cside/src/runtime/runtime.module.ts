import { Module } from '@nestjs/common';
import { CoreGrpcModule } from '../core-grpc/core-grpc.module';
import { RuntimeController } from './runtime.controller';
import { RuntimeService } from './runtime.service';

@Module({
  imports: [CoreGrpcModule],
  controllers: [RuntimeController],
  providers: [RuntimeService],
})
export class RuntimeModule {}
