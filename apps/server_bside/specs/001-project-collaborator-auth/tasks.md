---
description: "Task list for 001-project-collaborator-auth (project collaborator authorization)"
---

# Tasks: 项目协作者鉴权

**Input**: Design documents from `/specs/001-project-collaborator-auth/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 规范未强制 TDD；本清单 **不包含** 自动化测试任务。验证以 `quickstart.md` 为准。

**Organization**: 按用户故事 P1→P3 分阶段；共享基础在 Phase 2 完成后再开发各故事。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 仅用户故事阶段使用 `[US1]` / `[US2]` / `[US3]`
- 路径相对于 monorepo 根目录，显式写出 `apps/server_bside/`

## Path Conventions

本特性代码在 **`apps/server_bside/src/`**（Nest BFF），契约参考 **`apps/server_bside/proto/core.proto`**。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 对齐契约与现有代码入口，避免实现偏离 proto / 计划。

- [x] T001 阅读 `apps/server_bside/specs/001-project-collaborator-auth/contracts/grpc-and-http-behavior.md` 与 `apps/server_bside/proto/core.proto` 中 `ListProjectsRequest`（`owner` / `collaborators` 同时传入时的「或」语义），记录与 Core 联调时的验证要点

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共用的成员判定与错误映射。

**⚠️ CRITICAL**: 未完成本阶段前不要开始 US1/US2/US3 的业务改造。

- [x] T002 新增 `apps/server_bside/src/project/project-membership.service.ts`：实现 `isMember(userEmail: string, project: { owner?: string; collaborators?: string[] })`、`requireProjectMember(...)`（非成员抛 `ForbiddenException` 与明确文案）、`getCallerEmail(authHeader?: string)`（内部使用 `AuthService.getCurrentUser`，无 Token 抛 `UnauthorizedException`）
- [x] T003 在 `apps/server_bside/src/project/project.module.ts` 中注册 `ProjectMembershipService`，`imports` 加入 `AuthModule`，并在 `exports` 中导出 `ProjectMembershipService` 供 `PageModule` / `PageVersionModule` 使用
- [x] T004 [P] 在 `apps/server_bside/src/project/project.service.ts` 的 `handleGrpcError` 中将 gRPC 状态码 **7**（`PERMISSION_DENIED`）映射为 `ForbiddenException`（与 `research.md` 一致）
- [x] T005 [P] 在 `apps/server_bside/src/page/page.service.ts` 的 `handleGrpcError` 中同样映射状态码 **7** → `ForbiddenException`
- [x] T006 [P] 在 `apps/server_bside/src/page-version/page-version.service.ts` 的 `handleGrpcError` 中同样映射状态码 **7** → `ForbiddenException`

**Checkpoint**: 可注入 `ProjectMembershipService`；gRPC 权限拒绝在 BFF 统一表现为 403。

---

## Phase 3: User Story 1 — 仅列出有权限的项目 (Priority: P1) 🎯 MVP

**Goal**: `GET /projects` 仅返回当前用户为 owner 或 collaborator 的项目（spec FR-001）。

**Independent Test**: 按 `quickstart.md` 第 1 节，用户 A 只见 P1/P2、不见 P3。

### Implementation for User Story 1

- [x] T007 [US1] 在 `apps/server_bside/src/project/project.service.ts` 的 `findAll` 中：通过 `ProjectMembershipService.getCallerEmail` 取得邮箱；调用 gRPC `listProjects` 时将 **同一邮箱** 同时填入 `owner` 与 `collaborators` 字段（使用现有 `grpcClient.wrapStringValue`）；无 Token 时不得静默以空过滤
- [x] T008 [US1] 在 `apps/server_bside/src/project/project.module.ts` 中确保 `ProjectService` 可注入 `ProjectMembershipService`（若需在 `ProjectService` 构造函数注入，在本任务或 T007 同一提交内完成）

**Checkpoint**: US1 可独立联调通过。

---

## Phase 4: User Story 2 — 项目管理操作需成员身份 (Priority: P2)

**Goal**: `GET/PUT/DELETE /projects/:id` 等对 **已有项目** 的管理接口在非成员时返回无权限且不产生授权范围内的写副作用（spec FR-002）。

**Independent Test**: `quickstart.md` 第 2 节。

### Implementation for User Story 2

- [x] T009 [US2] 在 `apps/server_bside/src/project/project.service.ts` 的 `findOne` 中：gRPC `getProject` 成功后对返回的 `owner`/`collaborators` 调用 `requireProjectMember`
- [x] T010 [US2] 在同一文件的 `update`、`delete` 中：在发起 **写操作 RPC 之前** 先 `getProject` + `requireProjectMember`（避免非成员触发更新/删除）
- [x] T011 [US2] 在同一文件的 `create` 中：按 `research.md` 将 **`owner` 默认为当前用户邮箱**（若 DTO 未传或与 token 用户不一致则覆盖/拒绝，选一种与产品一致的安全策略并在实现中保持一致）

**Checkpoint**: US2 可与 US1 叠加验证。

---

## Phase 5: User Story 3 — 页面管理操作需成员身份 (Priority: P3)

**Goal**: 页面与页面版本相关 HTTP 接口在操作前校验 **页面所属项目** 的成员关系；非成员 403（spec FR-003）。**禁止** `PageVersionService` 依赖 `PageService` 造成循环依赖——通过 `GrpcClientService` 拉取 `getPage` / `getProject` 解析 `project_id`（见 `plan.md`）。

**Independent Test**: `quickstart.md` 第 3～4 节；builder 第 6 节回归。

### Implementation for User Story 3

- [x] T012 [US3] 在 `apps/server_bside/src/page/page.module.ts` 中 `imports` 加入 `ProjectModule`（以使用已导出的 `ProjectMembershipService`）
- [x] T013 [US3] 在 `apps/server_bside/src/page/page.service.ts` 中注入 `ProjectMembershipService`：`create` / `findByProject` 对请求中的 `projectId` 先 `getProject` + `requireMember`；`findOne` / `update` / `delete` 先 `getPage` 再对 `projectId` 取 `getProject` + `requireMember`
- [x] T014 [US3] 在 `apps/server_bside/src/page-version/page-version.module.ts` 中 `imports` 加入 `ProjectModule`
- [x] T015 [US3] 在 `apps/server_bside/src/page-version/page-version.service.ts` 中注入 `ProjectMembershipService`：为 `saveContent`、`publish`、`delete`、`findOne`、`findByPage`/`findLatestByPage`、`rollback` 等入口解析 `pageId`（请求体、路由参数或 `getPageVersion` 返回中的 `page_id`），用 `GrpcClientService.page.getPage` 取 `projectId`，再 `getProject` + `requireProjectMember` 后再执行原 RPC

**Checkpoint**: US3 完成后 builder 间接路径应自动受保护（`plan.md` 依赖底层 service）。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 文档、手测与已知技术债清理。

- [x] T016 [P] 更新 `apps/server_bside/docs/API.md`：为 projects / pages / page-versions 相关路由补充 **403 无权限** 说明（与 `contracts/grpc-and-http-behavior.md` 一致）
- [x] T017 按 `apps/server_bside/specs/001-project-collaborator-auth/quickstart.md` 全量执行一遍手测，记录与 Core 过滤语义不符时的处理结论（若需修 Core，单开任务或备注）
- [x] T018 [P] 在 `apps/server_bside/src/page-version/page-version.controller.ts` 的 `rollback` 接口：用 `AuthService.getCurrentUser` 替换硬编码 `default-user`，与其他接口一致传入真实 `userId`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3–5（按 P1→P3 顺序）** → **Phase 6**
- **Phase 3 (US1)** 仅依赖 Phase 2
- **Phase 4 (US2)** 依赖 Phase 2；与 US1 同属 `project.service.ts` 时建议 **在 T007 之后** 串行修改同一文件以减少冲突
- **Phase 5 (US3)** 依赖 Phase 2；与 US1/US2 无逻辑依赖，但建议在 US1/US2 稳定后再合入以降低 `project.service` 冲突

### User Story Dependencies

- **US1**：仅依赖 Foundation
- **US2**：依赖 Foundation；实现顺序上建议接在 US1 之后（共享 `project.service.ts`）
- **US3**：依赖 Foundation；可与 US2 并行由不同开发者负责 **不同文件**（`page*` vs `project*`），但需注意合并顺序

### Within Each User Story

- **US1**：T007–T008 同服务文件，串行
- **US2**：T009 → T010 → T011 串行
- **US3**：T012 → T013；T014 → T015（`page` 与 `page-version` 两条线可并行）

### Parallel Opportunities

- **T004、T005、T006** 可并行（不同文件的 `handleGrpcError`）
- **T016 与 T018** 可并行（`docs/API.md` 与 `page-version.controller.ts`）
- **US3 中** T012–T013（page）与 T014–T015（page-version）可由两人并行

---

## Parallel Example: User Story 3

```bash
# 开发者 A：页面路由
# Task: T012 page.module.ts imports
# Task: T013 page.service.ts 成员校验

