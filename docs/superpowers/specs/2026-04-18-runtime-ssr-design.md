# 低代码运行时 SSR 设计说明

**日期**：2026-04-18  
**状态**：已确认路由策略（见 §2.1）  
**范围**：在现有 SSG/CSR（`/orangehome/runtime/:type/:pageid`）之外，新增服务端渲染 HTML + 客户端水合；涉及 `orangehome-core-service`、`orangehome-materials`、`server_bside`、`server_cside`、`web_builder`。

---

## 1. 背景与现状

- **当前**：`server_cside` 通过 gRPC 从 core 拉取页面 schema 与物料 **浏览器脚本 URL**（`componentsAmdMap`），EJS 输出 HTML；`#app` 为空，由浏览器加载 AMD/React 后 CSR 挂载。
- **目标**：新增 **`GET /orangehome/runtime-ssr/:type/:pageid`**，服务端用 React 渲染出 **真实 DOM**，浏览器再 **hydrate**；物料需 **双产物**（浏览器链路与 Node CJS 链路），core 存 **SSR 产物地址**。

---

## 2. HTTP 与缓存契约

### 2.1 路径与 type（已确认：方案 B）

- **路径模板**：`GET /orangehome/runtime-ssr/:type/:pageid`，与 SSG 的 `:type` **语义对齐**：`release` | `preview` | `dev`。
- **首版实现范围**：**仅 `preview`** 返回完整 SSR HTML；**`release` 与 `dev` 返回 HTTP 501**（Body 可为简短 JSON 或纯文本说明，需与网关/监控约定一致）。
- **后续阶段**：按与 `RuntimeService` 相同的规则扩展 `release`/`dev`（页面版本选取、物料版本状态集合与 SSG 一致）。

### 2.2 Query 与其它响应头

- 支持与现网 runtime 一致的 query（如 `lang`），行为与 SSG 对齐 unless SSR 专用需求另有说明。
- **`preview` Cache-Control**：`private, no-store`（与当前 preview SSG 一致）。
- **501 响应**：`no-store`；不设长期缓存。

### 2.3 错误语义

- 页面或 schema 缺失：**404**（与 SSG 一致）。
- 某 `materialUid` 在 SSR 路径上 **缺少 `ssr_url` / 无法加载 CJS**：默认 **502**（整页失败）；是否允许降级为「仅 CSR」由配置开关决定（首版建议 **关闭降级**，便于暴露物料缺口）。

---

## 3. 数据模型与 gRPC（core-service）

### 3.1 Mongo `material_versions`

在现有 `fileObjectKey` / `fileUrl` 之外新增（命名可与代码风格统一为 camelCase，对外 HTTP 仍可使用 `ssr_url` 别名文档）：

| 字段 | 说明 |
|------|------|
| `ssrFileObjectKey` | SSR 产物在对象存储中的 key（可选；与 file 侧对称） |
| `ssrFileUrl` | SSR 产物访问 URL（**即业务口中的 `ssr_url`**，可选） |

规则：SSR 渲染时至少能解析出 **可 `require` 的 HTTPS URL**（由 `ssrFileUrl` 或由 key 拼桶 URL，与现 `buildComponentsMapWithMaterialVersionStatus` 对 file 的处理一致）。

### 3.2 `core.proto`

- 扩展 `MaterialVersionMessage`：`ssr_file_object_key`、`ssr_file_url`（建议 `google.protobuf.StringValue`，与 `file_url` 一致）。
- 同步副本：`orangehome-main-monorepo/apps/server_cside/proto/core.proto`、`apps/server_bside/proto/core.proto` 与 core 仓库 **保持一致版本**。

### 3.3 兼容与回填

- 旧版本无 SSR 字段：允许存在；**仅在请求 SSR 且该页用到的物料缺 SSR 时失败**。

---

## 4. 物料构建与发布（orangehome-materials）

### 4.1 双产物

- **Browser**：保持现有 IIFE/AMD 构建与上传不变。
- **Node SSR**：单独构建 **CJS**（`ssr: true`，`react` / `react-dom` / `react-dom/server` **external**，由服务端提供单一副本）。

### 4.2 导出约定

- 每个物料 CJS 与浏览器侧 **组件注册语义一致**（或由 `@orangehome/common-plugin-runtime` 的 SSR 入口统一约定 `materialUid` → 组件映射）。
- 文档化「SSR 安全」约束（避免无条件访问 `window`/`document`；必要时 `typeof window` 分支）。

### 4.3 上传与写库

- CI 上传两个对象；调用 core / BFF 创建或更新物料版本时 **同时写入** `file*` 与 `ssr*`。

---

## 5. C 端渲染管线（server_cside）

### 5.1 新服务与控制器

