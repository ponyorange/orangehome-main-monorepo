---
description: "Task list — 登录页品牌与布局升级 (001-premium-login-page)"
---

# Tasks: 登录页品牌与布局升级

**Input**: Design documents from `/specs/001-premium-login-page/`（`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`）

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/ ✓ · quickstart.md ✓

**Tests**: 规格未要求自动化测试；验收以 `quickstart.md` 手工走查为准（无单独测试任务）。

**Organization**: 按用户故事 P1→P2→P3 分阶段；Foundational 完成后方可进入 US1。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 用户故事阶段必填 `[US1]` / `[US2]` / `[US3]`
- 路径相对于 `apps/web_platform/`（即 `src/` = `apps/web_platform/src/`）

## Path Conventions

本特性实现于 `apps/web_platform/src/`：`pages/`、`components/`、`styles/`、`i18n/locales/`；别名 `@/` 见 `vite.config.ts`。

---

## Phase 1: Setup（共享基础）

**Purpose**: 建立共享主题源文件，供登录与子页引用。

- [x] T001 Create `src/styles/auth-theme.scss` with warm-orange CSS variables and any shared auth-surface tokens per `specs/001-premium-login-page/research.md` R4 and `contracts/login-ui-layout.md`

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: i18n 文案键就绪，避免用户故事阶段硬编码。

**⚠️ CRITICAL**: 完成本阶段前不要开始 US1/US2/US3 实现。

- [x] T002 [P] Add login page + marketing bullet keys (3–6) and login-related toasts/messages to `src/i18n/locales/zh-CN.json` per FR-003/FR-007
- [x] T003 [P] Add matching keys to `src/i18n/locales/en-US.json` (parity with T002)

**Checkpoint**: `auth-theme.scss` 存在；中英 JSON 键对齐 — 可开始 US1。

---

## Phase 3: User Story 1 — 在新版登录页完成登录 (Priority: P1) 🎯 MVP

**Goal**: 宽屏左右壳 + 右侧表单区；`login` + `authStore` 不变；成功跳转 `/projects`；错误与 Toast 可理解且走 i18n。

**Independent Test**: 左栏可暂为占位空白；仅用有效/无效凭据验证登录成功/失败行为与 `spec.md` US1 一致。

### Implementation for User Story 1

- [x] T004 [US1] Refactor `src/pages/Login/index.tsx` to a two-column responsive shell (≥1024px split, &lt;768px stack per research): right column hosts email/password `Form` + submit; replace hardcoded strings with `useTranslation`; keep imports from `src/api/auth` and `src/store/authStore`; `navigate('/projects')` on success
- [x] T005 [US1] Rewrite `src/pages/Login/index.scss` for split/stack layout, warm-orange surfaces via `auth-theme.scss`, readable contrast for labels/inputs/links; no left-panel marketing content yet (placeholder acceptable)

**Checkpoint**: US1 可独立验收 — 登录主路径可用。

---

## Phase 4: User Story 2 — 了解 OrangeHome 低代码价值 (Priority: P2)

**Goal**: 左栏展示 3～6 条 i18n 要点；视觉层次清晰，不阻碍右侧登录。

**Independent Test**: 不提交表单，评审左栏要点数量与可读性（对照 FR-003）。

### Implementation for User Story 2

- [x] T006 [P] [US2] Create `src/components/LoginMarketingPanel/index.tsx` rendering title/intro + 3–6 bullet items from i18n keys added in T002/T003
- [x] T007 [P] [US2] Create `src/components/LoginMarketingPanel/LoginMarketingPanel.scss` for list typography and spacing within left column
- [x] T008 [US2] Replace left-column placeholder in `src/pages/Login/index.tsx` with `LoginMarketingPanel` composition (import from `@/components/LoginMarketingPanel`)

**Checkpoint**: US1+US2 同时满足 — 左介绍 + 右登录。

---

## Phase 5: User Story 3 — 与橙子品牌角色互动 (Priority: P3)

**Goal**: 左栏橙子角色；`(pointer: fine)` 且非 `prefers-reduced-motion: reduce` 时眼部/视线可感知跟随指针；否则静态或可忽略动画。

