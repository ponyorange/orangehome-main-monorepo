# Tasks: 拖动组件到容器上方添加组件、计算鼠标落点、单击添加组件到选中容器

**Input**: Design documents from `/specs/013-drag-drop-component-addition/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, quickstart.md

**Tests**: Manual testing only per feature scope. No automated test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Orange Editor monorepo package**: `apps/web_builder/src/` — `core/` (editor, container, stores, services), `extensions/` (UI + features), `common/`, `components/`, `data/` (api, modules), `types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing code and prepare for modifications

- [x] T001 分析现有 `useCanvasDrop.ts` 实现，理解 `findDropTarget` 命中测试逻辑
- [x] T002 分析现有 `ComponentPanel.tsx`/`DraggableComponentItem.tsx` 实现，理解物料项渲染和事件处理
- [x] T003 分析 `CenterCanvas.tsx` 如何获取画布缩放因子和渲染画布区域

---

## Phase 2: User Story 1 - 拖动组件到容器上方自动添加 (Priority: P1) 🎯 MVP

**Goal**: 拖动组件时智能识别下方容器，显示视觉反馈，并添加到正确容器内

**Independent Test**: 拖动组件到容器上方时，容器显示蓝色边框高亮，释放后组件出现在容器内正确位置

### Implementation for User Story 1

- [x] T004 [US1] 在 `useCanvasDrop.ts` 中增强 `handleDrop` 函数，添加坐标计算和精确落点
- [x] T005 [P] [US1] `CenterCanvas.tsx` 已有 `dropTargetId` 视觉反馈逻辑（设置 data-drop-target 属性）
- [x] T006 [US1] 在 `CenterCanvas.tsx` 中添加高亮CSS样式（2px solid #1890ff 边框 + rgba背景）
- [x] T007 [US1] 嵌套容器识别已在 `findDropTarget` 中实现（优先返回最内层容器）

**Checkpoint**: User Story 1 完成 - 拖动到容器上方时有视觉反馈，组件正确添加到容器内

---

## Phase 3: User Story 2 - 组件精确落在鼠标位置 (Priority: P1)

**Goal**: 组件被添加时精确落在鼠标释放位置，考虑画布缩放因子

**Independent Test**: 在不同画布缩放比例下（50%, 100%, 200%），组件左上角与鼠标位置偏差 <5像素

### Implementation for User Story 2

- [x] T008 [US1] 在 `useCanvasDrop.ts` 的 `handleDrop` 中添加坐标转换逻辑：
  - 计算鼠标相对于目标容器的视觉坐标
  - 转换视觉坐标到逻辑坐标（考虑画布缩放因子）
  - 设置新组件的 `position.x` 和 `position.y`
- [x] T009 [US1] 处理容器内的相对坐标计算（通过 targetRect.left/top 计算相对位置）
- [x] T010 [US1] 在创建 newSchema 时直接设置计算后的 position

**Checkpoint**: User Story 2 完成 - 组件落点精确，坐标转换正确

---

## Phase 4: User Story 3 - 单击添加组件到选中容器 (Priority: P2)

**Goal**: 单击物料面板组件，将其添加到当前选中的容器（或根画布）

**Independent Test**: 选中容器后单击物料项，组件被添加到该容器内，位置为 (20,20) 或递增偏移

### Implementation for User Story 3

- [x] T011 [P] [US3] 在 `DraggableComponentItem.tsx` 中添加 `onClick` 事件处理（与现有 `onMouseDown` 并行）
- [x] T012 [US3] 实现 `handleClick` 函数：
  - 获取 `selectionStore.selectedIds[0]` 作为目标
  - 检查目标是否为容器（使用 `isDropContainerNode`）
  - 如果不是容器或没有选中，则使用根schema作为目标
- [x] T013 [US3] 实现位置防重叠算法（`findNonOverlappingPosition`）：
  - 初始位置 (20, 20)
  - 检查该位置是否已被占用（遍历目标容器子组件的 style.top/left）
  - 如果占用则向右下递增偏移 (20, 20) 直到找到空位
- [x] T014 [US3] 生成新组件schema（复用 `generateIdWithPrefix` 和 `withDefaultFloatingLayerStyleForNewNode`）
- [x] T015 [US3] 调用 `addChild` 更新schema，并自动选中新组件

**Checkpoint**: User Story 3 完成 - 单击物料面板可添加组件到选中容器

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 代码优化、质量验证和文档更新

- [x] T016 [P] TypeScript类型检查通过 (`npm run type-check`)
- [~] T017 [P] ESLint检查 (环境编码问题，已跳过)
- [x] T018 边缘情况处理已在代码中实现：
  - `findDropTarget` 会跳过非容器组件查找父容器
  - 单击添加使用 `findNonOverlappingPosition` 防止位置重叠
- [x] T019 `quickstart.md` 已包含完整测试步骤
- [~] T020 手动测试需在浏览器中执行（见下方测试步骤）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (US1)**: Depends on Phase 1 - 容器识别和视觉反馈
- **Phase 3 (US2)**: Depends on Phase 2 (US1) - 在US1基础上添加坐标计算
- **Phase 4 (US3)**: Depends on Phase 1 - 独立功能，但建议US1完成后开始
- **Phase 5 (Polish)**: Depends on all user stories completion

### Within Each User Story

- US1: T004 → T005/T006/T007 (T005/T006可并行)
- US2: T008 → T009 → T010
- US3: T011/T012 → T013 → T014 → T015 (T011可与其他并行)

### Parallel Opportunities

- T001, T002, T003 (Phase 1 代码分析) 可并行
- T005, T006 (US1 视觉反馈) 可并行
- T011 (US3 添加onClick) 可与US2任务并行
- T016, T017, T019 (Phase 5 质量检查) 可并行

---

## Parallel Example: User Story 1 + 2

```bash
# 在 Phase 2 (US1) 中可并行执行:
Task: "T005 [P] [US1] 在 CenterCanvas.tsx 中添加容器高亮样式渲染逻辑"
Task: "T006 [P] [US1] 在 CenterCanvas.tsx 中添加高亮CSS样式"

# 在 Phase 3 (US2) 中顺序执行:
Task: "T008 [US1] 在 useCanvasDrop.ts 的 handleDrop 中添加坐标转换逻辑"
Task: "T009 [US1] 处理容器内的相对坐标计算"
Task: "T010 [US1] 覆盖默认位置为新计算的坐标"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup - 代码分析
2. Complete Phase 2: US1 - 容器识别和视觉反馈
3. Complete Phase 3: US2 - 精确落点计算
4. **STOP and VALIDATE**: 测试拖动添加和落点精度
5. Deploy/demo if ready (核心功能已完成)

### Incremental Delivery

1. Setup → US1 + US2 → Deploy (MVP - 完整的拖拽体验)
2. Add US3 → Deploy (增强 - 单击添加)
3. Polish → Deploy (优化 - 质量完善)

### Recommended Execution Order

由于US1和US2紧密相关（都是拖拽功能），建议一起完成：

1. T001, T002, T003 (分析现有代码)
2. T004, T005, T006, T007 (US1 基础功能)
3. T008, T009, T010 (US2 坐标计算)
4. T011, T012, T013, T014, T015 (US3 单击添加)
5. T016-T020 (质量验证)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1和US2紧密耦合，建议一起完成
- US3可独立实现，但建议等拖拽功能稳定后开始
- 所有坐标计算必须考虑画布缩放因子
- 视觉反馈样式参考规格：2px solid #1890ff + rgba(24,144,255,0.1)背景
