---
description: "Task list for 001-runtime-page-render — runtime HTML + core gRPC"
---

# Tasks: 运行时页面 HTML 渲染（按类型与页面 ID）

**Input**: `D:/ai_coding/orangehome/main-monorepo/specs/001-runtime-page-render/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md、spec.md 已就绪

**Tests**：规格未强制 TDD；Polish 阶段包含可选单元测试任务。

**Organization**：按用户故事 P1→P2→P3 分阶段，便于独立验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：US1 / US2 / US3 映射 spec 用户故事

## Path Conventions

- 应用根目录：`apps/server_cside/`
- 规格目录：`specs/001-runtime-page-render/`

---

## Phase 1: Setup（共享基础）

**Purpose**：proto、依赖、环境变量骨架

- [x] T001 将 `core-service` 仓库的 `proto/core.proto` 复制到 `apps/server_cside/proto/core.proto`（或与 CI 约定同步方式，禁止手写分叉 proto）
- [x] T002 在 `apps/server_cside/package.json` 增加依赖：`@nestjs/microservices`、`@grpc/grpc-js`、`@grpc/proto-loader`、`ejs`，以及 dev 依赖 `@types/ejs`（版本与 Nest 10 兼容）
- [x] T003 [P] 在 `apps/server_cside/src/config/runtime.config.ts`（或等价）定义 `CORE_SERVICE_GRPC_URL`、`CORE_SERVICE_GRPC_JWT`、`RUNTIME_SITE_NAME` 的读取与启动期校验（缺失时 fail-fast 或按团队约定降级）

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**：gRPC 客户端封装、校验、模板与工具 — 完成前不得开始业务垂直切片

**⚠️ CRITICAL**：未完成本阶段前不得合并 US1/US2/US3 行为

- [x] T004 新增 `apps/server_cside/src/core-grpc/core-grpc.constants.ts`（gRPC Client 注入 token / 包名常量）
- [x] T005 实现 `apps/server_cside/src/core-grpc/core-grpc-client.service.ts`：封装对 `PageService.GetPage`、`PageVersionService.ListPageVersions`、`MaterialService.GetMaterialsWithLatestVersion`、`MaterialVersionService.ListMaterialVersions` 的调用，并在 metadata 注入 `authorization: Bearer <JWT>`
- [x] T006 新增 `apps/server_cside/src/core-grpc/core-grpc.module.ts`：使用 `ClientsModule.registerAsync`（或等价）注册 `orangehome.core`、protoPath 指向 `apps/server_cside/proto/core.proto`
- [x] T007 [P] 新增 `apps/server_cside/src/common/filters/grpc-exception.filter.ts`（或扩展现有过滤器）：将 gRPC 状态映射为 HTTP 400/404/502/504，响应体不含堆栈
- [x] T008 [P] 新增 `apps/server_cside/src/runtime/dto/runtime-params.dto.ts` 与校验：`type` 仅允许 `release|preview|dev`；`pageid` 为 24 位十六进制 ObjectId，否则 400
- [x] T009 将 `specs/001-runtime-page-render/reference/runtime-page.ejs` 拷贝为 `apps/server_cside/src/runtime/views/runtime-page.ejs`（后续实现仅调整变量名若需与 EJS 调用一致）
- [x] T010 实现 `apps/server_cside/src/runtime/schema-material.util.ts`：对 schema 对象深度优先遍历，收集键名严格为 `materialUid` 的非空字符串，去重并保持稳定顺序
- [x] T011 在 `apps/server_cside/src/app.module.ts` 注册 `ConfigModule`（若新增）、`CoreGrpcModule`、全局 `GrpcExceptionFilter`（或挂载于 Runtime 模块范围）；`apps/server_cside/src/main.ts` 如需全局前缀则与 `contracts/runtime-http.md` 路径一致

**Checkpoint**：gRPC 可连、过滤器与 DTO 就绪、工具函数可单测

---

## Phase 3: User Story 1 — 线上 release（Priority: P1）🎯 MVP

**Goal**：`GET /orangehome/runtime/release/:pageid` 返回完整 HTML，schema 为**已发布**版本，`componentsAmdMap` 为**已发布物料**（`version_status=2`），`Cache-Control` 与 plan 中 release 策略一致

**Independent Test**：对已知已发布页面 ID 执行 quickstart 中的 curl；响应 `text/html`，`#ORANGEHOME_DATA` 内 JSON 可解析，含 `schema` 与 `componentsAmdMap`，每个 UID 有对应 `defer` 脚本

### Implementation for User Story 1

- [x] T012 [US1] 在 `apps/server_cside/src/runtime/runtime.service.ts` 实现 release 页面解析：`GetPage` 取 `published_version_id`；若无则抛/转 404；否则分页调用 `ListPageVersions` 直至找到匹配 `version_id` 的记录（见 `research.md` R1），解析 `page_schema_json` 为对象
- [x] T013 [US1] 在同一 `runtime.service.ts` 中：对解析后 schema 调用 `collectMaterialUids`；调用 `GetMaterialsWithLatestVersion(material_uids, version_status=2)`；校验每个 UID 的 `file_url` 非空，构建 `componentsAmdMap`；任一缺失则整页失败（502/404 按 data-model）
- [x] T014 [US1] 在同一文件中：使用 `ejs.renderFile` 渲染 `views/runtime-page.ejs`，传入 `lang`（查询参数优先，默认 `zh-CN`）、`pageTitle`（来自 Page 或默认）、`siteName`（配置）、`pageSchema`、`componentsAmdMap`、`pageScripts` 空字符串；对 **release** 响应设置 `Cache-Control: public, max-age=60, stale-while-revalidate=300`（可配置化）
- [x] T015 [US1] 新增 `apps/server_cside/src/runtime/runtime.controller.ts`：`@Get('orangehome/runtime/:type/:pageid')`（若全局已有前缀则调整路径），仅当 `type==='release'` 时走完整实现；`preview`/`dev` 可暂时返回 **501** 或明确 `NotImplementedException` 直至后续阶段（避免误测）
- [x] T016 [US1] 新增 `apps/server_cside/src/runtime/runtime.module.ts` 导入 `CoreGrpcModule`，注册 controller/service；在 `app.module.ts` 导入 `RuntimeModule`

