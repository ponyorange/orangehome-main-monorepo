---
description: "Task list — 右侧 Inspector 面板（003-right-panel-inspector-ui）"
---

# Tasks: 右侧配置面板（Inspector 参考稿）

**Input**: `specs/003-right-panel-inspector-ui/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md ✅ spec.md ✅  

**Tests**: 规格未强制 TDD；本列表不含单独测试任务。合并前运行 `rushx type-check` / `rushx lint`（见 Polish）。

**Organization**: 按用户故事分阶段；路径相对于 Rush 包根目录 `apps/web_builder/`。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: `[US1]` / `[US2]` / `[US3]` 对应 spec 用户故事

---

## Phase 1: Setup（共享准备）

**Purpose**: 建立实现目录与基线，无业务逻辑。

- [x] T001 Create directory `apps/web_builder/src/extensions/features/properties-panel/components/inspector/` and add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/index.ts` barrel re-exporting public inspector components

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 参考稿壳层与分段控件；完成前不应在 `PropertiesPanel.tsx` 做大块拼装。

**⚠️ CRITICAL**: User Story 实现阶段依赖本阶段组件与样式。

- [x] T002 [P] Add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/inspector.module.css` with panel/header/segmented/section/body scrollbar tokens mapped from `refer_ui/component-inspector-panel1.0.html` and existing `var(--theme-*)` where possible
- [x] T003 [P] Add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/InspectorSection.tsx` (section title strip + children; matches contracts/ui-inspector-panel.md Section)
- [x] T004 [P] Add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/InspectorFormGrid.tsx` (two-column grid: right-aligned label column ~88px, control column `min-width:0`)
- [x] T005 Add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/InspectorSegmentedTabs.tsx` (`role="tablist"`, two tabs 配置/信息, controlled `activeKey`, `aria-selected`/`aria-controls`/`id` wiring per research.md R6)
- [x] T006 Add `apps/web_builder/src/extensions/features/properties-panel/components/inspector/InspectorShell.tsx` (outer card, header slot with left accent bar, subtitle, segmented area, scrollable body; depends on T002–T005 styles/components)

**Checkpoint**: Inspector 壳可 Storybook/临时挂载验证外观后再改 `PropertiesPanel.tsx`。

---

## Phase 3: User Story 1 — 「配置」统一视图 (Priority: P1) 🎯 MVP

**Goal**: 头部标题区 + 「配置」|「信息」分段（可先仅渲染「配置」内容）+ 「属性配置」「样式配置」分组 + 既有表单绑定不变。

**Independent Test**: 选中单组件 → 「配置」下可见两分组；改一项样式画布与撤销仍正确（`quickstart.md`）。

### Implementation for User Story 1

- [x] T007 [US1] Refactor `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx` to render `InspectorShell` + `InspectorSegmentedTabs` with default tab **配置**; set header title/subtitle per spec (use existing `headerTitle` / `selectedNode.type` logic)
- [x] T008 [US1] In `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx`, wrap existing `PropertyForm` or `EditorConfigPropsForm` branch inside `InspectorSection` titled **属性配置** under 配置 tabpanel
- [x] T009 [US1] In `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx`, wrap `StyleForm` inside `InspectorSection` titled **样式配置** under the same 配置 tabpanel
- [x] T010 [US1] Update `apps/web_builder/src/extensions/features/properties-panel/components/PropertyForm.tsx` to use `InspectorFormGrid` (or equivalent props) for field rows so labels align per `refer_ui/component-inspector-panel1.0.html`
- [x] T011 [US1] Update `apps/web_builder/src/extensions/features/properties-panel/components/StyleForm.tsx` for `InspectorFormGrid` layout and color rows (swatch + text input) per `refer_ui/component-inspector-panel1.0.html` and research.md R3

**Checkpoint**: MVP — 仅「配置」Tab 可用即可对外演示；「信息」可为占位空壳但不得破坏布局。

---

## Phase 4: User Story 2 — 「信息」分区与 Schema (Priority: P2)

