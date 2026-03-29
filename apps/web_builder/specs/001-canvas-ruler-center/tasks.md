---
description: "Task list for 画布与横向标尺视口内水平居中"
---

# Tasks: 画布与横向标尺视口内水平居中

**Input**: Design documents from `/specs/001-canvas-ruler-center/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: 规格未强制自动化测试；本列表不含 Vitest 任务（可选在 Polish 阶段自加）。

**Organization**: 按用户故事分阶段；共享实现集中在 Foundational（T003），US1/US2 以验收与回归为主。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成前置）
- **[Story]**: 用户故事阶段任务使用 `[US1]` / `[US2]`
- 描述中须含确切文件路径

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 对齐验收标准与契约，确认改动范围

- [x] T001 Read `specs/001-canvas-ruler-center/spec.md` and `specs/001-canvas-ruler-center/plan.md` for FR/SC and target file `src/extensions/ui/center-canvas/components/CenterCanvas.tsx`
- [x] T002 [P] Read `specs/001-canvas-ruler-center/research.md` and `specs/001-canvas-ruler-center/contracts/layout-canvas-column.md` for ResizeObserver decision and layout invariants

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共用的布局修复；完成前不进行分故事验收闭环

**⚠️ CRITICAL**: 须先完成本阶段再标记 US1/US2 验收通过

- [x] T003 In `src/extensions/ui/center-canvas/components/CenterCanvas.tsx` attach `ResizeObserver` to the scroll container element referenced by `scrollRef`, batch measurements with `requestAnimationFrame`, recompute `canvasLeftOffset` using `Math.max(CANVAS_MARGIN, (clientWidth - CANVAS_WIDTH * zoom) / 2)` (same formula as today), disconnect observer on unmount; deduplicate or remove `window` `resize` listener if fully redundant

**Checkpoint**: 代码已能在列宽变化时重算偏移，可进入分故事验收

---

## Phase 3: User Story 1 - 窗口变窄时画布与横向标尺仍居中 (Priority: P1) 🎯 MVP

**Goal**: 浏览器窗口宽度变化时，画布与横向标尺在中间画布列内保持水平居中（见 spec US1）。

**Independent Test**: 仅调整浏览器窗口宽度（侧栏常规展开），观察画布与横向标尺是否仍居中（`quickstart.md` P1）。

### Implementation for User Story 1

- [x] T004 [US1] In `src/extensions/ui/center-canvas/components/CenterCanvas.tsx` verify `zoom` changes still trigger `canvasLeftOffset` recalculation via existing `useEffect` and that `RulerX` remains aligned using `scrollX - canvasLeftOffset` after T003
- [ ] T005 [US1] Run manual checks in `specs/001-canvas-ruler-center/quickstart.md` **P1** (window width + zoom) and confirm spec acceptance scenarios

**Checkpoint**: US1 可独立演示为 MVP

---

## Phase 4: User Story 2 - 侧栏宽度变化后仍居中 (Priority: P2)

**Goal**: 固定浏览器宽度下，侧栏显隐/宽度导致中间列变化时仍居中（见 spec US2）。

**Independent Test**: `quickstart.md` **P2**（固定窗口、切换侧栏状态）。

### Implementation for User Story 2

- [x] T006 [US2] Execute `specs/001-canvas-ruler-center/quickstart.md` **P2**; if middle column width does not change when toggling panels (e.g. fixed aside widths in `src/core/components/EditorView.tsx`), append a short **Known limitation** subsection to `specs/001-canvas-ruler-center/plan.md` linking that file and describing follow-up scope

**Checkpoint**: US2 验收完成或已知限制已文档化

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 质量门与契约一致

- [x] T007 From `apps/web_builder` run `rushx type-check` and `rushx lint`; fix any issues in `src/extensions/ui/center-canvas/components/CenterCanvas.tsx` (and any touched files)
- [x] T008 [P] If shipped behavior differs from `specs/001-canvas-ruler-center/contracts/layout-canvas-column.md`, update `specs/001-canvas-ruler-center/contracts/layout-canvas-column.md` to match reality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5**
- **US2** 依赖 **T003**：与 US1 共用同一实现；P2 验收可在 P1 通过后执行

### User Story Dependencies

- **US1**: 依赖 Phase 2 完成（T003）
- **US2**: 依赖 Phase 2 完成；与 US1 并行验收可行（同一构建）

### Parallel Opportunities

- **Phase 1**: T001 与 T002 [P] 可由不同人员并行阅读
- **Phase 5**: T007 完成后 T008 [P] 可独立编辑契约文档

---

## Parallel Example: Phase 1

```bash
# 并行阅读不同文档：
Task: "T001 Read specs/001-canvas-ruler-center/spec.md and plan.md ..."
Task: "T002 [P] Read specs/001-canvas-ruler-center/research.md and contracts/layout-canvas-column.md ..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2（T001–T003）
2. Complete Phase 3（T004–T005）并执行 `quickstart.md` P1
3. **STOP**：可发布/演示 MVP（窗口缩放场景）

### Incremental Delivery

1. MVP 如上
2. Phase 4（T006）：侧栏场景与已知限制记录
3. Phase 5（T007–T008）：类型检查、lint、契约同步

---

## Notes

- 主改动文件：`src/extensions/ui/center-canvas/components/CenterCanvas.tsx`
- 任务格式校验：每项均为 `- [ ] Tnnn ...`，用户故事任务含 `[US1]`/`[US2]`，可并行项标 `[P]`