**Independent Test**: 左栏内移动光标观察眼部；开启系统减少动效后信息完整（对照 `contracts/login-ui-layout.md`）。

### Implementation for User Story 3

- [x] T009 [US3] Create `src/components/OrangeMascot/index.tsx`: SVG (or subcomponents) + pointer tracking within container bounds using `requestAnimationFrame` or throttling; gate on `matchMedia('(prefers-reduced-motion: reduce)')` and `(pointer: fine)` per `specs/001-premium-login-page/research.md` R2–R3
- [x] T010 [P] [US3] Create `src/components/OrangeMascot/OrangeMascot.scss` for sizing/placement inside left column
- [x] T011 [US3] Integrate `OrangeMascot` into `src/components/LoginMarketingPanel/index.tsx` (or `src/pages/Login/index.tsx` left column) without blocking text or form at any breakpoint

**Checkpoint**: US1+US2+US3 全满足。

---

## Phase 6: FR-008 — 注册 / 重置密码页视觉对齐

**Purpose**: 子页仅共享配色/字体气质；禁止左右分栏营销区与橙子视线动画。

- [x] T012 [P] Update `src/pages/Register/index.scss` to import/use variables from `src/styles/auth-theme.scss`; keep existing single-card layout structure in `src/pages/Register/index.tsx` (no new split layout, no mascot)
- [x] T013 [P] Update `src/pages/ResetPassword/index.scss` to import/use variables from `src/styles/auth-theme.scss`; keep existing layout in `src/pages/ResetPassword/index.tsx` (no split layout, no mascot)

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: 走查、清理、与规格一致。

- [x] T014 Execute manual checklist in `specs/001-premium-login-page/quickstart.md` and fix issues in affected files under `src/pages/Login/`, `src/components/LoginMarketingPanel/`, `src/components/OrangeMascot/`, `src/pages/Register/`, `src/pages/ResetPassword/`
- [x] T015 Confirm `src/pages/Login/index.tsx` has no user-visible hardcoded Chinese/English outside i18n (FR-007); align session-expired Toast copy with i18n if shown on this page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 → Phase 7**
- **Phase 6** 可在 **Phase 3 完成后** 与 US4 无阻塞时并行开发（与 US2/US3 独立），但建议在 US1 稳定后再改子页样式，减少回归面。

### User Story Dependencies

- **US1**: 仅依赖 Foundational（T001–T003）。
- **US2**: 依赖 US1 壳与右栏（T004–T005）。
- **US3**: 依赖 US2 左栏容器（T008）。

### Parallel Opportunities

- T002 ∥ T003（中英 locale）
- T006 ∥ T007（Marketing 组件 TS + SCSS）
- T010 ∥（在 T009 接口稳定后）可与 T009 结尾衔接，或 T009+T010 同一人串行
- T012 ∥ T013（Register / ResetPassword 样式）

---

## Parallel Example: User Story 2

```bash
# 可同时进行：
Task T006 — Create src/components/LoginMarketingPanel/index.tsx
Task T007 — Create src/components/LoginMarketingPanel/LoginMarketingPanel.scss
# 然后串行：
Task T008 — Wire panel into src/pages/Login/index.tsx
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1–2 → Phase 3（T004–T005）
2. **STOP**：按 `quickstart.md` 验证登录路径
3. 再继续 US2 → US3 → FR-008 子页 → Polish

### Incremental Delivery

1. US1 上线可演示「新壳 + 可登录」
2. US2 增加左栏价值陈述
3. US3 增加橙子互动
4. Phase 6 统一注册/重置密码气质

---

## Task Summary

| 阶段 | Task IDs | 数量 |
|------|-----------|------|
| Setup | T001 | 1 |
| Foundational | T002–T003 | 2 |
| US1 | T004–T005 | 2 |
| US2 | T006–T008 | 3 |
| US3 | T009–T011 | 3 |
| FR-008 | T012–T013 | 2 |
| Polish | T014–T015 | 2 |
| **Total** | **T001–T015** | **15** |

**Suggested MVP scope**: Phase 1–3（T001–T005）.
