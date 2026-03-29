# Implementation Plan: 登录页品牌与布局升级

**Branch**: `001-premium-login-page` | **Date**: 2025-03-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-premium-login-page/spec.md`

## Summary

将 **登录页**（当前路由由 `App.tsx` 挂载 `src/pages/Login`）升级为左右分栏：左侧为 OrangeHome 低代码产品介绍（3～6 条要点）与 **橙子品牌角色**，在支持精细指针且未启用「减少动态效果」时 **眼部/视线跟随指针**；右侧为简洁登录表单。整页以 **温和暖橙** 为主色，并保持可读对比度。  
**注册页、重置密码页**（`src/pages/Register`、`src/pages/ResetPassword`）按澄清结论 **仅对齐配色与字体等全局观感**，不引入左右分栏与橙子视线动画（见 FR-008）。

技术路径：在 `apps/web_platform` 内以 React 18 + TS + SCSS 实现；橙子角色优先 **SVG + CSS transform**（无必选新依赖）；断点与无障碍策略见 [research.md](./research.md)。登录页新增/调整的可见文案 **全部走 i18n**（`src/i18n/locales`），以满足宪章与 FR-007；认证逻辑仍走既有 `src/api/auth` 与 `authStore`，成功跳转维持当前 **`/projects`**。

## Technical Context

**Language/Version**: TypeScript ~5.3、React 18  
**Primary Dependencies**: Vite 5、Semi Design（`@douyinfe/semi-ui`）、react-router-dom、react-i18next、axios（经 `src/api/auth`）、Zustand（`authStore`）  
**Storage**: N/A（无服务端实体变更）  
**Testing**: 以规格与 [quickstart.md](./quickstart.md) 手工验收为主；本 plan 不强制新增 E2E 框架  
**Target Platform**: 现代桌面浏览器（首屏宽屏体验）；窄视口纵向堆叠降级  
**Project Type**: SPA 前端（`apps/web_platform`）  
**Performance Goals**: 指针移动时仅更新轻量 DOM/SVG 变换；避免全页重绘与未节流的密集 setState（建议 `requestAnimationFrame` 或节流）  
**Constraints**: 不修改 BFF 契约与鉴权白名单；不提交密钥；`prefers-reduced-motion: reduce` 下关闭视线追踪；触摸/粗指针下静态或可忽略动画  
**Scale/Scope**: 单应用内 1 个登录全量改版 + 2 个认证子页样式对齐

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

对照 `.specify/memory/constitution.md`（OrangeHome Web Platform）逐项确认：

- [x] **I. 应用边界**：变更限于 `apps/web_platform`；无跨 app 依赖。
- [x] **II. 技术栈与结构**：React 18 + TS + Vite + Semi；新组件落在 `components/`、`pages/Login`；使用 `@/` 别名。
- [x] **III. 契约与安全**：登录仍调用既有 `login()` / `authStore`；不新增公开 API 路径；不改动 `VITE_BFF_API_URL` 使用方式。
- [x] **IV. i18n 与体验**：登录页新文案与从硬编码迁出的文案走 `react-i18next`；Toast/加载与现网一致。
- [x] **V. 可验证与简单性**：验收步骤见 `quickstart.md`；不引入新状态管理方案；无大规模无关重构。

若任一项不满足，必须在 **Complexity Tracking** 中记录例外理由与更简单方案被拒原因。

### Post Phase 1 Re-check（2025-03-27）

- [x] 设计仍满足以上五项；未引入计划外依赖；`contracts/login-ui-layout.md` 与实现路径一致。

## Project Structure

### Documentation (this feature)

```text
specs/001-premium-login-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-ui-layout.md
└── tasks.md              # /speckit.tasks（本命令不生成）
```

### Source Code (`apps/web_platform`)

```text
src/
├── pages/
│   ├── Login/
│   │   ├── index.tsx          # 挂载新版左右布局与表单区
│   │   └── index.scss
│   ├── Register/
│   │   ├── index.tsx          # 逻辑不变；引入共享主题变量/类（若需）
│   │   └── index.scss
│   └── ResetPassword/
│       ├── index.tsx
│       └── index.scss
├── components/
│   ├── LoginMarketingPanel/   # 左栏：要点列表 + 预留橙子区域（新建，名称可微调）
│   ├── OrangeMascot/          # 橙子角色 + 视线跟随（新建）
│   └── …（既有 AuthLayout/LoginForm 未被 App 使用；本特性以 pages/Login 为准，可选后续收敛）
├── styles/
│   └── auth-theme.scss        # 共享暖橙 token（新建，供 Login + Register + ResetPassword 引用）
└── i18n/locales/
    ├── zh-CN.json             # 登录营销文案、标题等 key
    └── en-US.json
```

**Structure Decision**：当前生产路由使用 **`pages/Login`**（非 `LoginContainer`）。新版以该页为主入口，抽出可测可复用的左栏与吉祥物子组件；认证子页通过 **共享 SCSS 变量/占位类** 满足 FR-008，避免复制左右分栏结构。

## Complexity Tracking

本特性 **无** 宪法检查违例，无需填写例外表。

---

## Phase 0 & 1 产出索引

| 产出 | 路径 | 说明 |
|------|------|------|
| 研究决策 | [research.md](./research.md) | 断点、动效降级、吉祥物实现、共享主题 |
| 数据 | [data-model.md](./data-model.md) | 无持久化实体；可选 UI 状态说明 |
| UI 契约 | [contracts/login-ui-layout.md](./contracts/login-ui-layout.md) | 区域、断点、无障碍期望（供实现与验收对齐） |
| 验收步骤 | [quickstart.md](./quickstart.md) | 手工走查清单 |
| Agent 上下文 | `.cursor/rules/specify-rules.mdc` | `update-agent-context.sh cursor-agent` 更新 |
