# Research: 项目协作者鉴权

**Feature**: 001-project-collaborator-auth  
**Date**: 2026-03-27

## 1. 当前用户标识与项目成员字段对齐

**Decision**: 使用 `AuthService.getCurrentUser(accessToken)` 返回的 **`email`** 作为成员判定主键，与 `proto` 中 `Project.owner`（字符串）及 `Project.collaborators`（`repeated string`，语义为邮箱列表）对齐。

**Rationale**: 现有 BFF 已在 `PageService.create` 中调用 `getCurrentUser`；项目 DTO 与 gRPC 映射使用 owner/collaborators 字符串，与登录体系邮箱一致。

**Alternatives considered**:

- 使用 Core 用户 `id`：proto 中 owner/collaborators 现为邮箱，改为 id 需契约与数据迁移，超出本特性范围。
- 仅在 HTTP 层信任客户端传入 owner 过滤：违背 spec，且存在伪造风险。

## 2. 项目列表：过滤实现位置

**Decision**: 优先在调用 `ProjectService.listProjects` 时，将 **同一用户 email** 同时填入 `ListProjectsRequest` 的 **`owner`**（精确匹配）与 **`collaborators`**（包含匹配）字段；依赖 proto 注释所述 **「或」** 语义，仅返回用户为 owner 或协作者的项目。

**Rationale**: `core.proto` 已定义过滤字段与语义，避免 BFF 拉全表再过滤导致分页与性能错误。

**Alternatives considered**:

- BFF 侧内存过滤：破坏 `total/page` 语义，数据量大时不可接受。
- 仅传 `owner`：协作者无法看到自己参与的非自有项目，违背 spec。

**Risk / verification**: 若下游 Core 对 `ListProjects` 的 `owner`/`collaborators` 组合实现与注释不一致，集成测试 MUST 暴露问题；修复优先级为 **Core 实现与 proto 一致**，否则 BFF 可降级为文档化 workaround（需 Complexity Tracking，当前假设 Core 已正确实现）。

## 3. 单项目 / 页面操作：校验策略

**Decision**:

- **项目管理**（`getProject` / `updateProject` / `deleteProject`）：在 BFF 完成 gRPC 调用前后择一策略——推荐 **先 `getProject` 再内存校验成员**（对已存在资源）；或 **拿到响应后校验**（读操作）。写操作须在 **执行写 RPC 前**校验，避免副作用。
- **页面管理**：对 `projectId` 已知的操作（如 `createPage`、`listPages`）先校验用户对该 `projectId` 的成员身份；对仅含 `pageId` 的操作先 `getPage` 取 `projectId` 再校验。
- **页面版本**：所有需 `pageId` 或 `versionId` 的入口，解析出所属 **projectId**（`getPage` 或版本详情中带 `pageId` 再查 page）后做同一套成员校验。

**Rationale**: 与 spec「以页面所属项目为准」一致；BFF 已持有 gRPC 客户端，无需新存储。

**Alternatives considered**:

- 仅在 Core 做鉴权：本仓库未包含 Core 实现，spec 交付主体为 `server_bside`；若 Core 日后重复校验，属于纵深防御，不冲突。

## 4. HTTP 错误映射

**Decision**: 非成员统一抛出 Nest **`ForbiddenException`**（HTTP 403），消息使用明确中文，如「无权限操作该项目」/「无权限访问该页面」，与 spec FR-005「明确无权限」一致；未带 Token 仍用 **`UnauthorizedException`**（401）。

**Rationale**: 与现有 `UnauthorizedException`、`NotFoundException` 模式一致；可选扩展 `handleGrpcError` 将 gRPC `7`（PERMISSION_DENIED）映射为 403（若 Core 开始返回该码）。

**Alternatives considered**:

- 403 vs 404 隐藏存在性：spec 未强制；当前与「明确无权限」一致采用 **403**。

## 5. `CreateProject` 与成员关系

**Decision**: 本特性 **不强制** 改变「创建项目」规则；创建成功后创建者应成为 owner（通常由请求体或 Core 逻辑决定）。若创建接口允许任意指定 `owner` 且与当前用户不一致，属 **产品/安全漏洞**，建议实现阶段 **将 owner 默认为当前用户邮箱** 或拒绝与 token 不匹配的 owner——作为 **实现任务** 记入 tasks，不阻塞列表与读写鉴权主线。

**Rationale**: 用户描述聚焦列表与项目/页面管理接口；创建流程需产品确认。

## 6. Builder 与物料接口

**Decision**: `BuilderService` 通过 `pageService.findOne` / `projectService.findOne` 聚合数据；在 **Page** / **Project** 服务层加入校验后，builder **无需单独规则**，除非存在 **绕过** 上述 service 的 gRPC 直调路径（当前无）。

**Rationale**: DRY，降低遗漏面。
