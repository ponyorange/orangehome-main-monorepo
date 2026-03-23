# Feature Specification: 运行时页面 HTML 渲染（按类型与页面 ID）

**Feature Branch**: `001-runtime-page-render`  
**Created**: 2025-03-23  
**Status**: Draft  
**Input**: User description: "开发一个渲染接口，get接口，路径是 /orangehome/runtime/:type/:pageid，例如/orangehome/runtime/release/6482afask4396634。然后对接core-service gRPC服务，实现以下功能：type是页面状态：release是线上，preview是配置中的，dev是调试；pageid是页面id。通过pageid获取到对应页面的对应状态的最新版本，release是拿最新的线上版本，preview和dev是拿最新的配置版本，拿到页面的schema，解析页面的schema所用到组件的materialUid，再拿这些uid去请求物料数据回来，release和preview是拿最新的上线的物料版本，dev是拿最新的物料版本，组装成 componentsAmdMap = {\"materialUid\": \"物料url\", ...}。然后返回一个ejs渲染出来的html内容给前端去渲染…（含示例 HTML 骨架与 ORANGEHOME_DATA）"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 访问线上版页面运行时壳（Priority: P1）

访客或运营人员在浏览器中打开线上环境的页面运行时地址（路径中含 **release** 与有效页面 ID），需要立即得到一页可执行的 HTML：内含当前**已发布**页面版本的结构化描述、各组件物料的脚本地址映射，以及按约定顺序加载的脚本标签，供前端在 `#app` 中完成渲染。

**Why this priority**：release 是 C 端主路径，直接决定用户能否看到正确、可交互的页面。

**Independent Test**：仅使用 `release` 类型与一已知已发布页面 ID 发起单次 GET，断言响应为 `text/html`（或等价 HTML 主文档），且文档内包含可解析的页面数据块与每个引用物料的脚本地址。

**Acceptance Scenarios**:

1. **Given** 页面存在且存在已发布版本，**When** 客户端请求 `release` 类型与该页面 ID，**Then** 响应体为完整 HTML 文档，且内嵌数据包含该已发布版本对应的页面结构与物料脚本 URL 映射。
2. **Given** 页面不存在或尚无已发布版本，**When** 客户端请求 `release`，**Then** 返回明确的错误结果（如 404），且不泄露内部实现细节或敏感信息。

---

### User Story 2 - 预览配置中页面（Priority: P2）

编辑或运营在「配置中」场景下使用 **preview** 类型访问同一页面 ID，需要看到基于**最新配置版本**（非仅已发布）的页面数据，但物料脚本仍须与线上一致规则：**仅使用已发布上线的物料构建**，避免预览页加载未发布物料导致与生产不一致。

**Why this priority**：支撑配置验证与发布前检查，且与 release 在物料规则上对齐可降低环境差异。

**Independent Test**：在已知存在较新草稿、且已发布版本较旧的数据条件下，对 `preview` 发起 GET，断言内嵌页面数据与**最新配置版本**一致，且物料 URL 均来自**已发布物料版本**轨道。

**Acceptance Scenarios**:

1. **Given** 页面存在草稿/配置版本新于已发布版本，**When** 请求 `preview`，**Then** 内嵌 schema 等内容反映**最新配置版本**；`componentsAmdMap` 中每个 UID 对应**已发布状态**下的最新物料脚本地址。
2. **Given** 页面无可用配置版本，**When** 请求 `preview`，**Then** 返回可区分的错误（如 404），信息对外安全。

---

### User Story 3 - 调试态加载最新物料（Priority: P3）

开发或调试人员使用 **dev** 类型访问页面 ID，需要在页面数据与物料上与「最新开发/非发布轨道」一致：页面取**最新配置版本**，物料取**最新物料版本**（含未发布构建），以便验证尚未上线的组件行为。

**Why this priority**：缩短迭代闭环；受众小于 C 端全量用户，可次于 release/preview。

**Independent Test**：在存在仅开发中、未发布物料版本的场景下，对 `dev` 发起 GET，断言物料脚本 URL 指向**该 UID 下最新版本**（与 release/preview 所用「仅已发布」轨道可区分）。

**Acceptance Scenarios**:

1. **Given** 某 `materialUid` 存在较新的未发布物料版本，**When** 请求 `dev`，**Then** 该 UID 在映射中的 URL 对应该**最新**物料版本（含未发布）。
2. **Given** 请求 `dev` 但页面或物料数据缺失，**When** 客户端 GET，**Then** 返回明确错误，不暴露堆栈或内部路径。

---

### Edge Cases

