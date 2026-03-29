---
description: "Task list — 运行时预览 iframe 与分享/复制链接（004）"
---

# Tasks: 运行时预览 iframe 与分享/复制链接

**Input**: `specs/004-runtime-preview-iframe-share/`（plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md ✅ spec.md ✅  

**Tests**: 规格未强制自动化测试；合并前运行 `rushx type-check` / `rushx lint`（Polish 阶段）。

**路径前缀**: `apps/web_builder/`（Rush 包根）。

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup（配置样板）

**Purpose**: 可复现的运行时预览 URL 模板，不写死代码常量。

- [x] T001 Create or update `apps/web_builder/.env.example` with `VITE_RUNTIME_PREVIEW_URL_TEMPLATE` documented (example: `http://192.168.1.91:50055/orangehome/runtime/preview/{pageId}`)

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 单一 URL 构建入口，供 iframe、分享、复制共用。

- [x] T002 [P] Add `VITE_RUNTIME_PREVIEW_URL_TEMPLATE` to `ImportMetaEnv` in `apps/web_builder/src/vite-env.d.ts`
- [x] T003 Implement `buildRuntimePreviewUrl(pageId)` in `apps/web_builder/src/utils/runtimePreviewUrl.ts` per `specs/004-runtime-preview-iframe-share/contracts/runtime-preview-url.md` (return `null` when template or `pageId` invalid)

**Checkpoint**: 单元可 import 并在控制台打印 URL（手工）后再改 UI。

---

## Phase 3: User Story 1 — 预览加载运行时页 (Priority: P1) 🎯 MVP

**Goal**: 预览模式主区域为 iframe，指向 `buildRuntimePreviewUrl(pageId)`；设备框保留；加载失败有可读提示；顶栏提示「已发布版本」类文案（research R5）。

**Independent Test**: 配置模板后进入预览 → 网络面板可见对 runtime 的请求；无 `pageId` 时不得白屏死循环。

### Implementation for User Story 1

- [x] T004 [US1] Refactor `apps/web_builder/src/core/components/Preview.tsx` to use `useEditorPageId()` + `buildRuntimePreviewUrl`: replace inner `SchemaNode` body with `iframe` (`src` = URL, `width/height` 100% inside existing device wrapper); add loading state, `onError` empty/error UI, and short subtitle that preview reflects published runtime content
- [x] T005 [US1] Preserve `PreviewDevice` chrome (`mobile`/`tablet`/`desktop` outer dimensions) around the iframe in `apps/web_builder/src/core/components/Preview.tsx` per `specs/004-runtime-preview-iframe-share/research.md` R1

**Checkpoint**: MVP — iframe 预览可演示即可。

---

## Phase 4: User Story 2 — 分享与预览内复制 (Priority: P2)

**Goal**: 「分享」与预览顶栏「复制链接」写入与 iframe 相同的 URL；失败 Toast；无 `pageId` 时提示（FR-005）。

**Independent Test**: 剪贴板内容与 `buildRuntimePreviewUrl` 输出一致（抽样 2 个 pageId）。

### Implementation for User Story 2

- [x] T006 [US2] Update `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` `handleShareLink` to call `buildRuntimePreviewUrl(pageId)` instead of `exportService.generateShareLink`; if `null`, `Toast.warning`/`error` and skip clipboard
- [x] T007 [US2] Add 「复制链接」 button to preview header in `apps/web_builder/src/core/components/Preview.tsx` reusing the same URL string as iframe `src` + `navigator.clipboard` + Toast success/error per FR-003/FR-006

**Checkpoint**: 分享与预览内复制行为一致。

---

## Phase 5: User Story 3 — 可配置性验收 (Priority: P3)

**Goal**: 无硬编码唯一主机；改 env 即改前缀（SC-004）。

### Implementation for User Story 3

- [x] T008 [US3] Audit `apps/web_builder/src/utils/runtimePreviewUrl.ts` and `apps/web_builder/src/core/components/Preview.tsx` / `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` for hard-coded runtime hosts; ensure URL only originates from `import.meta.env.VITE_RUNTIME_PREVIEW_URL_TEMPLATE`

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 降级与新窗口、质量门禁。

- [x] T009 [P] Add optional 「新窗口打开」 control in `apps/web_builder/src/core/components/Preview.tsx` when iframe fails to load (research R6), using same `buildRuntimePreviewUrl` result
- [x] T010 Run `rushx type-check` and `rushx lint` from `apps/web_builder`
- [x] T011 Walk through `apps/web_builder/specs/004-runtime-preview-iframe-share/quickstart.md` and record results in PR / commit message

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6**
- **US2** 依赖 **US1** 中已稳定的 `Preview.tsx` 与 URL（可并行改 `Toolbar` 与 `Preview` 复制按钮若两人协作，但同一 PR 建议顺序 T004→T006→T007 避免冲突）。

### Parallel Opportunities

- **Phase 2**: T002 与 T003 可并行（不同文件）。
- **Phase 6**: T009 可与 T010 分工；T010 必须在合并前通过。

### Parallel Example: Phase 2

```text
T002 vite-env.d.ts
T003 runtimePreviewUrl.ts
（T003 完成后才能改 Preview/Toolbar 行为）
```

---

## Implementation Strategy

### MVP

1. Phase 1 + 2 + 3（T001–T005）  
2. 验证 iframe 加载  
3. 再做 Phase 4（分享 + 复制）

### Incremental

- 增量 1：URL 工具 + iframe 预览  
- 增量 2：分享 / 复制 / 审计 / 新窗口降级  

---

## Notes

- `ExportService.generateShareLink` 可保留给调试或非本需求的深链场景，但 **不得** 再作为「分享」主路径。  
- 无 `.specify/extensions.yml` 则无 hooks。
