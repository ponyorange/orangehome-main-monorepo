# Tasks: 011 HTTP 环境下分享预览链接与复制失败兜底

**Input**: `apps/web_builder/specs/011-http-share-fallback/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md、spec.md  
**Tests**: 规格未要求自动化测试；以 `quickstart.md` 手工走查与 `npm run type-check` 为主。

**Organization**: 先奠基工具层（多层复制），再 US2（Modal + 编排 hook），最后 US1 双入口接入与 polish。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: US1 / US2
- 路径相对于 monorepo 中的 `apps/web_builder/`

## Path Conventions

Orange Editor：`apps/web_builder/src/utils/`、`apps/web_builder/src/common/`、`apps/web_builder/src/core/components/`、`apps/web_builder/src/extensions/features/toolbar/components/`。

---

## Phase 1: Setup（共享准备）

**Purpose**: 基线与文档就绪。

- [x] T001 确认 `apps/web_builder/specs/011-http-share-fallback/` 下 plan.md、spec.md、contracts/ 可用，并在 `apps/web_builder` 执行 `npm run type-check` 记录基线

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 在非安全上下文下仍尽可能自动复制成功；`no_url` 语义不变。

**⚠️ CRITICAL**: 未完成前不应合并仅 UI 的 Modal 改动（否则仍会在 HTTP 下误判失败）。

- [x] T002 在 `apps/web_builder/src/utils/runtimePreviewUrl.ts` 实现 `copyTextToClipboardRobust(text: string): Promise<boolean>`：优先 `navigator.clipboard.writeText`（`try/catch` 或可用性判断），失败则用临时 `textarea` + `document.execCommand('copy')` 并移除临时节点（见 research.md）
- [x] T003 在 `apps/web_builder/src/utils/runtimePreviewUrl.ts` 调整 `copyRuntimePreviewLink`：保留 `CopyRuntimePreviewLinkResult` 三态；`no_url` 逻辑不变；有 URL 时调用 `copyTextToClipboardRobust`，成功返回 `ok`，否则 `clipboard_error`（见 contracts/share-preview-link-flow.md）

**Checkpoint**: HTTP（非 localhost）下走查应显著减少误报的 `clipboard_error`。

---

## Phase 3: User Story 2 — 自动复制失败时 Modal 与新开页 (Priority: P1)

**Goal**: 两层复制均失败时展示完整 URL；提供新标签页打开与可关闭 Modal；`window.open` 被拦截时有提示。

**Independent Test**: 见 spec.md US2 与 `quickstart.md` 第 3、4 节。

### Implementation for User Story 2

- [x] T004 [US2] 新建 `apps/web_builder/src/extensions/features/toolbar/components/SharePreviewLinkModal.tsx`（或 `apps/web_builder/src/common/components/SharePreviewLinkModal.tsx`，与 plan 择一并在任务描述中固定路径）：Semi `Modal`，展示完整 URL（`wordBreak: 'break-all'`、`maxHeight` + `overflow: 'auto'`），「在新标签页打开」使用 `window.open(url, '_blank', 'noopener,noreferrer')`，可关闭；若打开失败由调用方 Toast 提示（props 回调或返回值）
- [x] T005 [US2] 新建 `apps/web_builder/src/common/hooks/useShareRuntimePreviewLink.ts`：封装对 `copyRuntimePreviewLink(pageId)` 的调用；`ok`/`no_url` 用 Toast 与现网一致（`no_url` 文案与 Toolbar/Preview 现有一致即可）；`clipboard_error` 时打开 `SharePreviewLinkModal`；处理连点：同一 Modal 实例下更新 URL 或忽略重复提交（择一，与 plan.md 一致）；对外暴露 `sharePreviewLink: () => Promise<void>`（或等价 API）

**Checkpoint**: 不接入 Toolbar 前，可在 Storybook/临时测试组件验证 hook + Modal（可选，非必须）。

---

## Phase 4: User Story 1 — HTTP 下可交付链接且入口一致 (Priority: P1)

**Goal**: 工具栏与预览内「复制预览链接」在 HTTP/HTTPS 下行为一致，且不得再以「仅 HTTPS」作为复制失败时的唯一叙述（FR-001、FR-005、ARCH-002）。

**Independent Test**: `quickstart.md` 第 1、2 节；spec.md US1。

### Implementation for User Story 1

- [x] T006 [US1] 在 `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` 用 `useShareRuntimePreviewLink` 替换内联 `handleShareLink` 中对 `copyRuntimePreviewLink` 的分支与 Toast
- [x] T007 [P] [US1] 在 `apps/web_builder/src/core/components/Preview.tsx` 将 `handleCopyPreviewLink` 改为使用同一 `useShareRuntimePreviewLink`（或等价共享封装），删除重复的「复制失败，请检查浏览器权限或使用 HTTPS」硬编码分支，保证与工具栏兜底一致

**Checkpoint**: `rg copyRuntimePreviewLink apps/web_builder/src` 仅余 `runtimePreviewUrl.ts` 与 hook 内调用（或文档允许的封装层）。

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: 文档与质量闸门。

- [x] T008 更新 `apps/web_builder/specs/011-http-share-fallback/quickstart.md` 中「连点分享」一句，与 T005 实现选择一致
- [x] T009 [P] 在 `apps/web_builder` 运行 `npm run type-check`（及仓库惯用的 `rushx lint`，若本地可执行）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → 无前置  
- **Phase 2** → 依赖 Phase 1（建议）；**阻塞** Phase 3–4  
- **Phase 3 (US2)** → 依赖 Phase 2  
- **Phase 4 (US1)** → 依赖 Phase 3（需 hook + Modal）  
- **Phase 5** → 依赖 Phase 4  

### User Story Dependencies

```text
Foundational (T002–T003)
        │
        ▼
