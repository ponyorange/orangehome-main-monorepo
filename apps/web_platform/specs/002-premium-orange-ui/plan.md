# Implementation Plan: 平台高级化与表单视觉统一（暖橙主色）

**Branch**: `002-premium-orange-ui` | **Date**: 2025-03-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-premium-orange-ui/spec.md`

## Summary

在 `apps/web_platform` 内统一 **创建项目**（`src/pages/Projects/index.tsx` 内 Modal + Form）与 **创建页面**（`src/pages/ProjectDetail/index.tsx` 内 Modal + Form）的表单壳层：间距、标题、主/次按钮、错误态与暖橙主色；并提升登录后主界面观感（`MainLayout`、`Header`、`global.scss`、项目列表/详情页卡片与表格区域的层次与链接色），**不改动** `createProject` / `createPage` 的请求字段与校验语义。  
实现上以 **SCSS + Semi 组件** 为主：抽取或复用与 `src/styles/auth-theme.scss` 一致的 **平台级 CSS 变量**（可扩展为 `platform-theme.scss` 或在 `global.scss` 定义 `:root` token），对 Modal、Form、Button、Table、Nav 等做 **克制** 的局部覆盖；新增/调整的可见文案走 **i18n**。

## Technical Context

**Language/Version**: TypeScript ~5.3、React 18  
**Primary Dependencies**: Vite 5、Semi Design、`react-router-dom`、SWR、react-i18next  
**Storage**: N/A（无后端实体或 API 契约变更）  
**Testing**: 手工走查 + [quickstart.md](./quickstart.md)；不强制新增 E2E  
**Target Platform**: 现代浏览器；典型笔记本宽度 1280～1440  
**Project Type**: SPA（`apps/web_platform`）  
**Performance Goals**: 样式层变更，无额外运行时负担；避免大范围 `!important` 链导致维护困难  
**Constraints**: 不修改鉴权与 `VITE_BFF_API_URL`；不引入与 Semi 冲突的第二套组件库；FR-006 要求中英文案  
**Scale/Scope**: 2 个创建类 Modal + 壳层（Layout/Header/全局链接色）+ 项目列表/详情主要容器（P3 可分阶段）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

对照 `.specify/memory/constitution.md`（OrangeHome Web Platform）逐项确认：

- [x] **I. 应用边界**：变更限于 `apps/web_platform`。
- [x] **II. 技术栈与结构**：React 18 + TS + Vite + Semi；样式入 `src/styles/`、`*.scss`；可选新增 `src/components/` 下薄封装（如表单壳）。
- [x] **III. 契约与安全**：无 API 路径或载荷变更；HTTP 仍经既有 `api/*`。
- [x] **IV. i18n 与体验**：创建页面弹窗与相关主界面新增/调整文案入 `src/i18n/locales`；Toast 与现网一致。
- [x] **V. 可验证与简单性**：验收见 `quickstart.md`；优先 token + SCSS，拒绝无必要的主题引擎或大规模重构。

若任一项不满足，必须在 **Complexity Tracking** 中记录例外理由与更简单方案被拒原因。

### Post Phase 1 Re-check（2025-03-27）

- [x] 设计与 `contracts/platform-form-shell.md` 一致；无计划外依赖。

## Project Structure

### Documentation (this feature)

```text
specs/002-premium-orange-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── platform-form-shell.md
└── tasks.md              # /speckit.tasks
```

### Source Code (`apps/web_platform`)

```text
src/
├── styles/
│   ├── auth-theme.scss          # 已有暖橙 token，可复用或拆出共享 platform token
│   ├── global.scss              # 全局链接色、Semi 微覆盖、可选 :root 扩展
│   └── themes.scss              # 若存在 Semi 主题相关，评估与暖橙对齐
├── components/
│   ├── Layout/index.scss        # 主内容区背景与留白
│   ├── Header/index.scss        # 顶栏层次与主色点缀
│   └── （可选）PlatformFormModal/ 或仅用共享 class 名挂载两处 Modal
├── pages/
│   ├── Projects/index.tsx|scss   # 创建项目 Modal + 列表壳层
│   └── ProjectDetail/index.tsx|scss  # 创建页面 Modal + Tabs/Card
└── i18n/locales/zh-CN.json, en-US.json
```

**Structure Decision**：以 **页面级 SCSS + 可选小组件** 交付；若两 Modal 规则完全一致，可提取共享 SCSS partial（如 `_form-modal.scss`）由 Projects 与 ProjectDetail 引入，避免复制粘贴。

## Complexity Tracking

本特性无宪法违例需论证，表留空。

---

## Phase 0 & 1 产出索引

| 产出 | 路径 |
|------|------|
| 研究决策 | [research.md](./research.md) |
| 数据 | [data-model.md](./data-model.md) |
| UI 契约 | [contracts/platform-form-shell.md](./contracts/platform-form-shell.md) |
| 验收 | [quickstart.md](./quickstart.md) |
| Agent 上下文 | `.cursor/rules/specify-rules.mdc`（`update-agent-context.sh cursor-agent`） |
