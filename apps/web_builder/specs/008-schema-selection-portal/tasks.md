---
description: "Task list for 008-schema-selection-portal (leaf DOM + portal chrome)"
---

# Tasks: 画布叶节点直出 DOM，选中装饰 Portal 化

**Input**: Design documents from `D:\ai_coding\orangehome\main-monorepo\apps\web_builder\specs\008-schema-selection-portal\`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  

**Tests**: 规格未强制自动化测试；本列表以 **手工走查**（quickstart.md / spec SC-*）为主，不包含单独测试任务。

**Organization**: 按用户故事分阶段；**US2 依赖 US1**（叶节点宿主与 `data-schema-id` 就绪后再去外层壳并 Portal）；**US3 依赖 US2**（容器与叶节点共用覆盖层逻辑）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可与同阶段其他 **[P]** 任务并行（不同文件、无未完成依赖）
- **[Story]**：仅用户故事阶段任务携带 `[US1]` / `[US2]` / `[US3]`
- 描述中须含 **可执行的绝对或包内路径**（以下以 `apps/web_builder/` 为前缀）

## Path Conventions

- 本特性代码位于 Rush 包 **`apps/web_builder`**：`src/common/components/SchemaRenderer/`、`src/extensions/ui/center-canvas/`、`src/extensions/select-and-drag/components/`。

---

## Phase 1: Setup（共享准备）

**Purpose**：确认范围与验收口径，无新代码结构搭建。

- [x] T001 Review acceptance criteria and risks in `apps/web_builder/specs/008-schema-selection-portal/spec.md` and `apps/web_builder/specs/008-schema-selection-portal/plan.md`

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**：提供 **Portal 挂载目标** 与 **React Context**，使选中框与悬停层与画布 **同源 transform**；**在完成本阶段前不得开始 US1 实现任务**。

**⚠️ CRITICAL**：覆盖层未就绪时，无法完成「无包裹 + Portal」的叶节点交付。

- [x] T002 Add `EditorChromeOverlayContext` (e.g. `React.createContext` + hook) exposing overlay mount ref or element in new file `apps/web_builder/src/extensions/ui/center-canvas/context/EditorChromeOverlayContext.tsx` (or `components/` if you prefer no new folder)
- [x] T003 Mount an absolute `pointer-events: none` overlay root inside the scaled canvas content in `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` and wrap the subtree that contains `SelectableSchemaRenderer` with `EditorChromeOverlayContext.Provider`

**Checkpoint**：可在运行时拿到覆盖层 DOM 节点，供 `createPortal` 使用。

---

## Phase 3: User Story 1 — 叶节点 DOM 对齐 (Priority: P1) 🎯 MVP

**Goal**：减少 `SelectableSchemaNode` 与远程根之间的 **无语义嵌套**，为「根节点即宿主」铺路：`data-schema-id`、可测量 DOM、**去掉内层 `contentRef` 包裹**（相对当前实现少一层）。

**Independent Test**：在画布放置叶节点（如按钮），DevTools 中 **不再出现** `contentRef` 对应的内层包裹 `div`；`RemoteComponent` 根或单层外壳上可见 `data-schema-id`（与 `contracts/material-root-host.md` 一致）。

### Implementation for User Story 1

- [x] T004 [P] [US1] Extend `RemoteSchemaNode` in `apps/web_builder/src/common/components/SchemaRenderer/BaseComponents.tsx` to pass `data-schema-id={schema.id}` (and merge-safe DOM props) into `RemoteComponent`, plus optional `editorHostRef` / callback ref pattern for attaching `ResizeObserver` per `apps/web_builder/specs/008-schema-selection-portal/research.md` R3
- [x] T005 [US1] Refactor `SelectableSchemaNode` in `apps/web_builder/src/common/components/SchemaRenderer/SelectableComponents.tsx` to remove the inner `contentRef` wrapper `div`; keep at most **one** outer wrapper temporarily if required for stable hit-targets until US2 removes it; update measurement to use host element per `apps/web_builder/specs/008-schema-selection-portal/plan.md`

**Checkpoint**：US1 可独立演示「少一层 + schema id 可见」；完整「零编辑器壳」在 US2 完成。

---

## Phase 4: User Story 2 — 选中 / 悬停 / 手柄不依赖包裹根 (Priority: P2)

**Goal**：`SelectionBox` 与悬停轮廓经 **`createPortal`** 渲染到 Phase 2 覆盖层；**叶节点**去掉剩余编辑器外壳（或仅在无 ref 时保留研究文档中的 **最薄兜底**）；**几何**用宿主与覆盖层 `getBoundingClientRect` 差分 × `selectionRectVisualToLogical`。

**Independent Test**：叶节点选中时 `SelectionBox` 与边缘对齐；悬停虚线可见；拖拽 / 缩放 / 点击选中与改造前等价（spec SC-002、SC-003）。

### Implementation for User Story 2

- [x] T006 [US2] In `apps/web_builder/src/common/components/SchemaRenderer/SelectableComponents.tsx`, consume `EditorChromeOverlayContext`, portal-render `SelectionBox` from `apps/web_builder/src/extensions/select-and-drag/components/SelectionBox.tsx`, and compute `x/y/width/height` via overlay vs host rect delta × `selectionRectVisualToLogical`
- [x] T007 [US2] Move leaf hover outline off the wrapper `outline` styles into overlay-drawn chrome (same rect pipeline) in `apps/web_builder/src/common/components/SchemaRenderer/SelectableComponents.tsx`
- [x] T008 [US2] Remove the remaining leaf `SelectableSchemaNode` outer wrapper when host ref / `data-schema-id` target is stable; apply thin fallback host only if remote component cannot expose a DOM root per `apps/web_builder/specs/008-schema-selection-portal/research.md` R3
- [x] T009 [US2] Adjust `apps/web_builder/src/extensions/select-and-drag/components/SelectionBox.tsx` only if portaled parent requires prop/API tweaks (e.g. `pointer-events`, z-index); keep visual parity with pre-change behavior

**Checkpoint**：叶节点路径满足 spec FR-001 / FR-002 的主路径；容器在 US3 对齐。

---

## Phase 5: User Story 3 — 容器与子树 (Priority: P3)

**Goal**：`SelectableContainer` **保留单层** 子树挂载结构；**选中框**与叶节点 **共用** Portal + rect 逻辑；嵌套叶节点仍满足 US1/US2 的 DOM 与交互预期。

**Independent Test**：布局容器内两个叶节点分别可选中、可配置；容器自身可选中；无回归性误选（spec US3）。

### Implementation for User Story 3

- [x] T010 [US3] Refactor `SelectableContainer` in `apps/web_builder/src/common/components/SchemaRenderer/SelectableComponents.tsx` to portal-render `SelectionBox` (and container hover/selected chrome if still wrapper-based) using the same overlay context and rect math as leaf nodes
- [x] T011 [US3] Smoke nested layout in `apps/web_builder/src/common/components/SchemaRenderer/SelectableSchemaRenderer.tsx` + built-in container types (`apps/web_builder/src/common/base/schemaLayout.ts` / `isBuiltInLayoutContainerType` usage) to confirm child leaves use the new path and containers still recurse correctly

**Checkpoint**：US1–US3 在典型页面上均可独立验收。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**：质量门槛与规格走查。

- [x] T012 [P] Run `rushx type-check` and `rushx lint` for `apps/web_builder` from monorepo root per `apps/web_builder/specs/008-schema-selection-portal/plan.md`
- [ ] T013 [P] Execute manual validation in `apps/web_builder/specs/008-schema-selection-portal/quickstart.md` and map results to spec SC-001–SC-004
- [x] T014 Update `apps/web_builder/specs/008-schema-selection-portal/contracts/material-root-host.md` only if implementation diverges from the written contract (optional delta note)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- **US2** 依赖 **US1**：`RemoteSchemaNode` / 宿主测量约定（T004–T005）应在 Portal 去壳（T006–T008）前完成或同步不破坏构建。
- **US3** 依赖 **US2**：容器 Portal 复用叶节点已验证的覆盖层与坐标语义。

### User Story Dependencies

| Story | 依赖 |
|-------|------|
| US1 | Phase 2 完成 |
| US2 | US1（T004–T005）+ Phase 2 |
| US3 | US2 |

### Parallel Opportunities

- **T004 [P] [US1]** 与 **T002** 不同文件，但 **T004 须在 Phase 2 之后**；可与 **T005** 串行（T005 依赖 T004）。
- **T012 [P]** 与 **T013 [P]**（Phase 6）可并行执行。
- US3 内 **T010**、**T011** 均触及 `SelectableComponents.tsx` / 递归路径 — **建议串行**（先 T010 后 T011）。

---

## Parallel Example: Phase 6

```text
# 可同时进行：
Task T012 — rushx type-check / lint（apps/web_builder）
Task T013 — quickstart.md 手工步骤
```

---

## Implementation Strategy

### MVP First（最小可用）

1. 完成 **Phase 1–2**（覆盖层 + Context）  
2. 完成 **Phase 3 US1**（T004–T005）→ **STOP**：验证少一层 + `data-schema-id`  
3. 继续 **Phase 4 US2** 交付规格主目标（零叶节点壳 + Portal 装饰）

### Incremental Delivery

1. Phase 2 → 全故事可依赖的统一基础设施  
2. US1 → DOM 深度下降（渐进）  
3. US2 → 完整 FR-001/FR-002  
4. US3 → 容器一致性与嵌套回归  
5. Phase 6 → 合并门禁

### Suggested MVP Scope

- **MVP**：Phase 1–3（至 **T005**）— 可演示「结构更清晰」；**规格完全满足** 需包含 **Phase 4（US2）**。

---

## Notes

- 任务 ID 全局顺序 **T001–T014**；勾选时保持顺序便于审计。  
- 避免在 `SelectableSchemaRenderer.tsx` 引入与 schema 真源冲突的隐藏状态；覆盖层仅服务 **编辑器装饰**。  
- 若 `CenterCanvas.tsx` 结构变更较大，在 PR 说明中标注对 **画布缩放** 的回归范围。
