# Implementation Plan: Schema JSON 编辑器剪贴板快捷键与跨应用复制粘贴

**Branch**: `012-schema-json-clipboard` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)  
**Input**: `specs/012-schema-json-clipboard/spec.md`

## Summary

当前画布层存在全局键盘快捷键（`KeyboardShortcuts.tsx`）并在 `document` 级别拦截 `Ctrl/⌘+C/V/X` 用于组件复制粘贴；但「编辑 Schema」弹窗内的 JSON 编辑器（Monaco）也需要同样快捷键用于**文本**编辑，从而产生冲突。\n\n本功能在 **Schema JSON 编辑器拥有焦点** 时确保复制/粘贴按文本语义工作：\n- 支持编辑器内复制/粘贴\n- 支持外部 → 编辑器粘贴\n- 支持编辑器 → 外部复制\n- 同时避免触发画布层组件复制/粘贴。\n\n技术路线：在 `MonacoSchemaEditor.tsx` 为 Monaco 注册复制/粘贴/剪切命令并主动 `preventDefault` + `stopPropagation`，同时在全局 `KeyboardShortcuts.tsx` 增加“若事件来自 Monaco 编辑器/其 DOM”则不处理的防护（双保险，避免未来改动导致回归）。\n\n## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: monaco-editor、Semi Design（弹窗容器）、Zustand（画布剪贴板 store 与快捷键）  
**Storage**: 无  
**Testing**: `rushx type-check` / `npm run type-check`；手工走查（Windows/macOS：编辑器内复制粘贴、外部互通、画布不误触）  
**Target Platform**: 现代桌面浏览器（Chromium / Firefox / Safari 主版本）  
**Project Type**: `apps/web_builder` SPA  
**Performance Goals**: 大文本粘贴不出现不可恢复卡死（允许短暂卡顿）；不引入 document 级高频轮询  
**Constraints**: 不改变画布层既有快捷键逻辑，只在编辑器焦点态让位；不引入新的全局单例  
**Scale/Scope**: 仅「编辑 Schema」弹窗内 `MonacoSchemaEditor`（`PropertiesPanel.tsx`）对应的 JSON 编辑区域

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Per `.specify/memory/constitution.md` (Orange Editor / `@orangehome/web_builder`):

- **Extensions**: UI/feature work uses `IExtension` + `SlotRegistry` (no ad-hoc core DOM mounts).
- **Schema**: Document changes flow through `ISchema` and approved mutation paths / stores.
- **DI**: Shared services use Inversify; no new undocumented globals/singletons.
- **State & data**: Stores under `src/core/store/` or justified new store; HTTP via
  `src/data/api/` and env-based base URL.
- **Public API**: Exported surface matches `package.json` `exports` / `src/index.ts`; breaking
  exports/versioning called out.
- **Quality**: Plan lists `rushx type-check`, `rushx lint`, and tests when required.

If any gate cannot be met, complete **Complexity Tracking** below with justification.

## Project Structure

### Documentation（本功能）

```text
specs/012-schema-json-clipboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── schema-json-clipboard-flow.md
└── tasks.md   # /speckit.tasks
```

### Source Code（拟 touched）

```text
apps/web_builder/src/
├── extensions/features/properties-panel/components/
│   ├── PropertiesPanel.tsx      # 现有：打开「编辑 Schema」Modal
│   └── MonacoSchemaEditor.tsx   # Monaco 初始化处：注册 copy/paste/cut 命令 + stopPropagation
└── extensions/editing/keyboard-shortcuts/components/
    └── KeyboardShortcuts.tsx    # 全局快捷键：识别 Monaco 焦点/DOM 后直接 return
```

**Structure Decision**：优先在 `MonacoSchemaEditor.tsx` 内解决（贴近焦点与编辑器实例）；`KeyboardShortcuts.tsx` 作为统一兜底，避免未来新增编辑器输入区域时重复踩坑。

## Phase 0 — Research

见 [research.md](./research.md)。

## Phase 1 — Design Artifacts

- [data-model.md](./data-model.md)  
- [contracts/schema-json-clipboard-flow.md](./contracts/schema-json-clipboard-flow.md)  
- [quickstart.md](./quickstart.md)  

## Phase 2 — 实施要点（供 /speckit.tasks）

1. 在 `MonacoSchemaEditor.tsx` 创建 editor 后，使用 Monaco 的 `addCommand`（或 `editor.addAction`）注册：复制/粘贴/剪切，回调内 `e.preventDefault()` + `e.stopPropagation()`（或至少在 DOM keydown 层 stopPropagation）确保不会冒泡到 document 全局快捷键。\n2. 使用 `navigator.clipboard` 或 `document.execCommand` 进行读写剪贴板时，遵循浏览器权限差异；在失败时不破坏编辑器现有文本（只给提示）。\n3. 在 `KeyboardShortcuts.tsx` 的 handler 里增加「如果事件 target 位于 Monaco 编辑器 DOM 内」或「当前 activeElement 属于 Monaco」则直接 return（避免 document 监听劫持）。\n4. 复用现有 JSON 校验链（`PropertiesPanel.handleSchemaChange`：JSON.parse + validate），确保非法粘贴仅提示不更新画布。\n5. 回归：画布选中组件时 Ctrl/⌘+C/V 仍是组件复制粘贴；但当 JSON 编辑器聚焦时必须按文本语义工作。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
