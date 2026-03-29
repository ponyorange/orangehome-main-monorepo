# Data Model: 项目协作者鉴权

**Feature**: 001-project-collaborator-auth  
**Date**: 2026-03-27

本特性 **不引入新表或新持久化实体**；以下为参与鉴权逻辑的 **逻辑模型**（与 `proto/core.proto` 及 BFF DTO 对齐）。

## User（当前会话）

| 逻辑字段 | 来源 | 说明 |
|----------|------|------|
| `email` | `AuthService.getCurrentUser` → Core `/api/auth/me` | 成员判定主键；必须与 Token 一致 |
| `id` | 同上 | 页面版本保存等场景沿用，非本特性成员判定主键 |

**校验规则**: 无 Token 或 Core 返回 401 → BFF 不得进入成员判定，直接未认证错误。

## Project

| 逻辑字段 | 来源 | 说明 |
|----------|------|------|
| `id` | `Project.id` | 路由与关联键 |
| `owner` | `Project.owner` | 字符串，与 User.email 相等则为 owner |
| `collaborators` | `Project.collaborators` | 字符串列表，包含 User.email 则为协作者 |

**成员谓词**（本特性唯一授权条件）:

```text
isMember(user, project) :=
  user.email === project.owner
  OR project.collaborators contains user.email
```

**列表过滤**（与 gRPC 请求字段对应）:

- `ListProjectsRequest.owner` = 用户 email → 匹配 owner 精确相等
- `ListProjectsRequest.collaborators` = 用户 email → 匹配 collaborators 数组包含该邮箱
- 二者同时设置时语义为 **OR**（以 proto 注释为准）

## Page

| 逻辑字段 | 来源 | 说明 |
|----------|------|------|
| `id` | `Page.id` | 页面操作路由键 |
| `project_id` | `Page.project_id` | **授权锚点**：成员判定针对该字段所指 Project |

**规则**: 任意页面管理操作，在业务执行前必须满足 `isMember(currentUser, project(project_id))`。

## PageVersion（间接）

| 逻辑字段 | 来源 | 说明 |
|----------|------|------|
| `page_id` | 版本消息中的 page 引用 | 用于解析到 Page → project_id |
| `id` | 版本 ID | 路由键 |

**规则**: 版本相关操作在调用 Core 前，须解析到 `project_id` 并完成同一 `isMember` 校验。

## 状态与迁移

无状态迁移。若历史数据中 `owner` / `collaborators` 与邮箱格式不一致，可能导致合法用户被拒；归一为 **数据治理** 任务，不在本特性范围。
