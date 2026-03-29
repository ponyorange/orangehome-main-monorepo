# Tasks: 010 编辑器「已保存」状态与预览前保存

**Input**: `apps/web_builder/specs/010-preview-save-dirty-state/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md、spec.md  
**Tests**: 规格未要求自动化测试；以 quickstart 手工走查与类型检查为主。

**Organization**: 按用户故事分组；US1（脏状态）→ US3（预览前保存）→ US2（失败不误判）为建议实现顺序（US2 与保存路径同文件，可与 US3 同迭代验证）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: US1 / US2 / US3
- 路径相对于 monorepo 中的 `apps/web_builder/`

## Path Conventions

Orange Editor：`apps/web_builder/src/core/`（store、bootstrap）、`apps/web_builder/src/extensions/`（toolbar 等）、`apps/web_builder/src/data/modules/`（保存 API 封装）。

---

## Phase 1: Setup（共享准备）

**Purpose**: 确认设计产物与类型基线，无新工程搭建。

- [x] T001 确认 `apps/web_builder/specs/010-preview-save-dirty-state/` 下 plan.md、spec.md、tasks.md 可用，并在 `apps/web_builder` 执行 `npm run type-check` 记录当前基线（通过或列出既有失败）

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 会话级「对齐/未对齐」状态与 schema 写入路径挂钩；完成前不得做预览编排。

**⚠️ CRITICAL**: 未完成本阶段前不得合并「预览前保存」逻辑。

- [x] T002 新建 `apps/web_builder/src/core/store/documentSyncStore.ts`：Zustand store，导出 `useDocumentSyncStore`，包含 `isDirty`（语义为「存在相对上次成功持久化或本次加载版本的未持久化变更」；初始值与 spec「加载后已对齐」一致，建议初始 `false` 并在持久化回填前不依赖工具栏）、`markClean`、`markDirty`
- [x] T003 扩展 `apps/web_builder/src/core/store/schemaStore.ts`：为 `setSchema` 增加与 plan 一致的选项（例如 `syncSource: 'persistence' | 'user'`，默认 `'user'`）；在默认路径写入后调用 `markDirty()`；在 `'persistence'` 路径写入后调用 `markClean()`；在 `undo` 与 `redo` 成功更新 state 后调用 `markDirty()`（MVP，见 research.md）

**Checkpoint**: 任意用户态 `setSchema` 与 undo/redo 会标脏；持久化回填可清脏。

---

## Phase 3: User Story 1 — 编辑后识别「尚未保存到持久化」(Priority: P1) 🎯 MVP

**Goal**: 加载后与持久化对齐为「已对齐」；编辑后变「未对齐」；保存成功回到「已对齐」。

**Independent Test**: 打开页面 → 初始已对齐 → 合法编辑 → 未对齐 → 保存成功 → 已对齐（见 spec.md US1）。

### Implementation for User Story 1

- [x] T004 [US1] 在 `apps/web_builder/src/core/components/EditorBootstrap.tsx` 将服务端 `pageVersion.pageSchema` 的 `setSchema` 调用改为带 `syncSource: 'persistence'`（并保持 `record: false`），确保加载完成后与 FR-002 一致
- [x] T005 [US1] 在 `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` 中，于 `saveBuilderPageVersion` **成功**分支调用 `markClean()`（若成功路径未触发带 `persistence` 的 `setSchema`，此处必须显式清脏以满足 FR-004）

**Checkpoint**: US1 可独立走查；此时预览仍可旧行为（直接 `openPreview`），但脏标应正确。

---

## Phase 4: User Story 3 — 预览前自动保存并呈现加载 (Priority: P1)

**Goal**: 未对齐时先保存再预览，带 loading；已对齐时直接进入预览；保存失败不打开预览。

**Independent Test**: 见 quickstart.md 第 2、3、4 节与 spec.md US3。

### Implementation for User Story 3

- [x] T006 [US3] 在 `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx`（或抽至 `apps/web_builder/src/data/modules/` 的薄封装，由 Toolbar 调用）抽取与「保存」按钮相同的持久化逻辑为可 `await` 的 `performSave()`（或等价），返回是否成功，**不得**复制第二套 HTTP 实现（遵循 plan 与 contracts/save-dirty-preview-flow.md）
- [x] T007 [US3] 在 `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` 将预览入口从直接 `openPreview` 改为：`isDirty` 为真时设置可见 loading（如按钮 `loading` 或等价）、`await performSave()`，**仅成功**后 `openPreview()`；失败则 Toast/错误提示且**不**调用 `openPreview`；`finally` 清除 loading；`!isDirty` 时直接 `openPreview()`（FR-005、FR-006、FR-007）
- [x] T008 [US3] 在同一 `Toolbar.tsx` 预览路径上处理快速连点：在 `saving` 或预览准备期间禁用预览按钮或忽略重复提交，避免重复保存/重复打开（见 spec Edge Cases）

**Checkpoint**: 预览主路径（当前仅此处调用 `openPreview`，见 `apps/web_builder/src/core/store/previewStore.ts` 消费方检索）满足 US3。

---

## Phase 5: User Story 2 — 保存失败不误判为已对齐 (Priority: P2)

**Goal**: 保存失败不 `markClean`；用户修正后可再次保存成功并清脏。

**Independent Test**: 模拟保存失败，状态仍为未对齐；再次成功保存后对齐（spec.md US2）。

### Implementation for User Story 2

- [x] T009 [US2] 审阅 `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx`（及若存在的 `performSave` 抽取文件）：确认所有失败分支**不**调用 `markClean`，且成功分支仍满足 FR-004；必要时用断网走查 quickstart 第 3 节

**Checkpoint**: US2 与保存/预览路径一致，无「假已保存」。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 走查与质量闸门。

- [x] T010 按 `apps/web_builder/specs/010-preview-save-dirty-state/quickstart.md` 执行手工场景（含导入 JSON 变脏，见 spec Edge Cases 与 `Toolbar.tsx` 内 `setSchema(imported)` 路径）
- [x] T011 [P] 在 `apps/web_builder` 运行 `npm run type-check` 与项目既有 lint 命令，修复本次改动引入的问题

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → 无前置
- **Phase 2** → 依赖 Phase 1（建议）；**阻塞** Phase 3–5
- **Phase 3 (US1)** → 依赖 Phase 2
- **Phase 4 (US3)** → 依赖 Phase 3（需可靠 `isDirty` 与 `performSave`/`markClean`）
- **Phase 5 (US2)** → 可与 Phase 4 同一 PR 验证；逻辑上依赖 T005–T007 已落地
- **Phase 6** → 依赖 Phase 3–5 完成

### User Story Dependencies

```text
US1 (P1) ──► US3 (P1)
                │
