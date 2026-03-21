import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BuilderModule } from './builder/builder.module';
import { GrpcClientModule } from './config/grpc-client.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
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
    BuilderModule,
    GrpcClientModule,
    AuthModule,
    BusinessModule,
    ProjectModule,
    PageModule,
    PageVersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
