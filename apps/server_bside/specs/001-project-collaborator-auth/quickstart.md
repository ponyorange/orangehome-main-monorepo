# Quickstart: 验证项目协作者鉴权

**Feature**: 001-project-collaborator-auth  
**Date**: 2026-03-27

前置：Core gRPC、Core HTTP（认证）、`server_bside` 已按 README 启动；具备三个测试账号 **A、B、C** 的 Token，以及项目 **P1**（A=owner）、**P2**（A=collaborator，B=owner）、**P3**（仅 B 相关，A 无关系）。

## 1. 项目列表（FR-001 / US1）

1. 使用 **A** 的 `Authorization: Bearer <token>` 调用 `GET /projects`（带常用分页参数）。
2. **期望**：响应列表含 **P1、P2**，不含 **P3**。
3. 使用 **C** 的 Token 调用同一接口。
4. **期望**：列表中 **无** P1、P2、P3（在仅这三项目的前提下为空或仅含 C 有权项目）。

## 2. 项目管理（FR-002 / US2）

1. **A** 调用 `GET /projects/{P3}`。  
   **期望**：**403**（或产品约定的无权限表现），且非 200 带数据。
2. **A** 调用 `PUT /projects/{P3}`（任意合法 body）。  
   **期望**：**403**，且 P3 在 Core 侧数据未被该请求成功篡改（可通过 B 或管理手段核对）。
3. **A** 对 `P1` 执行 `GET` / `PUT`。  
   **期望**：**200**（在业务校验通过时）。

## 3. 页面管理（FR-003 / US3）

1. **A** 对 **P3** 下页面调用 `GET /pages?projectId=<P3>`。  
   **期望**：**403**。
2. **A** 对 **P1** 下页面 `POST /pages`（合法 body）。  
   **期望**：**201**。
3. **A** 使用 **P3** 下某 `pageId`（若已知）调用 `GET /pages/{id}`。  
   **期望**：**403**（即使 id 存在）。

## 4. 页面版本（从属页面管理）

1. **A** 对仅属于 P3 的 `pageId` 调用 `GET /page-versions?pageId=...` 或 `GET /page-versions/latest?pageId=...`。  
   **期望**：**403**。
2. **A** 对属于 P1 的 `pageId` 调用上述接口。  
   **期望**：**200**。

## 5. 未认证

1. 不带 `Authorization` 调用 `GET /projects`。  
   **期望**：**401**（与现网一致）。

## 6. Builder（回归）

1. **A** 调用 builder 初始化接口（依赖 P1 下有效 `pageId`）。  
   **期望**：**200**。
2. **A** 使用 **P3** 下 `pageId`（若可得）。  
   **期望**：**403**。

---

若 **列表** 结果与期望不符，优先核对 Core 对 `ListProjects` 的 `owner`/`collaborators` 过滤是否与 `proto` 注释一致（见 `research.md`）。

---

## 实现记录（BFF）

**2026-03-27**：已在 `apps/server_bside` 实现成员校验、列表双字段过滤、gRPC `PERMISSION_DENIED`(7)→403、创建项目 owner 绑定当前用户、`page-versions` rollback 使用真实 `userId`。请在联调环境执行上文步骤完成 **T017** 手测验收。
