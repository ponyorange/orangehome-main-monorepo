# Quickstart: 001-runtime-page-render 联调

## 前置

1. **core-service** 已启动，gRPC 监听（默认 `50051`），HTTP 健康检查可用。  
2. 已存在测试用 **页面 ID**、**已发布页面版本**、若干带 `materialUid` 的 schema、对应 **已发布物料** 及 `file_url`。  
3. 准备可调用 core gRPC 的 **Bearer JWT**（与 core README「gRPC metadata」一致）。

## 配置 server_cside

在 `apps/server_cside` 环境或 `.env` 中设置（名称可按实现微调，需在代码中集中读取）：

```bash
CORE_SERVICE_GRPC_URL=127.0.0.1:50051
CORE_SERVICE_GRPC_JWT=<service_access_token>
# 可选
RUNTIME_SITE_NAME=OrangeHome
```

将 `core-service/proto/core.proto` 复制到 `apps/server_cside/proto/core.proto`（或与实现约定路径一致）。

## 安装与启动

```bash
cd apps/server_cside
pnpm install   # 或 npm install，与仓库包管理器一致
pnpm run start:dev
```

默认监听端口以 `main.ts` 为准（当前示例为 `4001`）。

## 验证请求

```bash
curl -sS -D - "http://127.0.0.1:4001/orangehome/runtime/release/<PAGE_ID>" -o /tmp/runtime.html
head -c 500 /tmp/runtime.html
```

检查：

- 响应头 `Content-Type` 含 `text/html`。  
- 正文含 `<script type="application/json" id="ORANGEHOME_DATA">`。  
- `preview` / `dev` 行为与 [research.md](./research.md) 一致。

## 常见问题

- **Unauthenticated**：检查 JWT 是否过期、metadata 是否传入客户端。  
- **404 release**：页面无 `published_version_id` 或版本列表中找不到对应版本。  
- **502 物料**：`file_url` 未填或 MinIO URL 不可达（core 侧数据问题）。
