---
description: "Task list — 右键菜单锚定指针位置（005）"
---

# Tasks: 右键菜单锚定指针位置

**Input**: `specs/005-context-menu-follow-pointer/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md ✅ spec.md ✅  

**Tests**: 规格以手工走查为主；未强制 Vitest（Polish 阶段可选）。

**路径前缀**: `apps/web_builder/`（Rush 包根）。

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup（坐标来源确认）

**Purpose**：确认无需改环境；右键坐标仍来自视口 `clientX`/`clientY`。

- [x] T001 [P] Audit `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx`: confirm `handleContextMenu` sets `contextMenuState` with `x: event.clientX` and `y: event.clientY`; if scroll-related offset bugs appear during quickstart, document and fix in same file or in `ContextMenu.tsx` in later tasks

---

## Phase 2: Foundational（放置算法）

**Purpose**：单一纯函数供 `ContextMenu`（及未来入口）复用，满足 contract 翻转 + 夹取。

- [x] T002 Implement `resolveContextMenuPlacement` (or equivalent export name) in `apps/web_builder/src/utils/contextMenuPlacement.ts` per `apps/web_builder/specs/005-context-menu-follow-pointer/contracts/context-menu-placement.md` — use viewport padding **8** (research R2), horizontal/vertical flip then clamp, handle menu larger than viewport per contract

**Checkpoint**: 可在控制台 `import` 函数并用假参数打印 `{left,top}` 后再接 UI。

---

## Phase 3: User Story 1 — 指针锚定打开 (Priority: P1) 🎯 MVP

**Goal**：菜单以本次右键的视口坐标为默认锚点；打开后不因指针移动而漂移（FR-001、FR-003）。

**Independent Test**：画布中央右键 → 菜单出现在指针附近；移动鼠标菜单不跟拖。

### Implementation for User Story 1

- [x] T003 [US1] Refactor `apps/web_builder/src/extensions/editing/context-menu/components/ContextMenu.tsx` to store `left`/`top` state, render menu with `position: fixed`, run `useLayoutEffect` after mount to read `menuRef.current` width/height, call `resolveContextMenuPlacement` with `x`/`y` props and `window.innerWidth`/`innerHeight`, update position; remove `adjustedX`/`adjustedY` based on `200` and `menuItems.length * 36`

**Checkpoint**: MVP — 中央区域右键行为正确即可。

---

## Phase 4: User Story 2 — 边角与视口可见性 (Priority: P2)

**Goal**：四角与滚动后可见区域内右键，菜单完整可点（FR-002、SC-002）。

**Independent Test**：按 `quickstart.md` 步骤 2–4 走查，无大面积裁切。

### Implementation for User Story 2

- [x] T004 [US2] Execute `apps/web_builder/specs/005-context-menu-follow-pointer/quickstart.md` steps 2–4; for any remaining clipping at viewport edges or after canvas scroll, adjust `apps/web_builder/src/utils/contextMenuPlacement.ts` and/or `apps/web_builder/src/extensions/editing/context-menu/components/ContextMenu.tsx` until corners and scroll scenarios pass

---

## Phase 5: User Story 3 — 复用与一致 (Priority: P3)

**Goal**：放置逻辑单源；未来第二处右键菜单复用同一 util（FR-004、plan Story 3）。

**Independent Test**：`src` 内无第二套硬编码 `position: fixed` 右键菜单坐标逻辑，或已在 PR/plan 注明排除项。

### Implementation for User Story 3

- [x] T005 [US3] Add file-level comment at top of `apps/web_builder/src/utils/contextMenuPlacement.ts` requiring future context menus to reuse `resolveContextMenuPlacement`; search `apps/web_builder/src` for `onContextMenu` / other fixed context menus and either refactor to the util or document exclusion in `apps/web_builder/specs/005-context-menu-follow-pointer/plan.md`

---

## Phase 6: Polish & Cross-Cutting

**Purpose**：质量门禁与验收记录。

- [x] T006 Run `rushx type-check` and `rushx lint` from `apps/web_builder`
- [x] T007 Walk through `apps/web_builder/specs/005-context-menu-follow-pointer/quickstart.md` (full list including regression §) and record results in PR or commit message

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6**
- **US2** 依赖 **US1** 的可运行菜单与测量逻辑；**US3** 可在 US2 稳定后进行。

### Parallel Opportunities

- **Phase 1**: T001 可与后续 **T002** 并行（不同文件），但 **T003** 必须在 **T002** 完成后开始。

### Parallel Example

```text
T001 CenterCanvas.tsx (audit)
T002 contextMenuPlacement.ts
→ T003 ContextMenu.tsx
```

---

## Implementation Strategy

### MVP

1. Phase 1 + 2 + 3（T001–T003）  
2. 中央区域右键验收  

### Incremental

- 增量 1：几何 util + `ContextMenu` 测量接线  
- 增量 2：边角/滚动细调、复用注释与全仓排查、门禁与 quickstart 记录  

---

## Notes

- 无 `.specify/extensions.yml` 则无 hooks。  
- 可选 Vitest：若仓库已有对 `src/utils` 的单测惯例，可在 T002 后增加 `apps/web_builder/src/utils/contextMenuPlacement.test.ts`（本 `tasks.md` 未列为必选任务）。
