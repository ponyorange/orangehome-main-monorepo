---
description: "Task list — 画布 750×1334 与标尺（006）"
---

# Tasks: 画布 750×1334 与标尺一致

**Input**: `specs/006-canvas-750x1334-rulers/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md ✅ spec.md ✅  

**Tests**: 规格以手工走查为主；合并前 `rushx type-check` / `rushx lint`（Polish）。

**路径前缀**: `apps/web_builder/`（Rush 包根）。

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup（范围摸底）

**Purpose**：列出仍引用旧画布尺寸的文件，避免漏改。

- [x] T001 [P] Grep `apps/web_builder/src` for `375` and `667` tied to canvas artboard (exclude CSS hex such as `#667085`); list hits in PR or scratch note before editing

---

## Phase 2: Foundational（单一真相常量）

**Purpose**：合同 `editor-canvas-artboard.md` 中的数值只定义一处。

- [x] T002 Create `apps/web_builder/src/constants/editorCanvasArtboard.ts` exporting `EDITOR_CANVAS_WIDTH = 750` and `EDITOR_CANVAS_HEIGHT = 1334` with a short comment pointing to `specs/006-canvas-750x1334-rulers/contracts/editor-canvas-artboard.md`

**Checkpoint**: `CenterCanvas` 可改为从该模块 import，禁止再散落 `375`/`667` 作为编辑幅面。

---

## Phase 3: User Story 1 — 标准幅面 750×1334 (Priority: P1) 🎯 MVP

**Goal**：中心画布逻辑尺寸为 **750×1334**（FR-001）。

**Independent Test**：顶栏或量具确认白底画布区域 `scaled ≈ 750×zoom` by `1334×zoom`；拖拽/选择仍可用。

### Implementation for User Story 1

- [x] T003 [US1] Refactor `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` to import `EDITOR_CANVAS_WIDTH`/`EDITOR_CANVAS_HEIGHT`, remove local `CANVAS_WIDTH`/`CANVAS_HEIGHT` literals, and thread new values through `scaledWidth`/`scaledHeight`, scroll `minHeight`/`contentEl.style.minWidth`, `Grid`, `AlignmentGuides`, `RulerX`/`RulerY` props, and header label `画布: …`

**Checkpoint**: MVP — 画布尺寸与文案正确即可。

---

## Phase 4: User Story 2 — 标尺与缩放一致 (Priority: P2)

**Goal**：标尺 0…750 / 0…1334 与画布同步缩放（FR-002）。

**Independent Test**：`quickstart.md` 标尺末端刻度与两档 zoom 走查。

### Implementation for User Story 2

- [x] T004 [US2] Update comment in `apps/web_builder/src/extensions/ruler/components/Ruler.tsx` that mentions 375/667 so it describes the end tick for `maxValue` generically; only change default or call-site `tickInterval` if vertical ticks are unreadable at 1334 (per `research.md` R2), and note in PR

---

## Phase 5: User Story 3 — 全产品尺寸文案 (Priority: P3)

**Goal**：用户可见「画布像素」文案与 **750×1334** 一致（FR-003）；预览设备例外按 plan（FR-005）。

**Independent Test**：全仓检索无误导性 375×667 **编辑画布** 文案。

### Implementation for User Story 3

- [x] T005 [US3] Search `apps/web_builder/src` for remaining user-visible `375`×`667` / `375x667` tied to editor canvas; update to match constants or label as preview-only; by default **do not** change `apps/web_builder/src/core/components/Preview.tsx` unless product overrides plan—if changed, document in `apps/web_builder/specs/006-canvas-750x1334-rulers/plan.md`

---

## Phase 6: Polish & Cross-Cutting

- [x] T006 Run `rushx type-check` and `rushx lint` from `apps/web_builder`
- [x] T007 Walk through `apps/web_builder/specs/006-canvas-750x1334-rulers/quickstart.md` and record results in PR or commit message

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6**
- **US2** 依赖 **US1** 中 `CenterCanvas` 已传入新 `canvasWidth`/`canvasHeight`（T003 内含 Ruler 传参则 T004 主要为注释/微调）。

### Parallel Opportunities

- **T001** 可与 **T002** 并行（不同产出：清单 vs 新文件），但 **T003** 必须在 **T002** 之后。

### Parallel Example

```text
T001 grep 摸底
T002 editorCanvasArtboard.ts
→ T003 CenterCanvas.tsx
→ T004 Ruler.tsx
```

---

## Implementation Strategy

### MVP

1. Phase 1–3（T001–T003）  
2. 确认画布与顶栏尺寸  

### Incremental

- 标尺注释与 tick 微调 → 全仓文案 → 门禁与 quickstart 记录  

---

## Notes

- 无 `.specify/extensions.yml` 则无 hooks。  
- **Preview** 设备框与编辑画布统一为可选 follow-up，见 `plan.md` Phase 2 第 5 条。
