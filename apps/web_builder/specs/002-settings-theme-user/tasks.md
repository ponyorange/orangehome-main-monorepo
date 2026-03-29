---
description: "Task list for 设置内主题切换与右上角用户展示"
---

# Tasks: 设置内主题切换与右上角用户展示

**Input**: Design documents from `/specs/002-settings-theme-user/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: 规格未强制自动化测试；本列表不含 Vitest 任务。

**Organization**: 按用户故事分阶段；共享扩展 `editor-header-chrome` 分步挂槽以降低半成品状态。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成前置）
- **[Story]**: `US1` / `US2`
- 描述须含确切路径（相对 `apps/web_builder` 时以 `src/...` 表示）

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 对齐契约与现有顶栏/主题扩展代码位置

- [x] T001 Read `specs/002-settings-theme-user/spec.md`, `specs/002-settings-theme-user/plan.md`, and `specs/002-settings-theme-user/contracts/header-toolbar-ui.md` for slot expectations and file targets
- [x] T002 [P] Read `specs/002-settings-theme-user/research.md`, `specs/002-settings-theme-user/data-model.md`, and `specs/002-settings-theme-user/quickstart.md` for Semi 交互与验收步骤

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 腾出 `header:right`，避免与新用户区重复

**⚠️ CRITICAL**: 完成前顶栏仍可能暂时缺少主题入口（直至 US1 落地）

- [x] T003 In `src/extensions/features/theme-switcher/index.ts` remove `registerSlot('header:right', …)` so `ThemeSwitcherPanel` no longer renders in the top-right slot
- [x] T004 In `src/core/editor.ts` remove `ThemeSwitcherExtension` from the default extensions list (import + entry in `getExtensions()` or equivalent) so the old right-slot registration is not loaded

**Checkpoint**: 旧主题顶栏入口已拆除，可开始新扩展

---

## Phase 3: User Story 1 - 通过左上角设置打开主题切换 (Priority: P1) 🎯 MVP

**Goal**: 左上角设置 → 下拉 →「切换主题」→ 浮层内 `ThemeSwitcher`，全局主题仍走 `themeStore`。

**Independent Test**: `quickstart.md` **P1**（不依赖右上角用户信息完整样式也可测菜单与主题）。

### Implementation for User Story 1

- [x] T005 [US1] Create `src/extensions/features/editor-header-chrome/components/EditorSettingsMenu.tsx` using Semi `Dropdown`/`Dropdown.Menu` with trigger labeled as settings, menu item「切换主题」, and `Popover` or `SideSheet` embedding `ThemeSwitcher` from `src/core/theme/ThemeSwitcher.tsx` with open/close and outside-click/Esc behavior per FR-006
- [x] T006 [US1] Create `src/extensions/features/editor-header-chrome/index.ts` exporting `EditorHeaderChromeExtension` (or agreed class name) that `registerSlot('header:left', { id: 'editor-settings', component: EditorSettingsMenu, order: 0 })` (adjust `order` vs `LogoExtension` order `1` in `src/extensions/features/logo/index.ts` so settings sits per spec)
- [x] T007 [US1] In `src/core/editor.ts` import and append `EditorHeaderChromeExtension` to the default extensions array in a stable position relative to `LogoExtension` / `ActionsExtension`

**Checkpoint**: US1 MVP：设置菜单与主题切换可达

---

## Phase 4: User Story 2 - 右上角展示头像与昵称 (Priority: P2)

**Goal**: `header:right` 展示 `useUserData()` 头像与显示名；无 URL / 加载失败用 Semi `Avatar` 渐变/首字/图标占位。

**Independent Test**: `quickstart.md` **P2**。

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/extensions/features/editor-header-chrome/components/UserProfileChip.tsx` using `useUserData` from `src/data/modules/useUserData.ts`, `UserInfo.avatar` / `nickname` / `email` fallbacks per `data-model.md`, Semi `Avatar` with `onError` fallback and ellipsis for long names
- [x] T009 [US2] In `src/extensions/features/editor-header-chrome/index.ts` add `registerSlot('header:right', { id: 'user-profile', component: UserProfileChip, order: 1 })` (or appropriate order so it does not clash with other future right-slot contributors)

**Checkpoint**: US2 完成；顶栏左设置、右用户与契约一致

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 质量门与文档一致

- [x] T010 From `apps/web_builder` run `rushx type-check` and `rushx lint`; fix issues in `src/extensions/features/editor-header-chrome/`, `src/extensions/features/theme-switcher/index.ts`, and `src/core/editor.ts`
- [x] T011 [P] If shipped slot order or labels differ from `specs/002-settings-theme-user/contracts/header-toolbar-ui.md`, update that contract file to match

---

## Dependencies & Execution Order

### Phase Dependencies

1. Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5  
2. **US2** 依赖 **US1** 中的 `editor-header-chrome/index.ts` 已存在（T006–T007）；T008 可与 T005 并行开发文件，但 **T009** 须在 **T006–T007** 之后。

### User Story Dependencies

- **US1**: 依赖 Phase 2（T003–T004）  
- **US2**: 依赖 US1 的扩展骨架与 `editor.ts` 已注册该扩展（T007）

### Parallel Opportunities

- **Phase 1**: T001 与 T002 [P] 并行阅读  
- **Phase 4**: T008 [P] 与（已完成前提下的）其它只读任务可并行；**T009** 顺序在 T008 之后  
- **Phase 5**: T011 [P] 在 T010 通过后独立改契约

---

## Parallel Example: US1 + US2 组件文件

```text
# 在 Phase 2 完成后、合并进 index 前，可先并行写两个组件文件：
Task: "T005 [US1] Create .../EditorSettingsMenu.tsx ..."
Task: "T008 [P] [US2] Create .../UserProfileChip.tsx ..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1–2（T001–T004）  
2. Phase 3（T005–T007）+ `quickstart.md` **P1**  
3. **STOP** 可演示「设置 → 切换主题」

### Incremental Delivery

1. 接上 Phase 4（T008–T009）+ **P2**  
2. Phase 5（T010–T011）

---

## Notes

- 若将 `EditorHeaderChromeExtension` 拆成两个 `IExtension` 类，须同步调整 T006–T009 与 `editor.ts` 注册项，并保持宪章「扩展优先」原则。  
- 所有任务行格式：`- [ ] Tnnn ...`，含路径；用户故事任务带 `[US1]`/`[US2]`。
