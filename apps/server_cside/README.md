# @orangehome/server_cside

C 端 NestJS 服务：运行时页面 HTML（对接 core-service gRPC）。

## 环境变量

本地开发：在 `apps/server_cside` 下复制 `.env.example` 为 `.env` 并填写（`ConfigModule` 会自动加载 `.env` / `.env.local`）。

| 变量 | 说明 |
|------|------|
| `CORE_SERVICE_GRPC_URL` | core gRPC 地址，如 `127.0.0.1:50051` |
| `CORE_SERVICE_GRPC_JWT` | 调用 core 的 Bearer token（metadata） |
| `RUNTIME_SITE_NAME` | 可选，默认 `OrangeHome` |
| `RUNTIME_RELEASE_MAX_AGE` | 可选，release `Cache-Control` max-age 秒数，默认 `60` |
| `RUNTIME_RELEASE_SWR` | 可选，`stale-while-revalidate` 秒数，默认 `300` |
| `CORE_SERVICE_GRPC_USE_SSL` | 设为 `true` 时使用 TLS（默认 insecure） |

## 开发与构建（Rush monorepo）

在仓库根目录：

```bash
rush update
rush build --to @orangehome/server_cside
```

在应用目录运行：

```bash
cd apps/server_cside
npx jest
```

启动（需先配置环境变量，在 `apps/server_cside` 下）：

```bash
npm run start:dev
```

默认 HTTP 端口：`4001`。

## 路由

- `GET /health` — 健康检查  
- `GET /orangehome/runtime/:type/:pageid` — `type` 为 `release` | `preview` | `dev`  
- 可选查询参数：`lang`（如 `zh-CN`）

## 规格与计划

见 monorepo 内 `specs/001-runtime-page-render/`（`spec.md`、`plan.md`、`quickstart.md`）。

## Proto

`proto/core.proto` 由 **core-service** 同步复制；请勿手写分叉。更新时从 `core-service/proto/core.proto` 覆盖本文件。
