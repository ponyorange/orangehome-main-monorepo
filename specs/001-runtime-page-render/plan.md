# Implementation Plan: 运行时页面 HTML 渲染（按类型与页面 ID）

**Branch**: `001-runtime-page-render` | **Date**: 2025-03-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-runtime-page-render/spec.md`

**Note**: 本计划由 `/speckit.plan` 生成；模板在 monorepo 根目录未安装时由本文件直接落盘。

## Summary

为 C 端提供 **GET `/orangehome/runtime/:type/:pageid`**，按 `release` / `preview` / `dev` 解析页面版本与物料脚本 URL，嵌入 `ORANGEHOME_DATA` JSON，使用 **EJS** 输出完整 HTML。数据通过 **gRPC** 调用 **OrangeHome core-service**（`PageService`、`PageVersionService`、`MaterialService`、`MaterialVersionService`）。服务端使用 **服务账号 JWT**（metadata `authorization: Bearer …`）访问 core，浏览器请求可匿名。`release` 响应可 CDN 缓存；`preview`/`dev` 禁用共享缓存。

## Technical Context

**Language/Version**: TypeScript ~5.3、Node.js 20+（与 `apps/server_cside` 一致）  
**Primary Dependencies**: NestJS 10、`@nestjs/microservices` + `@grpc/grpc-js`、`@grpc/proto-loader`（或等价代码生成）、`ejs`、（可选）`@nestjs/terminus` 已有则沿用  
**Storage**: 无本地持久化；数据来自 core-service（MongoDB/MinIO 对其内部）  
**Testing**: Jest（`@nestjs/testing`）+ 对 gRPC 客户端的 mock；关键路径集成测试需可指向 core 桩或 testcontainer（后续 tasks 定）  
**Target Platform**: Linux/容器内 Node 服务（与现有 `nest start` / `node dist/main` 一致）  
**Project Type**: monorepo 内 `apps/server_cside` HTTP 服务  
**Performance Goals**: 与 spec SC-001 对齐——合法 `release` 请求在标称负载下 **95% 成功响应 ≤ 3s**（端到端）；本计划补充 **p95 ≤ 2.5s**（同机房的 core 可用前提，否则以监控为准）  
**Constraints**: 热路径避免额外同步磁盘 IO；gRPC 调用可并行（页面版本解析与物料批量拉取顺序见 research）；对外错误不泄露堆栈  
**Scale/Scope**: 单接口 + gRPC 集成；页面 schema 递归解析深度合理上限（如 ≤ 200 节点）需在实现中防栈溢出  

## Constitution Check

*GATE: Phase 0 前必须通过；Phase 1 设计后复验。*

- [x] **Nest 边界**：新建 `RuntimeModule`（或 `OrangehomeModule`）含 `RuntimeController`、`RuntimeService`、`CoreGrpcModule`（或 `CoreClientModule`）封装 gRPC；禁止在控制器内直接 new Client。
- [x] **SSG / 缓存**：本特性为 **按请求动态 HTML**（与全站 SSG 并存）。**豁免理由**：spec 明确要求运行时渲染与 preview/dev；**缓解**：`release` 使用 `Cache-Control: public, max-age=60, stale-while-revalidate=300`（数值可配置）；`preview`/`dev` 使用 `Cache-Control: private, no-store`。URL 含 `type`/`pageid`，稳定可缓存 release。
- [x] **C 端安全与错误面**：全局异常过滤器将 gRPC 错误映射为 400/404/502 等；响应体无堆栈；`type`/`pageid` 经管道校验（含非法 Mongo ObjectId 的 pageid 返回 400）。
- [x] **性能指标**：已绑定 SC-001 与上文 p95；实现阶段对 gRPC 批量与并行在 `research.md` 落地。
- [x] **可观测性**：结构化日志字段 `route`、`type`、`pageId`、`durationMs`、可选 `correlationId`；健康检查保持或扩展 Terminus（若未装则在 tasks 增加轻量 `/health`）。
- [x] **技术栈变更**：新增 `ejs`、gRPC 客户端栈为 **必要依赖**；在 Complexity Tracking 说明。

**Phase 1 复验**：同上，无新增违反项。

## Project Structure

### Documentation (this feature)

```text
specs/001-runtime-page-render/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── runtime-http.md
│   └── core-grpc.md
├── spec.md
├── reference/
│   └── runtime-page.ejs
└── tasks.md              # /speckit.tasks
```

### Source Code (`apps/server_cside`)

```text
apps/server_cside/
├── proto/
│   └── core.proto        # 从 core-service 仓库复制或构建时同步；勿手写分叉
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── runtime/
│   │   ├── runtime.module.ts
│   │   ├── runtime.controller.ts
│   │   ├── runtime.service.ts
│   │   ├── schema-material.util.ts    # 递归收集 materialUid
│   │   └── dto/
│   │       └── runtime-params.dto.ts
│   ├── core-grpc/
│   │   ├── core-grpc.module.ts
│   │   ├── core-grpc.constants.ts
│   │   └── core-grpc-client.service.ts
│   └── common/
│       ├── filters/
│       └── pipes/
└── test/
    └── runtime.service.spec.ts
```

**Structure Decision**：单 Nest 应用内按特性分模块；gRPC 封装隔离在 `core-grpc`，便于 mock 与复用。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 动态 HTML 非 SSG | spec 要求运行时按 type 拉最新页/物料并出 HTML | 纯静态构建无法覆盖 preview/dev 与「最新配置版本」 |
| 每请求多次 gRPC | core 协议按服务拆分；批量物料已有 `GetMaterialsWithLatestVersion` | 单次 RPC 无合并接口；dev 轨道需额外 `ListMaterialVersions` |

## Phase 0 输出

见 [research.md](./research.md)（已与本计划同时生成）。

## Phase 1 输出

- [data-model.md](./data-model.md)：运行时领域对象与校验。  
- [contracts/runtime-http.md](./contracts/runtime-http.md)：对外 HTTP 约定。  
- [contracts/core-grpc.md](./contracts/core-grpc.md)：调用的 gRPC 方法与参数约定。  
- [quickstart.md](./quickstart.md)：本地联调步骤。  
- Agent context：执行 `apps/server_cside/.specify/scripts/bash/update-agent-context.sh cursor-agent`（若 monorepo 根缺少 `.cursor/rules` 等文件，脚本可能跳过或创建，以脚本输出为准）。
