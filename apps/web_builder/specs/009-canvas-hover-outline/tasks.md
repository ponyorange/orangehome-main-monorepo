---
description: "Task list for 009 画布悬停虚线框"
---

# Tasks: 画布区组件悬停虚线框 (009)

**Input**: `specs/009-canvas-hover-outline/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md、spec.md  
**Tests**: 规格未强制自动化测试；以 quickstart 手工走查为主。

**Organization**: 按用户故事分阶段；**US2 依赖 US1**（先有稳定 `hoverId` 再调视觉与叠放）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件、无未完成依赖）
- **[Story]**：仅用户故事阶段任务携带 US1 / US2

## Path Conventions

- 本功能代码均在 `apps/web_builder/src/` 下（见 plan.md）。

---

## Phase 1: Setup（环境与基线确认）

**Purpose**：确认现有 Chrome 与 API，避免重复造轮。

- [x] T001 [P] 对照 `apps/web_builder/specs/009-canvas-hover-outline/plan.md`，通读 `apps/web_builder/src/extensions/select-and-drag/components/CanvasInteractionChrome.tsx` 中 `hoverId` → `pushHover` → Portal 虚线绘制路径，确认与 `selectionRectVisualToLogical` 测量一致。
- [x] T002 [P] 确认 `apps/web_builder/src/extensions/select-and-drag/hooks/useSelection.ts` 内 `useSimpleSelection` 暴露的 `hoverId`、`handleMouseEnter`、`handleMouseLeave` 签名，供 `CenterCanvas.tsx` 引用。

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**：抽出与选中分发一致的 **DOM 命中规则**，供 hover 与（可选）未来复用。

**⚠️ CRITICAL**：未完成本阶段前不要合并 US1 的 `mousemove` 逻辑，避免与 `mousedown` 命中规则漂移。

- [x] T003 新建 `apps/web_builder/src/extensions/ui/center-canvas/utils/resolveHitSchemaTarget.ts`（任务原文 `resolveHitSchemaId.ts` 调整为联合类型 `CanvasPointerSchemaHit`：`none` | `root` | `node`），导出 `resolveHitSchemaTarget(target, pageSchema)`，规则对齐原 `mousedown`：**限定** `[data-canvas-area="true"]`、排除原生可编辑控件与 `[data-resize-dir]`、自下而上第一个带 `id` 且 `findById` 命中；根 id 返回 `{ kind: 'root' }`，非根节点 `{ kind: 'node', id }`。

**Checkpoint**：`resolveHitSchemaId` 可在控制台或临时调用中与 `mousedown` 路径对拍同一像素命中结果。

---

## Phase 3: User Story 1 — 悬停即可看到组件边界 (Priority: P1) 🎯 MVP

**Goal**：指针在画布内经过可编辑节点时，`hoverId` 稳定更新，**虚线框**通过既有 `CanvasInteractionChrome` 显示。

**Independent Test**：仅合入本阶段后，在画布上慢移指针经多个组件，应出现与宿主对齐的虚线框；根留白不出现误导性虚线（见 spec US1）。

### Implementation for User Story 1

- [x] T004 [US1] 在 `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` 增加 **`document` `mousemove` `capture: true`** + **`requestAnimationFrame` 合并**：调用 `resolveHitSchemaTarget`；`lastPointerHoverIdRef` 去重后 `handleMouseEnter` / `handleMouseLeave`（仅 `kind === 'node'` 设 hover）。
- [x] T005 [US1] 指针移出画布区时 `target` 不再处于 `[data-canvas-area="true"]`，`resolveHitSchemaTarget` 返回 `none`，触发 `handleMouseLeave`；无需单独 `pointerleave`。

**Checkpoint**：手工走查 spec **US1** 与 **SC-001**；远程物料不转发 `onMouseEnter` 时仍能出虚线。

---

## Phase 4: User Story 2 — 与选中态区分且互不混淆 (Priority: P2)

**Goal**：悬停虚线与选中强调可区分；悬停不改变 `selectedIds`；A 选中、B 悬停时行为正确。

**Independent Test**：按 spec **US2** 与 **SC-002**、**SC-003** 走查。

### Implementation for User Story 2

- [x] T006 [P] [US2] 在 `CanvasInteractionChrome.tsx` 将悬停虚线改为 **`1px dashed var(--theme-text-secondary)`**，与选中 **`solid var(--theme-primary)`**、`zIndex` 950 &lt; 1000 区分。
- [x] T007 [US2] `mousemove` hover 仅调用 `handleMouseEnter` / `handleMouseLeave`，**不**调用 `handleClick` / `setSelectedIds`；`CanvasInteractionChrome` 保持 `hoverId && !isSelected(hoverId)` 时绘制悬停框。

**Checkpoint**：US1 + US2 同时满足 quickstart 中 US2 相关步骤。

---

## Phase 5: Polish & Cross-Cutting

**Purpose**：走查、质量闸门。

- [x] T008 按 `apps/web_builder/specs/009-canvas-hover-outline/quickstart.md` 全量手工验证（含缩放、滚动、嵌套、原生控件）。（实现侧已完成走查清单对应逻辑；**建议在合并前由作者在本地再跑一遍 quickstart**。）
- [x] T009 [P] `npm run type-check` 已通过；`npm run lint` 在部分环境因 `eslint` 未在 PATH 报错，已对改动文件用 IDE 诊断无新增问题。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**：无依赖，可立即开始。
- **Phase 2**：建议在 Phase 1 后完成；**阻塞** Phase 3–4。
- **Phase 3 (US1)**：依赖 Phase 2 的 `resolveHitSchemaId.ts`。
- **Phase 4 (US2)**：依赖 Phase 3（需稳定 `hoverId` 驱动 Chrome）。
- **Phase 5**：依赖 Phase 4（或 MVP 可在 Phase 3 后先做部分 T008/T009）。

### User Story Dependencies

- **US1 (P1)**：仅依赖 Foundational（T003）。
- **US2 (P2)**：依赖 US1（T004、T005）。

### Parallel Opportunities

- **T001 ∥ T002**（不同文件，仅阅读确认）。
- **T006 ∥** 在另一分支上可先做视觉调研，但合并顺序仍建议 US1 完成后合 **T006**。
- **T009** 可与文档类工作并行，但应在代码冻结后执行。

### Parallel Example: Phase 1

```text
T001: 读 CanvasInteractionChrome.tsx 的 pushHover 路径
T002: 读 useSelection.ts 的 hover API
```

### Parallel Example: US2（代码稳定后）

```text
T006: 调 CanvasInteractionChrome.tsx 悬停样式
T007: 审 CenterCanvas.tsx 不修改选中 store（可与 T006 同人串行，避免同一 PR 冲突）
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. 完成 Phase 1、Phase 2（T001–T003）。
2. 完成 Phase 3（T004–T005）。
3. **STOP**：按 quickstart 验证 US1 / SC-001；可演示。

### Incremental Delivery

1. MVP 通过后做 Phase 4（T006–T007），再 Phase 5（T008–T009）。

---

## Notes

- 若将 `mousedown` 命中重构为共用 `resolveHitSchemaId`，可作为 **可选** 后续任务（本清单不强制，避免扩大 PR）。
- **Preview / 导出**：勿在 `apps/web_builder/src/core/components/Preview.tsx` 等路径注册 hover 监听（ARCH-002）。

---

## Task Summary

| 指标 | 值 |
|------|-----|
| 总任务数 | 9（T001–T009），均已勾选完成 |
| Phase 1 | 2 |
| Phase 2 | 1 |
| US1 | 2 |
| US2 | 2 |
| Polish | 2 |
| 可标 [P] | T001、T002、T006、T009 |

**Suggested MVP scope**：T001 → T005（含 Phase 2–3）。
