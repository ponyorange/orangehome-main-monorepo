import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreGrpcClientService } from './core-grpc-client.service';

@Module({
  imports: [ConfigModule],
  providers: [CoreGrpcClientService],
  exports: [CoreGrpcClientService],
})
export class CoreGrpcModule {}
