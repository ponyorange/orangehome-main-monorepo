# Research: 004-runtime-preview-iframe-share

## R1 — 预览实现：iframe 内嵌运行时页

- **Decision**: 预览模式下主内容区用 `<iframe src={runtimePreviewUrl}>` 展示；保留现有顶栏（返回编辑、设备选择、**新增**复制链接）。设备选择对 iframe 的约束：用外层 `div` 控制 `width`/`height`/`maxWidth`/`maxHeight`，iframe `width/height` 100%，与当前 `Preview` 设备框一致。
- **Rationale**: 与规格 FR-001 及用户原始描述一致；运行时与编辑器域分离，避免再实现一套渲染。
- **Alternatives considered**:
  - 仅新窗口打开：不满足「编辑器内预览」。
  - 继续 `SchemaNode` 本地渲染：不满足「运行时真实效果」。

## R2 — 分享链接从「schema hash」改为「运行时 preview URL」

- **Decision**: `Toolbar` 的「分享」与 `ExportService.generateShareLink` 解耦：分享走 **`buildRuntimePreviewUrl(pageId)`**（与 iframe `src` 同源逻辑）；`generateShareLink` 可保留供调试或后续移除，但不再作为分享主路径。
- **Rationale**: 规格 FR-002 要求与预览同一 URL；当前实现为 `origin + path + #schema=base64`（`ExportService.ts`），与运行时预览无关。
- **Alternatives considered**:
  - 同时复制两种链接：增加用户困惑，规格未要求。

## R3 — 可配置基地址

- **Decision**: 使用 Vite 环境变量，例如 `VITE_RUNTIME_PREVIEW_URL_TEMPLATE`，值为含占位符的完整模板字符串，默认 `{pageId}` 占位，例如 `http://192.168.1.91:50055/orangehome/runtime/preview/{pageId}`。实现时 `replace('{pageId}', encodeURIComponent(pageId))`（若 pageId 已 URL-safe 可仅拼接，以 runtime 契约为准）。
- **Rationale**: 满足 FR-004，与仓库现有 `VITE_BFF_API_URL` 模式一致（constitution）。
- **Alternatives considered**:
  - 仅 `ORIGIN` + 硬编码 path：灵活度略低；仍可作为迭代 2 简化。

## R4 — pageId 缺失与剪贴板失败

- **Decision**: `pageId` 为空时：预览入口可禁用或 Toast 提示；分享/复制链接同样提示，不写入剪贴板（FR-005）。剪贴板失败沿用 `Toast.error`，可选在预览栏展示只读 URL 文本供手动复制（规格边缘情况）。
- **Rationale**: 与现有 `Toolbar` 保存逻辑对 `pageId` 的检查一致。

## R5 — 草稿 vs 已发布提示

- **Decision**: 在预览顶栏副文案增加一句浅色提示：「以下为运行时已发布版本预览」（或等价），直至 BFF/runtime 支持草稿 token 预览再移除。具体文案可在实现 PR 中与产品确认。
- **Rationale**: 规格 Assumptions 要求避免误解未保存即见预览。

## R6 — X-Frame-Options / CSP frame-ancestors

- **Decision**: MVP 若 iframe 空白，在预览区显示简短说明 + 「新窗口打开」按钮（`window.open(runtimePreviewUrl)`）。不阻塞首版合并。
- **Rationale**: 规格 Edge Cases 允许次要入口。