US2 Modal/Hook (T004–T005)
        │
        ▼
US1 双入口 (T006–T007) ──► Polish (T008–T009)
```

### Parallel Opportunities

- **T007 [P]**：与 T006 不同文件，在 T005 完成后可由另一开发者并行（需先合并 T005 的 hook API）。  
- **T009 [P]**：与 T008 文档任务可并行（不同职责）。  

### Within-Story Order

- **US2**：T004（Modal）→ T005（hook 依赖 Modal）  
- **US1**：T006 → T007（或 T006∥T007 在 hook 稳定后）  

---

## Parallel Example: User Story 1

在 T005 合并后：

```text
Task: "Toolbar.tsx 接入 useShareRuntimePreviewLink"
Task: "Preview.tsx 接入 useShareRuntimePreviewLink"
```

---

## Implementation Strategy

### MVP（最小闭环）

1. Phase 1–2（T001–T003）→ 在 HTTP 下多数场景已可复制成功  
2. 加 Phase 3–4（T004–T007）→ Modal + 双入口一致  
3. Phase 5（T008–T009）  

### 增量交付

- 可先合并 T002–T003 验证 HTTP 复制，再合 UI 兜底。  

---

## Summary

| 指标 | 值 |
|------|-----|
| **任务总数** | 9 |
| **US1** | 2（T006–T007）+ 奠基 T002–T003 |
| **US2** | 2（T004–T005） |
| **Setup / Foundation / Polish** | T001；T002–T003；T008–T009 |
| **可并行** | T007 [P]、T009 [P]（在依赖满足后） |
| **格式** | 任务行含 Task ID 与 `apps/web_builder/` 路径 |

---

## Notes

- `apps/web_builder/src/core/components/Preview.tsx` 与 `Toolbar.tsx` 均需接入共享 hook，以满足 spec **ARCH-002** 与 FR-005。  
- 若实现中将 Modal 置于 `common/components/`，请在 PR 中说明与 plan「toolbar 目录」偏差的理由（可读性/复用）。
