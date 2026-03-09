# OrangeHome Server BSide

OrangeHome B端服务 (BFF)，负责对接前端和 core-service。

## 技术栈

- NestJS 10
- gRPC (对接 core-service)
- HTTP (对接 user-service)
- Swagger (API 文档)
- class-validator (参数验证)

## 环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置 core-service 地址
```

## 安装依赖

```bash
pnpm install
```

## 启动服务

```bash
# 开发模式
pnpm start:dev

# 生产模式
pnpm build
pnpm start:prod
```

服务启动后访问：
- **服务地址**: http://localhost:4000
- **API 文档**: http://localhost:4000/api-docs
- **健康检查**: http://localhost:4000/health

## API 接口

### 用户认证

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/auth/send-email-code` | 发送邮箱验证码 | 否 |
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| POST | `/api/auth/reset-password` | 重置密码 | 否 |
| POST | `/api/auth/logout` | 登出 | 是 |
| GET | `/api/auth/me` | 获取当前用户 | 是 |

### 项目管理

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/projects` | 项目列表 | 是 |
| POST | `/api/projects` | 新建项目 | 是 |
| GET | `/api/projects/:id` | 获取项目详情 | 是 |
| PUT | `/api/projects/:id` | 修改项目信息 | 是 |
| DELETE | `/api/projects/:id` | 删除项目 | 是 |

### 页面管理

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/pages` | 页面列表 | 是 |
| POST | `/api/pages` | 新建页面 | 是 |
| GET | `/api/pages/:id` | 获取页面详情 | 是 |
| PUT | `/api/pages/:id` | 修改页面信息 | 是 |
| DELETE | `/api/pages/:id` | 删除页面 | 是 |

### 页面版本管理

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/page-versions/save` | 保存页面内容 | 是 |
| POST | `/api/page-versions/:id/publish` | 发布页面版本 | 是 |
| POST | `/api/page-versions/:id/rollback` | 回滚版本 | 是 |
| DELETE | `/api/page-versions/:id` | 删除版本 | 是 |
| GET | `/api/page-versions/:id` | 获取版本详情 | 是 |
| GET | `/api/page-versions` | 版本列表 | 是 |

## 认证说明

除了用户认证相关的接口（注册、登录、重置密码）外，其他接口都需要在请求头中携带 Bearer Token：

```http
Authorization: Bearer <access_token>
```

access_token 通过登录接口获取。

## 目录结构

```
src/
├── auth/                    # 用户认证模块
│   ├── auth.controller.ts   # 认证控制器
│   ├── auth.service.ts      # 认证服务
│   └── dto/                 # 数据传输对象
├── project/                 # 项目管理模块
│   ├── project.controller.ts
│   ├── project.service.ts
│   └── dto/
├── page/                    # 页面管理模块
│   ├── page.controller.ts
│   ├── page.service.ts
│   └── dto/
├── page-version/            # 页面版本管理模块
│   ├── page-version.controller.ts
│   ├── page-version.service.ts
│   └── dto/
├── config/                 # 配置模块
│   └── grpc-client.service.ts  # gRPC 客户端
├── common/                  # 公共模块
│   ├── guards/              # 守卫
│   ├── interceptors/        # 拦截器
│   ├── filters/             # 过滤器
│   ├── pipes/               # 管道
│   └── decorators/          # 装饰器
├── app.module.ts
└── main.ts
```

## 开发注意事项

1. 所有接口参数都通过 `class-validator` 进行验证
2. 错误信息统一返回，包含详细的错误描述
3. Swagger 文档自动生成，确保添加适当的装饰器
4. gRPC 调用已封装，使用时注入 `GrpcClientService`
