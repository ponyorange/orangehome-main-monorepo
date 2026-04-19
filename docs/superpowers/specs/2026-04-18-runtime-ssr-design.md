# 低代码运行时 SSR 设计说明

**日期**：2026-04-18  
**状态**：已确认路由策略（见 §2.1）  
**范围**：在现有 SSG/CSR（`/orangehome/runtime/:type/:pageid`）之外，新增服务端渲染 HTML + 客户端水合；涉及 `orangehome-core-service`、`orangehome-materials`（含 **`@orangehome/material-cli`**）、`server_bside`、`server_cside`、`web_builder`、**`web_admin`**（物料版本管理）。

---

## 0. 跨仓库 Git 分支约定（本需求）

- **统一分支名**：`feat/ssr_support`。凡本需求涉及的子 Agent / 开发者在**各独立 Git 仓库**中开发时，**从默认分支（如 `main`）检出并始终使用该分支**，直至需求结束（合并入主线、发布完成或项目方宣告收尾）。
- **工作区内典型仓库**（需在各自目录分别建同名分支）：
  - `orangehome-core-service`
  - `orangehome-materials`
  - `orangehome-main-monorepo`（单仓内覆盖 `server_bside`、`server_cside`、`web_admin`、`web_builder`、与 core 同步的 `proto` 等所有本需求改动）
- **操作示例**（每仓库根目录执行一次）：`git fetch origin && git checkout main && git pull && git checkout -b feat/ssr_support`（若分支已存在则 `git checkout feat/ssr_support` 并拉齐远端）。
- **PR 约定**：各仓向默认分支提 PR 时，**源分支统一为 `feat/ssr_support`**，便于按分支名筛选、联调与审计。
- **team-lead / 编排**：合并顺序仍按 §10，但**禁止**在本需求未结束前在各仓改用不一致的功能分支名（避免遗漏同步与重复解决冲突）。

### 0.1 包管理与 monorepo 工具链

- **`orangehome-main-monorepo`**：使用 **Rush**（根目录 `rush.json`），安装与解析依赖由 Rush 调度的 **pnpm** 完成（版本见 `rush.json` 的 `pnpmVersion`）。常规操作：在仓库根执行 **`rush update`**；在某一 Rush 项目目录内跑脚本优先使用 **`rushx <script>`**（与该项目 `package.json` 的 scripts 对应，由 Rush 注入环境）。全仓构建/测试可按需使用 **`rush build`** / **`rush test`** 及 `-t` / `--to` 等参数（以仓库内 Rush 文档为准）。**不要**在主仓文档或脚本示例中默认写成根目录无 Rush 的裸 `npm install`。
- **其他独立 Git 仓库**（如 `orangehome-core-service`、`orangehome-materials`）：统一使用 **pnpm**（`pnpm install`、`pnpm run …`、`pnpm exec …`）。新建或维护脚本、CI、实现计划时以 pnpm 为准；仅当某第三方工具强制要求时再使用 npm。

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

- **CI / 流水线**：构建 browser + SSR 两个产物后，分别走预签名上传，再在 **同一物料版本** 上写入 `file*` 与 `ssr*`（与 CLI `publish` 行为一致）。
- 调用 core / BFF 创建或更新物料版本时 **同时写入** `file*` 与 `ssr*`（允许分两次 PATCH，但 **`ohm publish` 默认原子语义**：两次上传都成功后才 `upsert`，见 §4.4）。

### 4.4 物料 CLI（`@orangehome/material-cli`）

与现网一致：`publish` 在包根目录执行 `runPackageBuild`，上传 `dist/index.js`，再 `PUT /versions/by-uid`。扩展如下：

1. **二次构建**：在 browser 构建成功后执行 **SSR 构建**（例如根目录脚本 `build:ssr` 或 CLI 内调 Vite 第二配置），产出路径约定为例如 **`dist-ssr/index.cjs`**（具体文件名在实现时固定并写入文档）。若缺少该文件则 **`publish` 失败**（可加 `--skip-ssr` 仅用于本地调试，**默认关闭**）。
2. **预签名上传**：在 `presignedUploadDistBundle` 基础上泛化为 **按产物类型上传**（或并列 `presignedUploadSsrBundle`）。请求 `POST /materials/upload/presigned` 的 body 增加字段，例如 **`bundle: 'browser' | 'ssr'`**（或 `artifactKind`），服务端为 SSR 生成 **独立 objectKey**（路径与 browser 区分，避免覆盖）。`Content-Type` 仍可用 `application/javascript` 或与存储约定一致。
3. **写库**：扩展 **`UpsertMaterialVersionByUidDto`**（及 CLI 侧 TS 类型）：在现有 `fileObjectKey`、`md5` 之外增加 **`ssrFileObjectKey`**（命名与 core 一致）、可选 **`ssrMd5`**（与 browser md5 对称，便于校验）。一次 `publish` 顺序建议：**browser 上传 → SSR 上传 → 单次 upsert 携带两个 key**（减少半成功状态）。
4. **兼容性**：旧包未配置 SSR 构建前，维护者需先升级模板/脚本；CLI 在缺少 `build:ssr` 时给出明确错误指引。

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

- 管理端「创建/更新物料版本」「CLI upsert」等 API：**扩展 `ssrFileObjectKey` / `ssrFileUrl`（HTTP JSON 可与前端约定驼峰，OpenAPI 文档中注明与 `ssr_url` 业务含义一致）**，校验与存储。
- **`POST /materials/upload/presigned`**（或当前等价路由）：请求体在现有 `materialId`、`version`、`filename` 基础上增加 **`bundle`**（或 `artifactKind`：`browser` | `ssr`），生成 **不同的存储 key**；权限与审计与现网一致。
- `CreateMaterialVersionDto` / `UpdateMaterialVersionDto` / `UpsertMaterialVersionByUidDto`：**可选或必选** `ssrFileObjectKey` 由产品规则决定——**首版建议创建版本时与 CLI 一致：browser 与 SSR 均提供**；更新版本（开发中）允许仅补传 SSR（`ssrFileObjectKey` 单独 PATCH）。
- 与 core gRPC / Mongo 字段一一映射。

