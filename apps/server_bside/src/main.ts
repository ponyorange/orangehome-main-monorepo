import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // 启用版本控制
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除未定义的属性
      forbidNonWhitelisted: true, // 如果有未定义的属性则报错
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('OrangeHome BFF API')
    .setDescription('OrangeHome BFF 服务接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '用户认证')
    .addTag('projects', '项目管理')
    .addTag('pages', '页面管理')
    .addTag('page-versions', '页面版本管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
