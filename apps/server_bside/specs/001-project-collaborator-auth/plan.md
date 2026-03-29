# Implementation Plan: 项目协作者鉴权

**Branch**: `001-project-collaborator-auth` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-project-collaborator-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

在 **`@orangehome/server_bside`**（NestJS BFF）层，基于当前登录用户身份，约束：

1. **项目列表**：仅返回当前用户为 **owner** 或 **collaborators** 的项目（与 spec FR-001 一致）。
2. **项目管理 / 页面管理（及页面版本等从属能力）**：在执行业务前校验用户对 **目标项目** 的成员关系；非成员返回 **无权限**，且不产生授权范围内的副作用。

技术要点：使用既有 `AuthService.getCurrentUser` 取得用户 **email**（与 `core.proto` 中 `Project.owner` / `Project.collaborators` 的语义对齐）；列表优先通过 gRPC `ListProjectsRequest` 的 `owner` + `collaborators` 过滤字段实现服务端过滤（proto 注释为「或」关系）；单资源操作在 BFF 内 `getProject` / `getPage` 后做成员判定，或先校验 `projectId` 再转发。详见 `research.md` 与 `contracts/grpc-and-http-behavior.md`。

## Technical Context

**Language/Version**: TypeScript ~5.3、Node.js >= 18.12.0（monorepo README）  
**Primary Dependencies**: NestJS 10、`@grpc/grpc-js`、`@nestjs/axios`（Auth HTTP 代理）、`class-validator`  
**Storage**: 无新增持久化；项目/页面数据仍由下游 Core gRPC 服务持有  
**Testing**: Nest 默认 `jest`（若包内已配置）；本特性建议补充 service 级单测 + 可选集成测（带 mock gRPC）  
**Target Platform**: Linux/本地开发主机上的 Nest HTTP 服务（默认端口以项目配置为准，常见 4000）  
**Project Type**: Rush monorepo 中的 BFF / Web 服务（`apps/server_bside`）  
**Performance Goals**: 成员判定为 O(1) 字段比较；列表依赖现有分页；避免「全量拉取再在 BFF 过滤」作为主路径  
**Constraints**: 须与 `proto/core.proto` 中 `ProjectService` / `PageService` 契约兼容；优先 **不破坏** gRPC 消息布局  
**Scale/Scope**: 覆盖 `ProjectController`、`PageController`、`PageVersionController` 及通过 `ProjectService`/`PageService` 间接暴露的 `BuilderService` 路径

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

对照 `.specify/memory/constitution.md`（Orangehome Monorepo Constitution）逐项确认：

- [x] **Rush / 包边界**：变更集中在 `apps/server_bside`；契约文件为仓库内既有 `proto/core.proto`（若仅补充注释或沿用已有过滤字段，不新增包）。
- [x] **契约**：列表行为依赖 `ListProjectsRequest.owner` / `collaborators` 的既有语义；若 Core 实现与注释不一致，须在集成验证中修正 Core 或调整 BFF 策略（见 `research.md`）。无破坏性 proto 字段删除计划。
- [x] **Nest / TS**：采用 Injectable 辅助服务或私有方法复用校验逻辑；沿用 `ForbiddenException` / `UnauthorizedException` 与现有 `handleGrpcError` 模式扩展。
- [x] **可验证交付**：`quickstart.md` 提供手动验证步骤；可与 spec 中 SC-001～003 对照执行。
- [x] **安全与可观测性**：拒绝原因使用固定、可读消息；不返回完整 gRPC 栈；不在日志中记录完整 Token。

**Post-Phase-1 re-check**: 与设计阶段结论一致，无新增违背。

## Project Structure

### Documentation (this feature)

```text
specs/001-project-collaborator-auth/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # /speckit.tasks（本命令不生成）
```

### Source Code (monorepo)

```text
apps/server_bside/
├── proto/core.proto                    # 契约参考（ListProjectsRequest 过滤语义）
├── src/
│   ├── auth/auth.service.ts            # getCurrentUser → email
│   ├── project/project.service.ts      # 列表过滤 + 单项目操作前校验
│   ├── project/project.module.ts       # 注入 AuthService（若当前未注入则需调整）
│   ├── page/page.service.ts            # 按 projectId / page 解析后校验
│   ├── page/page.module.ts
│   ├── page-version/page-version.service.ts  # 经 pageId → project 校验
│   ├── page-version/page-version.module.ts
│   └── builder/builder.service.ts      # 间接受益（底层 findOne 已校验）
└── docs/API.md                         # 可选：补充 403 说明
```

**Structure Decision**: 在 `server_bside` 的 Nest **服务层**集中成员判定逻辑，避免控制器重复；必要时抽取 `ProjectAccessHelper` 或 `ProjectMembershipService`（名称以实现阶段为准），供 `ProjectService`、`PageService`、`PageVersionService` 注入使用。

## Complexity Tracking

无宪法违背；无需登记豁免项。
