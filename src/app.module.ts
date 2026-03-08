import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreServiceModule } from './core-service/core-service.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { PageModule } from './page/page.module';
import { PageVersionModule } from './page-version/page-version.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreServiceModule,
    UserModule,
    ProjectModule,
    PageModule,
    PageVersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