---

## 7. 管理后台（`web_admin`）

目标：运营/研发在 **物料版本管理** 中与浏览器 JS **并列**维护 SSR 产物，无需强依赖 CLI。

1. **类型与服务**：`src/types/materialVersion.ts` 中 `MaterialVersion` 增加 `ssrFileObjectKey?`、`ssrFileUrl?`；`CreateMaterialVersionParams` / `UpdateMaterialVersionParams` 增加可选 **`ssrFileObjectKey`**（与创建/更新 DTO 对齐）。`materialApi.getPresignedUploadUrl`（或当前封装）增加 **`bundle: 'browser' | 'ssr'`** 参数并传给 BFF。
2. **页面**：`src/containers/MaterialVersions/index.tsx`  
   - 在现有「运行时 JS」上传之外，增加 **「SSR 产物（CJS）」** 上传区（Semi `Upload` + `customRequest`），流程与 `handleJsUpload` 相同：先取预签名，再 `PUT` 到对象存储，本地 state 保存 **`ssrFileObjectKey`**。  
   - **创建版本**：校验逻辑扩展——除 `fileObjectKey` 外，首版可要求 **`ssrFileObjectKey` 必填**（与 CLI 默认严格模式一致），或分阶段先可选、SSR 预览页 502 提示补传（产品二选一，**推荐与 CLI 一致：新建双产物必填**）。  
   - **编辑版本**（仅开发中）：支持仅替换 SSR 文件（`fileReplaced` 模式对称增加 `ssrFileReplaced`），`update` body 带上 `ssrFileObjectKey`。  
   - **列表**：新增列展示 SSR（`ssrFileUrl` 链接或「未配置」Tag），便于排查 runtime-ssr 502。
3. **与 CLI 一致**：同一套预签名与 DTO，避免 admin 与 CLI 写入字段不一致。

---

## 8. 编辑器（web_builder）

- 新增环境变量，例如 `VITE_RUNTIME_PREVIEW_SSR_URL_TEMPLATE`，默认形态：`{base}/orangehome/runtime-ssr/preview/{pageId}`。
- 预览/分享：可在产品层提供「SSG 预览 / SSR 预览」切换或并行入口（实现阶段再定交互）。

---

## 9. 测试与验收

- **单测**：`RuntimeSsrService` 对 501 分支、缺 SSR URL 的 502、schema 404。
- **集成**：mock core 返回带 `ssrFileUrl` 的物料；快照或字符串包含关键 SSR 标记。
- **手工**：同一 `pageId`，SSG 与 SSR 页面 ORANGEHOME_DATA 一致；SSR 首屏 HTML 非空；控制台无 hydrate mismatch（在物料 SSR-safe 前提下）。

---

## 10. 跨仓库实施顺序

1. **core-service**：schema + proto + gRPC 映射 + HTTP DTO（若版本 API 在 core 暴露）。  
2. **server_bside**：预签名 body 扩展、`Create`/`Update`/`Upsert` DTO 与 core 同步。  
3. **orangehome-materials**：各包 **SSR 构建脚本与产物路径**；**`material-cli`**：`publish` 双上传 + upsert 带 `ssrFileObjectKey`。  
4. **web_admin**：类型、预签名参数、`MaterialVersions` 双上传与列表列。  
5. **server_cside**：路由 + SSR 管线 + 模板。  
6. **web_builder**：预览 SSR URL 配置与文档。

---

## 11. 子 Agent 分工（与实现对齐）

| 子 Agent | 仓库 / 路径 | 交付物 |
|----------|-------------|--------|
| core-service | `orangehome-core-service` | `material_versions` 字段、`MaterialVersionMessage`、读写与列表 |
| orangehome-materials | `orangehome-materials` | 模板/组件 **双构建**、CI；**`packages/@orangehome/material-cli`**：`publish`、预签名、DTO |
| orangehome-server-bside | `main-monorepo/apps/server_bside` | 预签名 `bundle`、版本 CRUD / upsert 的 `ssr*` 字段 |
| orangehome-web-admin | `main-monorepo/apps/web_admin` | 物料版本 **SSR 上传**、列表展示、创建/更新入参 |
| server_cside | `main-monorepo/apps/server_cside` | `runtime-ssr` 路由、SSR 服务、模板 |
| orangehome-web-builder | `main-monorepo/apps/web_builder` | 预览 SSR URL 模板 |
| team-lead | 跨仓库 | 契约冻结、联调顺序、发布与回滚；**监督各仓库统一使用 `feat/ssr_support`** |

---

## 12. 自检

- **占位符**：无 TBD；501 范围与字段命名已写明。  
- **一致性**：路由 B 与 §2.1、§5.1 一致；`ssr_url` 与 `ssrFileUrl` 映射已说明；**CLI / web_admin / BFF 预签名契约一致**（§4.4、§6、§7）；**Git 分支与 §0 一致**；**主仓 Rush + pnpm 与其它仓 pnpm 与 §0.1 一致**。  
- **范围**：首版仅 preview SSR；release/dev 明确 501。  
- **歧义**：降级 CSR 默认为关；若开启需在实现中单独立项。**新建版本是否强制双产物**：文档推荐与 CLI 默认一致，若产品改为「SSR 可选」须在 §7 与验收标准中显式修改。

---

**下一步**：评审本文档后，使用 **writing-plans** 技能生成分仓库、可执行的实现计划与任务拆分。