# 开发者 B：页面版本（避免 PageVersionService → PageService 循环）
# Task: T014 page-version.module.ts imports
# Task: T015 page-version.service.ts GrpcClient getPage/getProject + requireProjectMember
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. 完成 Phase 1–2  
2. 完成 Phase 3（T007–T008）  
3. **STOP**：按 `quickstart.md` 第 1 节验收  

### Incremental Delivery

1. Foundation → US1（列表）  
2. +US2（项目读写鉴权）  
3. +US3（页面与版本鉴权）  
4. Phase 6 文档与 rollback 修复  

### Suggested MVP Scope

- **仅 User Story 1（P1）** 作为最小可演示增量；US2/US3 依次叠加至与 spec 一致。

---

## Task Summary

| 指标 | 数量 |
|------|------|
| **总任务数** | 18 |
| **US1** | 2（T007–T008） |
| **US2** | 3（T009–T011） |
| **US3** | 4（T012–T015） |
| **Setup + Foundation + Polish** | 9（T001–T006, T016–T018） |
| **标记 [P] 可并行** | T004, T005, T006, T016, T018 |

**格式校验**: 任务行格式为 `- [x] Tnnn ...`（已全部勾选）且含 **明确文件路径**；用户故事任务均含 **`[USn]`** 标签。
