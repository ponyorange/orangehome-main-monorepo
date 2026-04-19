import { Module } from '@nestjs/common';
import { CoreGrpcModule } from '../core-grpc/core-grpc.module';
import { RuntimeController } from './runtime.controller';
import { RuntimeSsrController } from './runtime-ssr.controller';
import { RuntimeSsrService } from './runtime-ssr.service';
import { RuntimeService } from './runtime.service';

@Module({
  imports: [CoreGrpcModule],
  controllers: [RuntimeController, RuntimeSsrController],
  providers: [RuntimeService, RuntimeSsrService],
})
export class RuntimeModule {}