- 新增例如 `RuntimeSsrController` + `RuntimeSsrService`（或与现有 `RuntimeModule` 并列注册）。
- **路由**：`@Get('orangehome/runtime-ssr/:type/:pageid')`。
- **分支**：`type === 'preview'` → SSR；否则 **501**。

### 5.2 与 SSG 复用

- 页面解析、`resolvePageSchemaByRuntimeType`（preview 对应草稿最新）、`collectMaterialUids`、物料 **版本状态集合** 与现 `RuntimeService` **保持一致**。
- 新增 **`buildComponentsSsrMap`**：从 `GetMaterialsWithLatestVersion` 结果读取 **`ssrFileUrl` / `ssrFileObjectKey`**，校验 URL，uid → CJS URL。

### 5.3 Node 侧执行顺序（逻辑）

1. 加载服务端 React（固定版本，与 HTML 中 script 引用一致）。
2. 加载 **公共 runtime 的 SSR CJS**（与 `plugins/runtime` 浏览器包对应）。
3. 按依赖拓扑或去重顺序 `require` 各物料 CJS，注册到统一 registry。
4. `renderToString`（或流式 API）生成应用根节点 HTML。
5. EJS 输出：**`<div id="app">` 内为 SSR HTML**；保留 `ORANGEHOME_DATA`：**`schema` + 浏览器用 `componentsAmdMap`**（与现 SSG 一致），保证 hydrate 数据一致。
6. **脚本**：继续加载与现网一致的 React、AMD、公共运行时 IIFE、物料 AMD 脚本（或后续收敛为单一 client bundle）；客户端执行 `hydrateRoot`。

### 5.4 安全与稳定性

- URL 校验：仅 `http:`/`https:`，建议限制 host 白名单（与现 `assertScriptUrl` 同级或更严）。
- **模块缓存**：进程内缓存已加载 CJS，注意版本更新时的缓存失效策略（key = URL + etag 或版本 id）。
- 超时与单请求资源上限，防止恶意页面拖垮进程。

---

## 6. BFF（server_bside）

- 管理端「创建/更新物料版本」「发布/构建回调」等 API：**扩展 `ssr_file_url` / `ssr_file_object_key`**，校验与存储。
- 与 core gRPC 字段一一映射；权限与审计与现物料上传一致。

---

## 7. 编辑器（web_builder）

- 新增环境变量，例如 `VITE_RUNTIME_PREVIEW_SSR_URL_TEMPLATE`，默认形态：`{base}/orangehome/runtime-ssr/preview/{pageId}`。
- 预览/分享：可在产品层提供「SSG 预览 / SSR 预览」切换或并行入口（实现阶段再定交互）。

---

## 8. 测试与验收

- **单测**：`RuntimeSsrService` 对 501 分支、缺 SSR URL 的 502、schema 404。
- **集成**：mock core 返回带 `ssrFileUrl` 的物料；快照或字符串包含关键 SSR 标记。
- **手工**：同一 `pageId`，SSG 与 SSR 页面 ORANGEHOME_DATA 一致；SSR 首屏 HTML 非空；控制台无 hydrate mismatch（在物料 SSR-safe 前提下）。

---

## 9. 跨仓库实施顺序

1. **core-service**：schema + proto + gRPC 映射 + 必要 DTO。  
2. **orangehome-materials**：CJS SSR 构建与上传写 `ssr*`。  
3. **server_bside**：管理端 API。  
4. **server_cside**：路由 + SSR 管线 + EJS 模板（或复用模板插槽）。  
5. **web_builder**：预览 URL 配置与文档。

---

## 10. 子 Agent 分工（与实现对齐）

| 子 Agent | 仓库 | 交付物 |
|----------|------|--------|
| core-service | `orangehome-core-service` | `material_versions` 字段、`MaterialVersionMessage`、读写与列表 |
| orangehome-materials | `orangehome-materials` | 双产物构建、上传、导出约定 |
| orangehome-server-bside | `main-monorepo/apps/server_bside` | BFF 字段与校验 |
| server_cside | `main-monorepo/apps/server_cside` | `runtime-ssr` 路由、SSR 服务、模板 |
| orangehome-web-builder | `main-monorepo/apps/web_builder` | 预览 SSR URL 模板 |
| team-lead | 跨仓库 | 契约冻结、联调顺序、发布与回滚 |

---

## 11. 自检

- **占位符**：无 TBD；501 范围与字段命名已写明。  
- **一致性**：路由 B 与 §2.1、§5.1 一致；`ssr_url` 与 `ssrFileUrl` 映射已说明。  
- **范围**：首版仅 preview SSR；release/dev 明确 501。  
- **歧义**：降级 CSR 默认为关；若开启需在实现中单独立项。

---

**下一步**：评审本文档后，使用 **writing-plans** 技能生成分仓库、可执行的实现计划与任务拆分。
