# Implementation Plan: HTTP 环境下分享预览链接与复制失败兜底

**Branch**: `011-http-share-fallback` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: `specs/011-http-share-fallback/spec.md`

## Summary

编辑器「分享」依赖 `navigator.clipboard.writeText` 构造预览链接时，在**非安全上下文**（典型为局域网 `http://` 而非 `localhost`）会失败，当前实现将统一归为 `clipboard_error` 并提示「请使用 HTTPS」，与规格 FR-001/FR-005 冲突。

**技术路线**：在 `buildRuntimePreviewUrl` 不变前提下，将「写入剪贴板」拆为**多级策略**——优先异步 Clipboard API；失败则尝试 **`document.execCommand('copy')` + 临时 `textarea`**（多数 HTTP 页面仍可用）；仍失败则打开 **Semi `Modal`** 展示完整 URL，并提供 **`window.open(url, '_blank', 'noopener,noreferrer')`**。成功复制时保持现有 Toast，**不**弹完整链接弹窗（FR-004）。

**现状锚点**：`apps/web_builder/src/utils/runtimePreviewUrl.ts` 中 `copyRuntimePreviewLink`；`apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` 中 `handleShareLink`。

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Semi Design（`Modal`、`Toast`、`Typography`、`Button`）、Vite `import.meta.env`  
**Storage**: 无  
**Testing**: `rushx type-check` / `npm run type-check`；手工走查 quickstart（HTTP、HTTPS、拦截弹窗）  
**Target Platform**: 现代桌面浏览器（Chromium / Firefox / Safari 主版本）  
**Project Type**: `apps/web_builder` SPA  
**Performance Goals**: 分享点击主路径无感知延迟；兜底 Modal 仅失败路径出现  
**Constraints**: 不新增硬编码生产域名；不削弱 `noopener` 新开页安全习惯  
**Scale/Scope**: 单入口（工具栏「分享」）；与 `VITE_RUNTIME_PREVIEW_URL_TEMPLATE` 行为对齐  

## Constitution Check

*GATE: Passed. Re-check after Phase 1.*

- **Extensions**：逻辑挂在既有 Toolbar 扩展；新增展示组件可放 `src/common/components/` 或 `toolbar/components/`，不经由 ad-hoc 挂载进 `OrangeEditor` 根 DOM。  
- **Schema**：本功能不涉及 schema 变更。  
- **DI**：无新全局单例；剪贴板/弹窗为纯函数 + React 局部 state。  
- **State & data**：无新持久化 store；Modal 可见性为组件内 state 即可。  
- **Public API**：`package.json` exports 若无须对外暴露预览分享工具，可仅改内部 `runtimePreviewUrl` / Toolbar。  
- **Quality**：`rushx type-check`、`rushx lint`。

无 Complexity Tracking。

## Project Structure

### Documentation（本功能）

```text
specs/011-http-share-fallback/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── share-preview-link-flow.md
└── tasks.md   # /speckit.tasks
```

### Source Code（拟 touched）

```text
apps/web_builder/src/
├── utils/
│   └── runtimePreviewUrl.ts       # 多级复制策略；可导出小型纯函数
└── extensions/features/toolbar/components/
    ├── Toolbar.tsx                 # handleShareLink：编排复制结果与 Modal
    └── SharePreviewLinkModal.tsx   # 可选：独立 Modal（可读性）
```

**Structure Decision**：核心复制降级逻辑集中在 **`runtimePreviewUrl.ts`**（与 URL 构造同文件，避免散落）；Toolbar 负责 Toast 与 Modal 状态；若 Modal JSX 过长则抽 **`SharePreviewLinkModal.tsx`** 与 Toolbar 同目录。

## Phase 0 — Research

见 [research.md](./research.md)。

## Phase 1 — Design Artifacts

- [data-model.md](./data-model.md)  
- [contracts/share-preview-link-flow.md](./contracts/share-preview-link-flow.md)  
- [quickstart.md](./quickstart.md)  

## Phase 2 — 实施要点（供 /speckit.tasks）

1. 实现 `copyTextToClipboardRobust(text: string): Promise<boolean>`（或内联私有函数）：Clipboard API → `execCommand('copy')` 清理临时节点。  
2. 调整 `copyRuntimePreviewLink`：在 `no_url` 不变；有 URL 时调用上述函数；返回类型可扩展为 `'ok' | 'no_url' | 'clipboard_error'`（`clipboard_error` 仅当两种复制均失败）。  
3. `Toolbar.handleShareLink`：`ok` → 成功 Toast；`no_url` → 现有 warning；`clipboard_error` → 打开 Modal（展示 URL +「新标签页打开」+ 关闭）；`window.open` 失败时 Toast 提示（与 spec Edge 一致）。  
4. Modal 内 URL：`Typography` + `wordBreak: 'break-all'` + `maxHeight` + `overflow: 'auto'` 满足长链接可读。  
5. 连点分享：若 Modal 已开，可替换 URL 或忽略第二次点击——择一写入实现并记入 quickstart。  
6. **不**在成功路径弹出 Modal；HTTPS 下行为与现网一致或更稳（execCommand 兜底）。

---

**产出**：`plan.md`、`research.md`、`data-model.md`、`contracts/share-preview-link-flow.md`、`quickstart.md`；并已运行 `update-agent-context.sh cursor-agent`。