**Checkpoint**：US1 可独立演示；preview/dev 显式未实现或 501

---

## Phase 4: User Story 2 — preview（Priority: P2）

**Goal**：`preview` 使用 **ListPageVersions(page=1, limit=1)** 取最新 tip schema；物料仍为 **已发布**；`Cache-Control: private, no-store`

**Independent Test**：存在新于已发布版本的草稿时，preview 的 schema 与 release 不同且更新；物料 URL 与 release 同为已发布轨道

### Implementation for User Story 2

- [x] T017 [US2] 在 `apps/server_cside/src/runtime/runtime.service.ts` 增加 `preview` 分支：页面数据来自 `ListPageVersions` 首条；物料逻辑复用 `GetMaterialsWithLatestVersion` + `version_status=2`；响应头 `Cache-Control: private, no-store`
- [x] T018 [US2] 更新 `apps/server_cside/src/runtime/runtime.controller.ts`：对 `type==='preview'` 调用上述分支，移除 501

**Checkpoint**：US1 + US2 可分别独立验证

---

## Phase 5: User Story 3 — dev（Priority: P3）

**Goal**：页面 schema 同 preview（最新 tip）；物料为 **全局最新**（`ListMaterialVersions` 不传 status，`limit=1`），见 `research.md` R2

**Independent Test**：存在未发布物料版本时，dev 下某 UID 的 URL 与 preview/release 可不同

### Implementation for User Story 3

- [x] T019 [US3] 在 `apps/server_cside/src/runtime/runtime.service.ts` 实现 dev 物料解析：先 `GetMaterialsWithLatestVersion(..., 2)` 获取 `material.id` 映射；再对每个 id 并行 `ListMaterialVersions(material_id, page=1, limit=1)` 且省略 status；取 `file_url` 填入 `componentsAmdMap`；处理仅未发布物料场景（无 published 版本时 material 是否仍返回见 core 行为，按 research 补全边界）
- [x] T020 [US3] 为 `dev` 设置 `Cache-Control: private, no-store`；更新 `runtime.controller.ts` 支持 `type==='dev'`

**Checkpoint**：三种 type 行为与 spec SC-004 可对齐验证

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**：测试、可观测性、文档

- [x] T021 [P] 新增 `apps/server_cside/test/runtime.service.spec.ts`（或 `src/runtime/runtime.service.spec.ts`）：mock `CoreGrpcClientService`，覆盖 release 成功、无发布版本 404、物料缺 URL 失败
- [x] T022 [P] 新增 `apps/server_cside/test/schema-material.util.spec.ts`：嵌套 schema、重复 UID、空 schema
- [x] T023 在 `runtime.service.ts` 或 HTTP 拦截器记录结构化日志：`type`、`pageId`、`durationMs`（可选 `x-request-id` 若入口已设置）
- [x] T024 若项目尚无健康检查：在 `apps/server_cside/src` 增加 `GET /health`（或沿用 Terminus），与宪章 V 一致
- [x] T025 根据 `specs/001-runtime-page-render/quickstart.md` 走通一遍联调，更新 `apps/server_cside/README.md`（若不存在则仅将验证步骤记在 quickstart，不强制新建 README）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- US2 依赖 US1 的 controller/service/EJS 管线；US3 依赖 US2 的页面 tip 解析（可复用函数）

### User Story Dependencies

- **US1**：仅依赖 Phase 2
- **US2**：依赖 US1 的渲染与物料（发布轨道）能力
- **US3**：依赖 US2 的页面 tip 解析；扩展物料轨道

### Parallel Opportunities

- T003 与 T001、T002 可并行（不同文件）
- T007、T008 与 T009、T010 在 T004–T006 开始后部分并行（注意 T010 无 gRPC 依赖，可与 T004 并行）
- T021、T022 可并行

---

## Parallel Example: Phase 2（部分）

```bash
# 可同时进行：
Task: "T007 grpc-exception.filter.ts"
Task: "T008 runtime-params.dto.ts"
Task: "T010 schema-material.util.ts"
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1–2  
2. 完成 Phase 3（US1）  
3. **STOP**：按 quickstart 验证 release  
4. 再交付 US2、US3

### Incremental Delivery

1. US1 → 生产可发「仅 release」  
2. US2 → 开放 preview  
3. US3 → 开放 dev  

---

## Notes

- 任务描述中的路径相对于 monorepo 根：`D:/ai_coding/orangehome/main-monorepo/`  
- gRPC 消息字段名以生成代码为准（camelCase 与 proto snake_case 映射以 `@grpc/proto-loader` 选项为准）  
- 若实现时合并 US2/US3 为同一 service 方法的分支，仍保持本任务顺序以便代码评审与回滚
