# Implementation Plan: 运行时预览 iframe 与分享/复制链接

**Branch**: `004-runtime-preview-iframe-share` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/004-runtime-preview-iframe-share/spec.md`

## Summary

将编辑器**预览模式**从本地 `SchemaNode` 渲染改为在预览区内嵌 **iframe** 加载「运行时预览服务」URL（`pageId` 来自 `EditorPageContext`）。**分享**按钮与预览顶栏**复制链接**均复制与 iframe **完全相同**的 URL。基地址通过 **`VITE_RUNTIME_PREVIEW_URL_TEMPLATE`**（含 `{pageId}` 占位）配置，替代当前 `ExportService.generateShareLink` 的 `#schema=` 方案作为对外分享主路径。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18  
**Primary Dependencies**: Vite、`@douyinfe/semi-ui`（Toast/Button）、既有 `EditorPageContext` / `previewStore`  
**Storage**: N/A  
**Testing**: Vitest（按需）；本特性以手工联调 + `quickstart.md` 为主  
**Target Platform**: 现代浏览器（需 `navigator.clipboard` 与 iframe；HTTPS 环境剪贴板更稳定）  
**Project Type**: Rush 包 `apps/web_builder`  
**Performance Goals**: iframe 首屏受 runtime 与网络影响；编辑器侧避免重复拉取 schema 仅用于预览渲染  
**Constraints**: 遵守 constitution（`src/data/api` 仅 BFF；预览 URL 不走 BFF 除非后续加代理）；不将内网 IP 写死为唯一来源  
**Scale/Scope**: 改动集中在 `Preview.tsx`、`Toolbar.tsx`、新建 URL 工具模块、`.env.example` 文档

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| Extensions + SlotRegistry | ✅ | `Toolbar` / `Preview` 已属扩展与 core 组件现状；改动不新增违规顶栏挂载 |
| Schema 真相 | ✅ | 编辑态 schema 不变；预览 iframe 不反向写 schema |
| DI | ✅ | URL 构建为纯函数或小模块即可 |
| State & data | ✅ | 沿用 `useEditorPageId`；不引入未文档化的全局单例 |
| Public API | ✅ | 库 `exports` 无需暴露预览 URL（SPA 内部） |
| Quality | ✅ | `rushx type-check` / `rushx lint` |

**Post-Phase-1**: 无新增违背。

## Project Structure

### Documentation (this feature)

```text
specs/004-runtime-preview-iframe-share/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── runtime-preview-url.md
└── tasks.md                    # /speckit.tasks
```

### Source Code（拟修改）

```text
apps/web_builder/
├── .env.example                          # 文档化 VITE_RUNTIME_PREVIEW_URL_TEMPLATE
├── src/
│   ├── vite-env.d.ts                     # 声明 env 类型（若尚无）
│   ├── utils/
│   │   └── runtimePreviewUrl.ts          # buildRuntimePreviewUrl（新建）
│   ├── core/
│   │   └── components/
│   │       └── Preview.tsx               # iframe + 加载态/错误 + 复制链接 + 提示文案
│   └── extensions/features/toolbar/
│       └── components/
│           └── Toolbar.tsx               # handleShareLink 改用 buildRuntimePreviewUrl(pageId)
```

**可选**: `ExportService.generateShareLink` 保留或标记 deprecated；不在分享主路径使用。

## Phase 0: Research

**Output**: [research.md](./research.md)（已完成）

## Phase 1: Design & Contracts

**Outputs**:

- [data-model.md](./data-model.md)
- [contracts/runtime-preview-url.md](./contracts/runtime-preview-url.md)
- [quickstart.md](./quickstart.md)

**Agent context**: 运行 `update-agent-context.sh cursor-agent`（`SPECIFY_FEATURE=004-runtime-preview-iframe-share`）。

## Phase 2（预览，由 /speckit.tasks 细化）

1. 新增 `buildRuntimePreviewUrl` + 环境变量类型与 `.env.example`。  
2. 改 `Preview.tsx`：设备框内 iframe、`onLoad`/`onError`、顶栏「复制链接」、草稿提示。  
3. 改 `Toolbar.tsx`：分享复制 runtime URL；无 `pageId` 时 Toast。  
4. 联调 runtime 服务；可选「新窗口打开」。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
