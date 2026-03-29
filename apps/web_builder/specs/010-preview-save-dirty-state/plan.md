# Implementation Plan: 编辑器「已保存」状态与预览前保存

**Branch**: `010-preview-save-dirty-state` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: `specs/010-preview-save-dirty-state/spec.md`

## Summary

为 Orange Editor 增加**文档是否与后端持久化一致**的会话状态（「脏 / 已对齐」）；在从服务端加载或**保存成功**后标记为已对齐；在**可编辑 schema 发生变更**（非「自持久化回填」类写入）时标记为未对齐。**预览**入口在打开前若未对齐，则**先执行与工具栏「保存」相同的持久化流程**，期间展示 **loading**，成功后再 `openPreview`；失败则提示且**不**打开预览。

**现状锚点**：`Toolbar.tsx` 中 `handleSave` 调用 `saveBuilderPageVersion` + `mutateBuilder`；预览按钮直接 `openPreview()`（`previewStore`）。`EditorBootstrap` 在拉取到 `pageVersion.pageSchema` 后 `setSchema(..., { record: false })`。`schemaStore.setSchema` 统一走 `historyService.record`（可选关闭）。

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Zustand（`schemaStore`、`previewStore`）、SWR（`useBuilderData`）、既有 `saveBuilderPageVersion`（`data/modules`）  
**Storage**: 无新增后端表；状态驻留前端 store  
**Testing**: `npm run type-check` / `rushx type-check`；关键路径手工走查（见 quickstart）  
**Target Platform**: 浏览器内编辑器 SPA  
**Project Type**: `apps/web_builder`  
**Performance Goals**: 预览前串行保存不阻塞 UI 主线程除预期 loading；避免每次按键全量 deep compare schema  
**Constraints**: 须与 Constitution 的 schema 变更路径一致；不重复实现第二套保存 HTTP 逻辑  
**Scale/Scope**: 单页编辑器会话；单用户单标签假设（多标签冲突见 research）

## Constitution Check

*GATE: Passed. Re-check after Phase 1.*

- **Extensions**：优先在 `core/store` 或 `data/modules` 边界扩展；预览/工具栏仅编排调用。  
- **Schema**：真源仍为 `schemaStore`；脏标记为派生会话状态，不写入 `ISchema`。  
- **State**：新状态放入 `src/core/store/` 具名单一职责 store（或经评审合并入 `schemaStore`），避免 Toolbar 私有 `useState` 成为唯一真源。  
- **API**：保存继续走 `src/data/modules` / 既有 API 封装。  
- **Quality**：`rushx type-check`、`rushx lint`。

无 Complexity Tracking。

## Project Structure

### Documentation（本功能）

```text
specs/010-preview-save-dirty-state/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── save-dirty-preview-flow.md
└── tasks.md   # /speckit.tasks
```

### Source Code（拟 touched）

```text
apps/web_builder/src/
├── core/store/
│   ├── schemaStore.ts              # 可选：setSchema 增加 meta 或订阅脏标记
│   └── documentSyncStore.ts        # 新建（推荐）：isDirty、markClean、markDirty
├── core/components/
│   └── EditorBootstrap.tsx         # 持久化 schema 应用后 markClean
├── extensions/features/toolbar/components/
│   └── Toolbar.tsx                 # 保存成功 markDirty→clean；预览前 save-if-dirty + loading
├── data/modules/                   # 可选抽取 saveBuilderPageVersion 封装供复用
```

**Structure Decision**：新增 **`documentSyncStore`**（或等价命名）持有 `isDirty`；`setSchema` 通过 **显式 option**（如 `source: 'persistence' | 'user-edit' | ...`）区分是否触脏，避免把 `record: false` 与「是否脏」语义绑死。

## Phase 0 — Research

见 [research.md](./research.md)。

## Phase 1 — Design Artifacts

- [data-model.md](./data-model.md)  
- [contracts/save-dirty-preview-flow.md](./contracts/save-dirty-preview-flow.md)  
- [quickstart.md](./quickstart.md)  

## Phase 2 — 实施要点（供 /speckit.tasks）

1. **定义 `isDirty` 语义**：`false` = 当前 `schemaStore.schema` 已与**最近一次成功 `saveBuilderPageVersion` 或本次会话初始加载的 pageVersion** 对齐（见 research 快照策略）。  
2. **`setSchema` 契约扩展**：为 `EditorBootstrap` 回填、`handleSave` 成功写回后设 `markClean()`；其余默认 `markDirty()`（含导入 JSON、属性面板、画布编辑、**undo/redo**——MVP 可先「凡变更即脏」，精精确对齐快照为后续增强）。  
3. **抽取 `performSave()`**：与 `Toolbar.handleSave` 共用（返回 success/failure，供预览路径 `await`）。  
4. **预览**：包装 `openPreview` 调用处（主要在 `Toolbar`）：若 `isDirty`，`setPreviewPreparing(true)` + `await performSave()`，成功则 `openPreview()`，失败 Toast + 不打开；`finally` 清 loading。  
5. **加载竞态**：`EditorBootstrap` 在 `setSchema` 来自服务端版本应用完成后 `markClean()`；避免用户编辑过程中 SWR 重验覆盖导致脏标误清（见 research）。  
6. **回归**：保存失败不清脏；已对齐时点预览不触发保存。

---

**产出**：`plan.md`、`research.md`、`data-model.md`、`contracts/save-dirty-preview-flow.md`、`quickstart.md`。
