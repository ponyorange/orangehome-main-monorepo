import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import runtimeConfig from './config/runtime.config';
import { CoreGrpcModule } from './core-grpc/core-grpc.module';
import { HealthModule } from './health/health.module';
import { RuntimeModule } from './runtime/runtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [runtimeConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    CoreGrpcModule,
    RuntimeModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
