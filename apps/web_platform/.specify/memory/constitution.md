<!--
Sync Impact Report
- Version change: (initial) → 1.0.0
- Modified principles: N/A (initial adoption from template placeholders)
- Added sections: 技术栈与约束, 开发与评审规范
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ Constitution Check gates aligned
  - .specify/templates/spec-template.md — ✅ Requirements 注释增加与 constitution 对照说明
  - .specify/templates/tasks-template.md — ✅ Path Conventions note for apps/web_platform
  - .specify/templates/commands/*.md — ⚠ not present in this repo (no updates)
- Follow-up TODOs: None
-->

# OrangeHome Web Platform（用户端）Constitution

## Core Principles

### I. 应用边界与 Monorepo 协作

- 本宪章适用于 Rush monorepo 中的 `apps/web_platform`（包名 `@orangehome/web_platform`）。
- 功能与依赖变更 MUST 默认限定在本应用目录内；若需修改其他 app 或共享包，MUST 在规格/plan 中说明影响面并协调版本与发布节奏。
- 禁止为“图省事”直接耦合其他应用私有实现路径；共享能力应通过仓库约定的公共包或 API 契约暴露。

**理由**：降低跨团队回归成本，保持应用可独立构建与部署。

### II. 技术栈一致性与类型安全

- 技术栈固定为：React 18、TypeScript、Vite、Semi Design（`@douyinfe/semi-ui`）、react-router-dom、SWR / Zustand、axios、i18next。
- 新代码 MUST 使用 TypeScript；禁止无正当理由的 `any`；公共类型放在 `src/types` 或与模块同目录的清晰类型导出。
- 目录与职责 MUST 与现有结构一致：`pages/`（路由页）、`containers/`（组合与流程）、`components/`（可复用 UI）、`api/`（HTTP 与后端契约）、`hooks/`、`store/`、`services/`、`utils/`。
- 源码导入 MUST 优先使用已配置的 `@/` 路径别名，避免深层相对路径难以维护。

**理由**：与当前代码库一致，降低认知负担与合并冲突。

### III. 前后端契约、环境与安全

- 所有浏览器端 HTTP 访问 MUST 通过统一的 axios 实例或项目内约定的封装（如 `src/api/*`、`src/lib/axios.ts`），以便拦截器、鉴权与错误处理一致。
- API 基地址 MUST 由 `import.meta.env.VITE_BFF_API_URL` 配置；禁止在提交代码中硬编码生产密钥、令牌或仅供个人环境的敏感默认值（开发用本地 `.env` 除外且不得入库）。
- 认证与 401 等行为 MUST 与现有实现一致（如 token 存储、`PUBLIC_AUTH_PATHS`、登录重定向）；新增公开接口路径 MUST 显式纳入白名单或等价机制。
- 路由上受保护页面 MUST 继续使用既有守卫模式（如 `PrivateRoute` / `PublicRoute`），不得绕过鉴权暴露仅登录可见的能力。

**理由**：安全与可运维性依赖单一、可审计的网络与鉴权路径。

### IV. 国际化、主题与体验基线

- 用户可见文案 MUST 通过 i18n（`react-i18next` + `src/i18n/locales`）维护，至少覆盖中文与英文场景；禁止仅在组件内硬编码面向用户的句子（开发调试日志除外）。
- UI MUST 使用 Semi Design 与现有主题/语言加载方式（`ConfigProvider`、`useTheme`、`useLanguage`），保持视觉与交互一致。
- 异步与错误场景 MUST 向用户提供明确反馈（加载态、空态、错误提示），并与现有 Toast / 错误处理模式对齐。

**理由**：产品面向多语言与品牌化体验，避免技术债分裂 UI 与文案来源。

### V. 可验证变更与简单性

- 每个功能增量 MUST 可通过人工验收或项目已约定的验证方式（如 `specs/*/quickstart.md`）说明验证步骤；无法在合理成本下验证的需求 MUST 在规格中拆解或标注为风险。
- 实现上优先最小可行改动（YAGNI）；引入新依赖、新状态管理方案或大规模重构 MUST 在 `plan.md` 的 Constitution Check / Complexity Tracking 中说明必要性及拒绝更简单方案的原因。
- 构建与部署相关配置（如 `vite.config.ts` 中的 `base` / `ORANGEHOME_VITE_BASE`）若变更，MUST 在文档或规格中说明对部署路径的影响。

**理由**：保持交付可预测，避免过度工程。

## 技术栈与约束

| 类别 | 要求 |
|------|------|
| 运行时 | 现代浏览器；本地开发端口默认 `3008`（以 `vite.config.ts` 为准） |
| 构建 | Vite 5；`base` 受 `ORANGEHOME_VITE_BASE` 等环境约束时需与部署文档一致 |
| 包管理 | 遵循仓库 Rush/pnpm 工作流；不在本应用内引入与 monorepo 冲突的第二套包管理器 |
| 样式 | SCSS/Semi 变量与全局样式放在既有 `styles/` 与组件侧 `.scss` 中，避免内联样式扩散（已有模式如加载页除外） |
| 测试 | 当前以手动与规格验收为主；引入自动化测试时 MUST 与 plan/tasks 中约定框架一致并纳入 CI（若仓库已配置） |

## 开发与评审规范

- 使用 Specify 工作流时：`spec.md` MUST 包含可独立测试的用户故事与验收场景；`plan.md` MUST 在 **Constitution Check** 中逐条对照本宪章并说明例外（若有）。
- Code review MUST 检查：类型安全、API/环境变量使用、i18n 与敏感信息、路由鉴权是否被破坏。
- 与用户端 BFF/后端契约变更 MUST 在 `contracts/` 或 `api` 层类型与调用处同步更新，避免前后端漂移。

## Governance

- 本宪章优先于本应用内与之冲突的临时约定；冲突时以本文件为准并应修订旧文档。
- 修订程序：修改 `.specify/memory/constitution.md` → 更新 **Version** 与 **Last Amended** → 同步调整 `plan-template.md` 等依赖模板中的 Constitution Check（如原则增删）→ 在 PR 描述中简要说明修订原因。
- **版本策略**（语义化）：**MAJOR** — 删除或重新定义原则导致既有 plan 合规性判断改变；**MINOR** — 新增原则或实质性扩展约束；**PATCH** — 措辞澄清、错别字、非语义细化。
- **合规评审**：特性 plan 在 Phase 0 前与 Phase 1 设计后 MUST 重新执行 Constitution Check；合并前 reviewer SHOULD  spot-check 安全与 i18n 相关改动。

**Version**: 1.0.0 | **Ratified**: 2025-03-27 | **Last Amended**: 2025-03-27