**Goal**: 信息 Tab：组件 ID、Type 徽章、只读 Schema 预览；可编辑 Schema 经 Modal 保留原 `MonacoSchemaEditor` 行为。

**Independent Test**: 切换「信息」→ 只读 JSON 与节点一致；Modal 编辑合法 JSON 后画布同步（`quickstart.md`）。

### Implementation for User Story 2

- [x] T012 [US2] In `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx`, implement **信息** tabpanel: key-value rows for 组件 ID and 组件 Type badge + titled read-only schema block (`pre` or read-only Monaco) per `contracts/ui-inspector-panel.md`
- [x] T013 [US2] In `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx`, add **编辑 Schema** button opening `Modal` with existing `apps/web_builder/src/extensions/features/properties-panel/components/MonacoSchemaEditor.tsx` reusing `schemaText` / `schemaError` / `handleSchemaChange` from research.md R1
- [x] T014 [US2] Remove legacy `Tabs`/`TabPane` (属性/样式/Schema) from `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx` after 配置/信息 parity and regression pass

**Checkpoint**: 与 spec FR-002–FR-004 对齐；无第二套 schema 写入口。

---

## Phase 5: User Story 3 — 滚动、键盘与可访问性 (Priority: P3)

**Goal**: 内容区滚动、顶栏固定、键盘与屏幕阅读器可用。

**Independent Test**: 键盘切换 Tab、焦点可见；仅 body 滚动（`spec.md` User Story 3）。

### Implementation for User Story 3

- [x] T015 [US3] Complete `aria-controls`/`id` pairing between `InspectorSegmentedTabs.tsx` and tabpanels in `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx`; ensure form fields keep `htmlFor` or `aria-labelledby` per FR-007
- [x] T016 [US3] Adjust `apps/web_builder/src/extensions/features/properties-panel/components/inspector/InspectorShell.tsx` so header + segmented stay fixed and only inspector body scrolls (match `refer_ui/component-inspector-panel1.0.html` inspector__body behavior; coordinate with `RightPanel` `overflow` if needed)
- [x] T017 [US3] Harden empty selection UI in `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx` (no stale ID/Type/schema when `selectedNode` null; clear tab state or disable segmented per data-model.md)

**Checkpoint**: a11y 与滚动走查通过。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 全局微调、质量门禁、文档验收。

- [x] T018 [P] Optional: widen right `aside` in `apps/web_builder/src/core/components/EditorView.tsx` toward ~350px per plan.md / FR-001; verify canvas layout
- [x] T019 Run `rushx type-check` and `rushx lint` from `apps/web_builder`
- [x] T020 Execute manual validation steps in `apps/web_builder/specs/003-right-panel-inspector-ui/quickstart.md` and note results in PR description

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- **US2** 依赖 **US1**：共用 `PropertiesPanel.tsx` 与分段骨架，需先稳定「配置」。
- **US3** 依赖 **US1–US2**：在完整双 Tab 上完善 a11y/滚动。

### Parallel Opportunities

- **Phase 2**: T002、T003、T004 可并行；T005、T006 顺序执行（T006 最后）。
- **Phase 6**: T018 可与 T019 并行（不同关注点），但 T019 应在提交前执行。

### Parallel Example: Phase 2

```text
T002 inspector.module.css
T003 InspectorSection.tsx
T004 InspectorFormGrid.tsx
→ then T005 InspectorSegmentedTabs.tsx → T006 InspectorShell.tsx
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. Phase 1 + Phase 2  
2. Phase 3（T007–T011）  
3. **STOP**：按 `quickstart.md` 验证「配置」路径与撤销  
4. 再开 Phase 4–6  

### Incremental Delivery

- 增量 1：Foundational + US1（可演示）  
- 增量 2：US2（信息 + Modal 编辑）  
- 增量 3：US3 + Polish  

---

## Notes

- 不改变 `apps/web_builder/src/extensions/features/properties-panel/index.ts` 插槽注册方式（`right-panel:content`）。  
- 所有 schema 写入仍经 `schemaStore` + `schemaOperator` / 现有 `handleSchemaChange`。  
- 无 `.specify/extensions.yml` 时无 hooks。
