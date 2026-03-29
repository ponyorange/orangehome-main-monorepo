---
description: "Task list — 平台高级化与表单视觉统一（002-premium-orange-ui）"
---

# Tasks: 平台高级化与表单视觉统一（暖橙主色）

**Input**: `/specs/002-premium-orange-ui/`（`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`）

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/ ✓ · quickstart.md ✓

**Tests**: 规格未要求自动化测试；验收以 `quickstart.md` 与 `contracts/platform-form-shell.md` 走查为准。

**Organization**: US1 → US2 → US3（P3 壳层）；Foundational 提供全站 token 与全局链色后再改各故事。

## Format: `[ID] [P?] [Story] Description`

路径相对于 `apps/web_platform/`（`src/` = `apps/web_platform/src/`）。

---

## Phase 1: Setup（共享 token）

**Purpose**: 建立平台级暖橙 token，供主壳与表单共用（见 `research.md` R1）。

- [x] T001 Create `src/styles/platform-theme.scss` defining shared `--oh-*` (and/or re-exporting `--auth-*`) variables for primary, surface, border, text-muted per `specs/002-premium-orange-ui/research.md` R1

---

## Phase 2: Foundational（阻塞各用户故事）

**Purpose**: 登录后主区域链色与 Semi 主色变量与暖橙对齐（见 `research.md` R2）。

**⚠️ CRITICAL**: 完成后再进入 US1–US3，避免各页重复覆盖。

- [x] T002 Update `src/styles/global.scss` to replace hardcoded cool link colors (`#667eea` / hover) with platform token-based link styles scoped appropriately for logged-in shell (e.g. `.main-layout` or `.app`) per `specs/002-premium-orange-ui/research.md` R2
- [x] T003 Import `src/styles/platform-theme.scss` from `src/styles/global.scss` (or `src/App.tsx` side-effect import once) so variables apply before component SCSS

**Checkpoint**: 全局链色不再以冷紫为主；`--oh-*` 可用。

---

## Phase 3: User Story 1 — 创建项目表单统一 (Priority: P1) 🎯 MVP

**Goal**: 「新建项目」Modal + Form 满足 `contracts/platform-form-shell.md` 八项与 FR-001/FR-002/FR-006。

**Independent Test**: 仅打开创建项目弹窗对照契约走查，无需改「新建页面」。

### Implementation for User Story 1

- [x] T004 [US1] Add shared styles in `src/styles/_form-modal.scss` (or `src/styles/form-modal.scss`) implementing `.oh-form-modal` rules (Modal body, vertical Form spacing, `.form-actions`, primary/tertiary buttons) per `specs/002-premium-orange-ui/contracts/platform-form-shell.md`
- [x] T005 [US1] Import shared form-modal styles into `src/pages/Projects/index.scss` and set `className="oh-form-modal"` (or wrapper) on the create-project `Modal` in `src/pages/Projects/index.tsx`; set Form `layout="vertical"` if missing; align submit button to `theme="solid"` + orange token
- [x] T006 [US1] Migrate user-visible strings for the create-project flow in `src/pages/Projects/index.tsx` to `useTranslation` with keys in `src/i18n/locales/zh-CN.json` and `src/i18n/locales/en-US.json` (modal title, labels, buttons, toasts if touched)

**Checkpoint**: US1 单独可验收。

---

## Phase 4: User Story 2 — 创建页面表单统一 (Priority: P2)

**Goal**: 「新建页面」Modal 与创建项目共用 `.oh-form-modal` 视觉规则；i18n 覆盖弹窗与关键文案。

**Independent Test**: 对照同一契约八项与创建项目并排比对。

### Implementation for User Story 2

- [x] T007 [US2] Apply `className="oh-form-modal"` (same as US1) to the create-page `Modal` in `src/pages/ProjectDetail/index.tsx`
- [x] T008 [US2] Import the shared form-modal stylesheet in `src/pages/ProjectDetail/index.scss` and ensure footer buttons match US1 (cancel tertiary + primary solid orange)
- [x] T009 [US2] Replace hardcoded Chinese in create-page modal and high-traffic strings in `src/pages/ProjectDetail/index.tsx` with `useTranslation` keys in `src/i18n/locales/zh-CN.json` and `src/i18n/locales/en-US.json`

**Checkpoint**: US1+US2 视觉一致。

---

## Phase 5: User Story 3 — 全平台壳层高级化 (Priority: P3)

**Goal**: Header、Layout、项目列表/详情主容器层次与暖橙协调（可分阶段，见 `research.md` R4）。

**Independent Test**: 至少三屏走查（列表、详情、含表单之一），无刺眼默认蓝主按钮主导业务区。

### Implementation for User Story 3

- [x] T010 [US3] Refine `src/components/Header/index.scss` (subtle border/shadow, typography, nav accent) using `platform-theme` tokens
- [x] T011 [P] [US3] Refine `src/components/Layout/index.scss` for main content background, max-width/padding rhythm
- [x] T012 [US3] Polish `src/pages/Projects/index.scss` (page-header, table area, cards) for consistent radius/shadow with tokens
- [x] T013 [US3] Polish `src/pages/ProjectDetail/index.scss` (tabs, cards, toolbar) for the same baseline

**Checkpoint**: P3 基线达成或文档化阶段二待办。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 契约与 quickstart 闭环。

- [x] T014 Execute manual steps in `specs/002-premium-orange-ui/quickstart.md` and fix issues in `src/pages/Projects/index.tsx`, `src/pages/ProjectDetail/index.tsx`, `src/components/Layout/index.scss`, `src/components/Header/index.scss`, `src/styles/global.scss`
- [x] T015 Mark off all eight rows in `specs/002-premium-orange-ui/contracts/platform-form-shell.md` for **both** modals (note exceptions in PR if any)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6**
- **US2** depends on **T004** shared `.oh-form-modal` styles（可先合并 T004 再并行 US1/US2 的页面挂载，但执行顺序上 T004 先于 T007）。

### Parallel Opportunities

- T011 ∥ T012（不同 SCSS 文件，在 T002–T003 完成后可与 T010 错开由不同人处理）
- T006 ∥（在 T005 稳定后）可与 T004 分文件，但 i18n 依赖文案冻结，建议 T005 后做 T006

---

## Parallel Example: User Story 3

```bash
# 可同时进行：
Task T011 — src/components/Layout/index.scss
Task T012 — src/pages/Projects/index.scss
# 然后串行与其它 US3 任务合并视觉审查
```

---

## Implementation Strategy

### MVP First（仅 US1）

1. T001 → T003 → T004 → T005 → T006  
2. **STOP**：按 `quickstart.md` 节 A 验收创建项目。

### Incremental

1. 加 US2（T007–T009）  
2. 加 US3（T010–T013）  
3. T014–T015 收尾

---

## Task Summary

| 阶段 | Task IDs | 数量 |
|------|-----------|------|
| Setup | T001 | 1 |
| Foundational | T002–T003 | 2 |
| US1 | T004–T006 | 3 |
| US2 | T007–T009 | 3 |
| US3 | T010–T013 | 4 |
| Polish | T014–T015 | 2 |
| **Total** | **T001–T015** | **15** |

**Suggested MVP scope**: T001–T006（Setup + Foundational + US1）。