- `type` 不是 `release`、`preview`、`dev` 之一（大小写是否归一化见假设）：须返回 400 类可理解错误。
- `pageid` 格式非法或对应资源不存在：404 或统一「未找到」语义。
- 页面 schema 中**无任何** `materialUid`：仍返回合法 HTML 与空映射（或等价空对象），脚本区仅保留可选页面级脚本。
- 同一 `materialUid` 在 schema 中多次出现：映射中仅保留一条 URL，脚本标签**去重**后加载。
- 某一 UID 在物料侧不存在或无可选版本：须定义一致策略（失败整页 vs 跳过该组件）；**默认**整页失败并返回可诊断但不对外的错误码（见假设）。
- 物料 URL 不可用或为空：与上条策略一致。
- 并发与重复请求：响应须自洽，不要求在规范层规定缓存实现，但须满足成功标准中的体验指标。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**：系统 MUST 提供 **GET** 资源路径模板 `/orangehome/runtime/:type/:pageid`，其中 `type` ∈ {`release`,`preview`,`dev`}，`pageid` 为稳定页面标识（与内容后台中的页面 ID 一致）。
- **FR-002**：对 `release`，系统 MUST 解析并返回该 `pageid` 当前**线上已发布**的页面版本所绑定的页面结构数据（含 schema 或等价结构化内容）。
- **FR-003**：对 `preview` 与 `dev`，系统 MUST 返回该 `pageid` 的**最新配置版本**（最新草稿/配置轨道，而非仅已发布版本）所绑定的页面结构数据。
- **FR-004**：系统 MUST 从页面结构数据中**递归**识别所有组件节点上的 `materialUid`（约定字段名与大小写一致），收集去重后的 UID 列表。
- **FR-005**：系统 MUST 按 `type` 为每个 UID 解析出**可浏览器加载的物料脚本 URL**（与权威物料数据中的版本与存储约定一致），并构建映射 `componentsAmdMap`：键为 `materialUid` 字符串，值为对应 URL 字符串。
- **FR-006**：对 `release` 与 `preview`，物料版本选择规则 MUST 与「**已发布上线**」轨道一致（仅采用已发布状态的最新构建）；对 `dev`，MUST 采用该 UID 的**全局最新**物料版本（含未发布），与 release/preview 可区分。
- **FR-007**：系统 MUST 通过与本项目已约定的 **OrangeHome 核心内容服务**（页面、页面版本、物料与物料版本能力）集成，取得页面版本与物料 URL；调用须使用部署环境配置的**服务身份**完成鉴权，**不**要求终端访问者持有后台用户令牌（除非产品另行规定）。
- **FR-008**：响应 MUST 为**单一 HTML 文档**，包含至少：`lang`、`charset`、`viewport`、文档标题、`id="ORANGEHOME_DATA"` 的脚本数据块（内容为 **合法 JSON**）、根挂载节点 `#app`、按约定顺序的 `defer` 外部脚本（每个物料 URL 至多一次），以及可选的页面级附加脚本注入位。
- **FR-009**：`ORANGEHOME_DATA` 内 JSON MUST 包含属性 `schema`（页面结构，与解析来源一致）与 `componentsAmdMap`（字符串到字符串的映射），以便客户端引导脚本读取；键名与示例 `ORANGEHOME_DATA` 一致。
- **FR-010**：文档标题与站点名称 MUST 可从页面元数据或配置推导（若缺失则使用安全默认值）；自然语言偏好（如 `lang`）MUST 支持默认 `zh-CN` 及可扩展来源（如查询参数），具体优先级见假设。
- **FR-011**：所有失败路径 MUST 返回对外安全的错误信息，禁止响应体包含堆栈、内部路径、密钥或未授权数据。

### Key Entities

- **页面（Page）**：逻辑页面，具有稳定 ID；关联多个**页面版本**。
- **页面版本（Page version）**：一次保存或发布快照，携带 `page_schema_json`（或等价）及发布/草稿标记。
- **页面结构（schema）**：嵌套树状 JSON，节点可含 `materialUid` 等组件引用。
- **物料（Material）**：由 `materialUid` 标识；多个**物料版本**对应不同构建产物。
- **物料版本（Material version）**：具状态（如开发中、已发布等）及可暴露给浏览器的脚本 **URL**。
- **componentsAmdMap**：从 `materialUid` 到脚本 URL 的映射，供 HTML 与内嵌 JSON 共用。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**：在标称负载下，对合法 `release` 请求，**95%** 的成功响应在 **3 秒内**完成首字节可感知交付（以端到端测量或监控为准，不含客户端离线场景）。
- **SC-002**：对任意成功响应，独立测试程序可解析 `ORANGEHOME_DATA` 内 JSON，且 `schema` 与 `componentsAmdMap` 类型符合 FR-009。
- **SC-003**：对 schema 中出现的每个 `materialUid`，成功响应 HTML 中 `componentsAmdMap` 均存在对应键，且存在一条 `defer` 脚本引用其 URL（去重后一致）。
- **SC-004**：`preview` 与 `release` 在「页面版本新旧」可区分场景下，盲测可验证 **preview 的页面数据新于或等于 release 的已发布快照**；`dev` 在存在未发布物料时可验证 **至少一个 UID 的 URL 与 preview/release 不同**（当该 UID 存在更新未发布构建时）。

## Assumptions

- **类型字面量**：请求路径中的 `type` 使用小写 `release` / `preview` / `dev`；若实现接受大写，MUST 归一化或显式拒绝，并在计划中写清一种行为。
- **物料 URL 字段**：集成层从核心服务返回的物料版本记录中选取**面向浏览器脚本加载**的 URL 字段（与现有 `file_url` 或等价字段一致），由实现阶段与 proto/字段对齐。
- **缺失物料策略**：默认对任一缺失 UID 或缺失 URL **整页失败**（5xx 或统一业务错误页），避免静默缺脚本导致白屏难以诊断；若产品改为「跳过」须在 plan 中记录并更新验收。
- **鉴权**：运行时 GET 对公网访问默认可匿名；与核心服务的集成使用服务端配置的凭证（符合 core-service 对 gRPC 的 metadata 要求），不将终端用户 access token 作为必要条件。
- **参考壳层**：实现可选用任意服务端模板技术，只要产出的 HTML 满足 FR-008、FR-009；示例见同目录 `reference/runtime-page.ejs`。

## Related Artifacts

- 示例 HTML 壳（供实现参考）：[`reference/runtime-page.ejs`](reference/runtime-page.ejs)
