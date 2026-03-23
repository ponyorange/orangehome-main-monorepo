# Research: 001-runtime-page-render

## R1 — 页面版本如何按 type 解析

**Decision**

- 统一使用 **`PageVersionService.GetLatestPageVersionByStatus`**（`page_id` + `version_status`）：  
  - **release**：`version_status = 2`（`published`）— core `getLatestByPageAndStatus` 查询 `isPublished: true`，按 `version_number` 降序取一条。  
  - **preview / dev**：`version_status = 1`（`latest_draft`）— 查询 `isLatestDraft: true`，与「最新配置草稿」一致。  
- 页面标题等仍用 **`PageService.GetPage`**（仅需存在性与 `title`）。

**Rationale**：core 已提供专用 RPC，避免客户端分页 `ListPageVersions` 与 `published_version_id` 手工对齐。

**Alternatives considered**

- 旧方案：`GetPage` + `ListPageVersions` 分页查找；已弃用。

## R2 — 物料 URL：release/preview 与 dev

**Decision**

- **release / preview**：`MaterialService.GetMaterialsWithLatestVersion`，`version_status = 2`（`VERSION_STATUS.PUBLISHED`，与 core `material_versions.status` 一致）。从返回的 `latest_version.file_url`（或 proto `file_url`）取脚本 URL；缺 URL → 按 spec 默认整页失败。
- **dev（全局最新构建）**：`GetMaterialsWithLatestVersion` 的 `version_status` 为单值过滤，无法一次表达「任意状态最高 `version_code`」。采用两步：  
  1. 仍调用 `GetMaterialsWithLatestVersion(material_uids, version_status=2)`，主要目的为拿到每条物料的 `material.id` 及在已发布轨道上的版本（可忽略用于 URL）。  
  2. 对每个 `material.id` 并行调用 `MaterialVersionService.ListMaterialVersions(material_id, page=1, limit=1)` 且 **不传 status**（core 实现中 `status` 未设置时不加入查询条件），结果按 `version_code` 降序，取第一条的 `file_url`。  
  若某 UID 在步骤 1 中无物料记录 → 404/502 按「缺失物料」处理。

**Rationale**：与 `material-version.service.ts` 中 `list()` 行为一致；满足 spec「dev 含未发布」。

**Alternatives considered**

- 仅对 dev 使用 `version_status=0`（开发中）：会漏掉「测试中」等状态，且非全局最新语义。

## R3 — 从 schema 收集 `materialUid`

**Decision**

- 对解析后的 `pageSchema` 对象做深度优先遍历；凡遇到键名严格为 `materialUid` 且值为非空字符串，加入 `Set`；输出有序数组（可选按发现顺序）。

**Rationale**：与 spec FR-004 一致；避免依赖特定组件树形状。

## R4 — core gRPC 鉴权

**Decision**

- 使用环境变量提供服务端 JWT：`CORE_SERVICE_GRPC_JWT`（或分文件路径），在 gRPC metadata 中设置 `authorization: Bearer <token>`。Token 由运维/平台向 user-service 或机器账号签发，与 core README 一致。

**Rationale**：spec 假设浏览器匿名；core 要求已认证 RPC。

**Alternatives considered**

- mTLS：未在 core README 描述；保留后续增强。

## R5 — proto 与代码生成

**Decision**

- 将 `core-service` 仓库中的 `proto/core.proto` **复制**到 `apps/server_cside/proto/core.proto`（或通过 CI 同步）；Nest 使用 `ClientsModule.register` + `transport: Transport.GRPC`、`protoPath` 指向该文件。包名 `orangehome.core`。

**Rationale**：main-monorepo 与 core-service 可能为独立检出；复制避免跨盘相对路径断裂。

## R6 — EJS 与 XSS

**Decision**

- 使用 `specs/001-runtime-page-render/reference/runtime-page.ejs` 为基准拷贝到 `src/runtime/views/runtime-page.ejs`；`ORANGEHOME_DATA` 使用 `JSON.stringify` 嵌入；脚本 URL 仅允许 `http:`/`https:`（可选校验）。

**Rationale**：满足 FR-008/009；减少内联 JSON 破坏 HTML 的风险。

## R7 — `type` 大小写

**Decision**

- 仅接受小写 `release` | `preview` | `dev`；否则 **400**。

**Rationale**：与 spec Assumptions 一致；避免缓存键分叉。