US2 (P2) ◄──────┘（同一保存路径上的失败语义，建议在 US3 完成后一次性审阅）
```

### Within-Story Order

- **US1**: T004 → T005（均可依赖 T002–T003）
- **US3**: T006 → T007 → T008（同文件编排，顺序执行）
- **US2**: T009 在 T005–T008 之后

### Parallel Opportunities

- **T011 [P]**：与 T010 不同人时可并行（一人走查、一人修 lint）；同一人则先后执行
- **T002** 与「仅读规格」类任务无文件冲突；**T003** 依赖 T002 完成后再改 `schemaStore.ts`

---

## Parallel Example: User Story 1

无多文件拆分：T004（`EditorBootstrap.tsx`）与 T005（`Toolbar.tsx`）均依赖 T003，可由同一开发者连续完成，或 T004 先于 T005 以减少集成歧义。

---

## Parallel Example: User Story 3

- T006 抽取 `performSave` 后，T007/T008 在同一组件内连续修改；不宜并行分人除非严格分工「先合并 T006」。

---

## Implementation Strategy

### MVP First（仅 US1）

1. 完成 Phase 1–2（T001–T003）  
2. 完成 Phase 3（T004–T005）  
3. **停止并走查** US1 Independent Test  
4. 此时预览行为可仍为旧版；脏标已可用

### Incremental Delivery

1. MVP（US1）→ 合并/演示  
2. 加 US3（T006–T008）→ quickstart 第 2、4 节  
3. 加 US2 确认（T009）→ quickstart 第 3 节  
4. Polish（T010–T011）

### 建议单会话实现顺序

`T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011`

---

## Summary

| 指标 | 值 |
|------|-----|
| **任务总数** | 11 |
| **US1** | 2（T004–T005）+ 奠基 T002–T003 |
| **US2** | 1（T009） |
| **US3** | 3（T006–T008） |
| **Setup / Foundation / Polish** | T001；T002–T003；T010–T011 |
| **可并行** | T011 标记 [P]；其余强顺序为主 |
| **格式** | 全部任务均为 `- [x] Txxx ...` 且含 `apps/web_builder/` 路径 |

---

## Notes

- `setSchema` 的默认「用户路径」应覆盖 `useMove.ts`、`useResize.ts`、`ContextMenu.tsx`、`useCanvasDrop.ts`、`PropertiesPanel.tsx`、`KeyboardShortcuts.tsx`、`useLayerTree.ts`、`Toolbar.tsx` 导入等现有调用点，避免逐文件漏标脏（见 `apps/web_builder` 内 `setSchema(` 检索）。  
- 若未来增加第二处 `openPreview` 调用，须复用与 `contracts/save-dirty-preview-flow.md` 相同的编排。
