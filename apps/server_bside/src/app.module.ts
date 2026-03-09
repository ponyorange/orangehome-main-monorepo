import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GrpcClientService } from './config/grpc-client.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { PageModule } from './page/page.module';
import { PageVersionModule } from './page-version/page-version.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    AuthModule,
    ProjectModule,
    PageModule,
    PageVersionModule,
  ],
  controllers: [AppController],
  providers: [AppService, GrpcClientService],
  exports: [GrpcClientService],
})
export class AppModule {}
