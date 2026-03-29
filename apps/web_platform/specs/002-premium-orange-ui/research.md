# Research: 平台高级化与表单视觉统一

**Feature**: `002-premium-orange-ui` | **Date**: 2025-03-27

## R1 — 设计 token 来源

**Decision**: 在 `src/styles/auth-theme.scss` 已有 `--auth-*` 变量基础上，扩展或新增 **`platform-*` / `--oh-*` 命名** 的 CSS 变量（如 `--oh-primary`、`--oh-surface`、`--oh-border-subtle`、`--oh-text-muted`），供 **非认证页** 主壳、Modal、表格区域共用；认证页继续用现有 `auth-*`，避免破坏已交付登录流。

**Rationale**: 单源色板，满足 FR-002 与规格中的暖橙延伸；符合宪章「样式集中」习惯。

**Alternatives considered**: 仅 Semi `ConfigProvider` theme — 对 Modal/Table 细粒度控制成本高；全新 CSS-in-JS — 与现栈不一致。

## R2 — Semi 主色与全局链接

**Decision**: 在 **`MainLayout` 根或 `global.scss`** 对登录后区域设置 `--semi-color-primary` / `--semi-color-primary-hover` 等与 token 对齐（若 Semi 版本支持）；同时将 **`global.scss` 中 `a { color: #667eea }`** 改为使用平台链色变量，避免业务区仍显冷紫。

**Rationale**: 消除 FR-002 所述冷蓝/冷紫与暖橙冲突；改动面可控。

**Alternatives considered**: 每页单独覆盖链接 — 易漏网。

## R3 — 两表单 Modal 统一方式

**Decision**: 为「创建项目」「新建页面」Modal 使用 **同一 BEM 根类**（如 `.oh-form-modal`），包含：Modal 标题区字重与下边距、Form `layout="vertical"`、字段 `margin-bottom` 统一、底部 `.form-actions` 右对齐与按钮顺序（取消 tertiary + 主提交 solid 橙）、主按钮与 `auth-theme`/platform token 一致。

**Rationale**: 满足 FR-001 与 SC-001 八项检查点可对表验收；不强制抽 React 组件，除非重复超过两处。

**Alternatives considered**: 完全组件化 `PlatformFormModal` — 可后续迭代，首版 SCSS 收敛更快。

## R4 — 全平台「高级感」P3 分阶段

**Decision**: **第一阶段**完成 Layout 背景、Header 底边/阴影、Card 默认阴影与圆角、Table 表头字重；**第二阶段**项目列表空状态/工具条与详情 Tabs 间距（若未在第一阶段覆盖）。不在本 plan 内改 `web_builder`。

**Rationale**: 符合规格假设与可验证性；降低单次 PR 面。

## R5 — 国际化

**Decision**: `ProjectDetail` 创建页弹窗及页面内仍硬编码的中文字符串迁入 **i18n**；`Projects` 创建弹窗若仍有硬编码一并迁移。键名建议 `projects.*`、`projectDetail.*` 前缀。

**Rationale**: FR-006 与宪章 IV。
