import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// 允许的前端域名列表
const allowedOrigins = [
  'http://localhost:3000',  // web_platform
  'http://localhost:3008',  // web_platform (vite 配置端口)
  'http://localhost:5173', // web_builder (vite 默认端口)
  'http://localhost:8080',  // 其他可能端口
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3008',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

// CORS 中间件 - 确保预检请求正确处理
const corsMiddleware = (req: any, res: any, next: any) => {
  const origin = req.headers.origin;

  // 如果 origin 在允许列表中，或者环境变量允许所有，则返回具体 origin
  if (allowedOrigins.includes(origin) || process.env.CORS_ORIGIN === '*') {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
  } else if (!origin) {
    // 非浏览器请求（如 curl）没有 origin
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization,Referer,User-Agent,sec-ch-ua,sec-ch-ua-platform,sec-ch-ua-mobile,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // 预检请求直接返回成功
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 应用全局 CORS 中间件（最优先）
  app.use(corsMiddleware);

  // CORS 配置 - 必须在其他中间件之前配置
  app.enableCors({
    origin: (origin, callback) => {
      // 如果没有 origin（非浏览器请求）
      if (!origin) {
        return callback(null, true);
      }
      // 如果 origin 在允许列表中
      if (allowedOrigins.includes(origin) || process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }
      // 默认允许开发环境
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Referer', 'User-Agent', 'sec-ch-ua', 'sec-ch-ua-platform', 'sec-ch-ua-mobile', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 预检请求缓存24小时
  });

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

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('OrangeHome BFF API')
    .setDescription('OrangeHome BFF 服务接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '用户认证')
    .addTag('builder', '编辑器初始化')
    .addTag('businesses', '业务线管理')
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
