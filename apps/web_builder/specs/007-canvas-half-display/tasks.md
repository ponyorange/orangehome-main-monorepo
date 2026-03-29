---
description: "Task list — 编辑区半屏展示，逻辑幅面 750（007）"
---

# Tasks: 编辑区画布半屏展示（逻辑仍 750）

**Input**: `specs/007-canvas-half-display/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md ✅ spec.md ✅  

**Tests**: 规格以手工走查为主；合并前 `rushx type-check` / `rushx lint`（Polish）。

**路径前缀**: `apps/web_builder/`（Rush 包根）。

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup（对齐合同与现状）

**Purpose**：实现前确认 006 逻辑幅面合同与 007 视口展示合同的分工，并标出滚动/居中需改用「视觉尺寸」的位置。

- [x] T001 [P] Read `apps/web_builder/specs/006-canvas-750x1334-rulers/contracts/editor-canvas-artboard.md` and `apps/web_builder/specs/007-canvas-half-display/contracts/editor-viewport-display-scale.md`; skim `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` for `scaledWidth`/`scaledHeight`/`scrollLeft`/ `contentEl.style.minWidth` usage and note in PR which expressions must use **visual** vs **logical** size per `research.md` R1

---

## Phase 2: Foundational（视口展示常量）

**Purpose**：单一真相导出 `EDITOR_VIEWPORT_SCALE`，供画布与交互共用。

- [x] T002 Add `EDITOR_VIEWPORT_SCALE = 0.5` to `apps/web_builder/src/constants/editorCanvasArtboard.ts` with a short comment pointing to `apps/web_builder/specs/007-canvas-half-display/contracts/editor-viewport-display-scale.md` (keep existing `EDITOR_CANVAS_WIDTH` / `EDITOR_CANVAS_HEIGHT` unchanged)

**Checkpoint**: 无业务组件内联魔法数 `0.5` 指代该策略（除测试或文档示例外）。

---

## Phase 3: User Story 1 — 视觉约半屏，逻辑排版不变 (Priority: P1) 🎯 MVP

**Goal**：中心白底区域屏幕线性尺寸约为改造前同 zoom 下的 **~50%**；内层仍以 **750×1334×zoom** 排版 schema（FR-001/FR-002）。

**Independent Test**：默认 zoom 下肉眼对比改造前后占地；属性中全宽仍为 750 语义；`quickstart.md` 第 1–2 节。

### Implementation for User Story 1

- [x] T003 [US1] Refactor `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx`: define `layoutLogicalW = EDITOR_CANVAS_WIDTH * zoom`, `layoutLogicalH = EDITOR_CANVAS_HEIGHT * zoom`, `layoutVisualW/H = layoutLogicalW/H * EDITOR_VIEWPORT_SCALE`; use **visual** dimensions for scroll container sizing/centering (`contentEl.style.minWidth`, `targetSl` / `scrollLeft` sync, `minHeight` with `VERTICAL_OFFSET`/`CANVAS_MARGIN`); wrap the white artboard stack in an inner layer with **logical** width/height and `transform: scale(EDITOR_VIEWPORT_SCALE)` + `transformOrigin: 'top left'`, with outer wrapper **position/size** so scroll bounds match **visual** footprint per `research.md` R1; keep visible label `画布: {EDITOR_CANVAS_WIDTH}x{EDITOR_CANVAS_HEIGHT}`

**Checkpoint**: MVP — 视觉变小 + 逻辑幅面未压扁为 375 宽排版。

---

## Phase 4: User Story 2 — 缩放读数不因半屏变 50% (Priority: P2)

**Goal**：顶栏/控件仍表示设计空间 zoom；默认档不出现「仅因半屏展示」的 50% 误读（FR-003 / spec US2）。

**Independent Test**：`quickstart.md` 第 1 节缩放读数；与改造前默认档一致。

### Implementation for User Story 2

- [x] T004 [US2] Verify `apps/web_builder/src/extensions/canvas/hooks/useZoom.ts` and zoom UI in `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` still use `formatZoomPercent(zoom)` on raw `zoom` without baking `EDITOR_VIEWPORT_SCALE` into the displayed percent; fix any regression if new layout code changes the control label

---

## Phase 5: User Story 3 — 标尺与辅助线与逻辑幅面一致 (Priority: P3)

**Goal**：标尺末端语义仍对应 750×1334；网格/对齐线与内层逻辑坐标一致（FR-005 / FR-006）。

**Independent Test**：`quickstart.md` 第 3–4 节。

### Implementation for User Story 3

- [x] T005 [US3] In `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx`, pass `zoom * EDITOR_VIEWPORT_SCALE` into `RulerX`/`RulerY` `zoom` props while keeping `canvasWidth={EDITOR_CANVAS_WIDTH}` and `canvasHeight={EDITOR_CANVAS_HEIGHT}` per `contracts/editor-viewport-display-scale.md`

- [x] T006 [US3] In `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx`, size `Grid` and `AlignmentGuides` with **layoutLogicalW/H** (same layer as `SelectableSchemaRenderer`); ensure `computeAlignLines` / `canvasWrapperRef` target the **pre-transform logical** container (or adjust `apps/web_builder/src/extensions/select-and-drag/services/AlignmentService.ts` if `getBoundingClientRect` under CSS transform misaligns guides per `research.md` R3)

- [x] T007 [US3] Audit `apps/web_builder/src/extensions/select-and-drag/hooks/useMove.ts`, `apps/web_builder/src/extensions/select-and-drag/hooks/useResize.ts`, and `apps/web_builder/src/extensions/ui/center-canvas/hooks/useCanvasDrop.ts`: convert pointer deltas to schema logical pixels using effective scale `zoom * EDITOR_VIEWPORT_SCALE` (import constant and thread `zoom` where needed via hook parameters or a narrow context from `CenterCanvas`); verify move/resize/drop at default 100% and one non-1 zoom step; do **not** change `apps/web_builder/src/core/components/Preview.tsx` unless product overrides spec

---

## Phase 6: Polish & Cross-Cutting

- [x] T008 Run `rushx type-check` from `apps/web_builder`

- [x] T009 Run `rushx lint` from `apps/web_builder` when the environment resolves `eslint` (same caveat as other features)

- [x] T010 Walk through `apps/web_builder/specs/007-canvas-half-display/quickstart.md` and record results in PR or commit message

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6**
- **US2** 依赖 **US1** 中缩放 UI 仍存在于 `CenterCanvas` 且行为可观察。
- **US3** 依赖 **US1** 的布局分层已落地；**T006** 依赖 **T003** 的内层/外层结构；**T007** 依赖 **T003**（及 **T002** 常量）。

### Parallel Opportunities

- **T001** 可与 **T002** 并行（文档阅读 vs 常量文件），但 **T003** 必须在 **T002** 之后。
- **T005** 与 **T006** 同文件，建议顺序执行或同一提交内连续编辑避免冲突。
- **T007** 触及多个 hook 文件：可在 **T003** 完成后与 **T005/T006** 分工并行，但合并前需一次联调。

### Parallel Example

```text
T001 读合同 + 标注 CenterCanvas 尺寸用法
T002 editorCanvasArtboard.ts 增加 EDITOR_VIEWPORT_SCALE
→ T003 CenterCanvas 内层逻辑 + transform + 视觉滚动
→ T004 缩放读数验收
→ T005 Ruler zoom_eff
→ T006 Grid / AlignmentGuides / AlignmentService
→ T007 useMove / useResize / useCanvasDrop
→ T008–T010
```

---

## Implementation Strategy

### MVP

1. Phase 1–2（T001–T002）  
2. Phase 3（T003）  
3. 目视 + 属性抽检  

### Incremental

- 缩放读数验收 → 标尺/网格/对齐 → 指针映射 → 门禁与 quickstart  

---

## Notes

- 无 `.specify/extensions.yml` 则无 hooks。  
- **Preview** 默认不在本任务列表中修改（见 spec / `research.md` R5）。
