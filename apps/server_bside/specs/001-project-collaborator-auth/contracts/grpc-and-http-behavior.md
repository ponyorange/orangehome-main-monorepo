# Contract Notes: gRPC 与 HTTP 行为（项目协作者鉴权）

**Feature**: 001-project-collaborator-auth  
**Date**: 2026-03-27  
**Canonical proto**: `D:/ai_coding/orangehome/main-monorepo/apps/server_bside/proto/core.proto`

## gRPC: `ProjectService.ListProjects`

**Request**（ relevant fields ）:

- `owner` (`google.protobuf.StringValue`): 按 **创建者邮箱精确匹配**
- `collaborators` (`google.protobuf.StringValue`): 项目的 `collaborators` **包含**该邮箱即匹配
- 注释：**与 `owner` 同时传时为「或」关系**

**BFF 行为（本特性）**:

- 从 Bearer Token 解析当前用户后，将 **同一 email** 同时设置到 `owner` 与 `collaborators` 字段再调用 gRPC，使结果集为「owner 为该邮箱 **或** collaborators 包含该邮箱」的项目子集。
- 保留现有 `page`、`limit`、`search`、`business_id` 等查询参数的转发行为（在成员过滤之上再交集）。

**Consumers**: `@orangehome/server_bside` → Core gRPC 服务（实现须在 Core 侧与上述语义一致）。

## gRPC: `ProjectService.GetProject` / `UpdateProject` / `DeleteProject`

**BFF 行为（本特性）**:

- 在成功取得项目 DTO（或执行写操作前取得项目视图）后，使用 `owner` 与 `collaborators` 与当前用户 `email` 做成员判定；不满足则 **不向客户端返回资源正文**（读）或 **不发起写 RPC**（写），并返回 HTTP **403**。

**Compatibility**: 不改变 request/response 消息布局。

## gRPC: `PageService.*`

**BFF 行为（本特性）**:

- `CreatePage` / `ListPages`：对请求中的 `project_id` 先做项目成员校验。
- `GetPage` / `UpdatePage` / `DeletePage`：`getPage` 后读取 `project_id`，再校验成员。

**Compatibility**: 不改变 proto 定义。

## HTTP: BFF OpenAPI 层（Nest Controllers）

| 区域 | 路径模式 | 鉴权结果（非成员） |
|------|-----------|-------------------|
| 项目 | `GET /projects` | 列表不含无权项目（过滤） |
| 项目 | `GET/PUT/DELETE /projects/:id` | **403** + 明确无权限文案 |
| 页面 | `GET /pages?projectId=` / `POST /pages` | **403** |
| 页面 | `GET/PUT/DELETE /pages/:id` | **403** |
| 页面版本 | 依赖 `pageId` 或解析出的 page | **403** |

**401**: 无 Token 或 Token 无效 — 保持现有行为。

## 可选：gRPC 状态码

若 Core 对未授权返回 `PERMISSION_DENIED`（gRPC code **7**），BFF `handleGrpcError` **建议**映射为 HTTP **403**，与 BFF 自主拒绝一致。
