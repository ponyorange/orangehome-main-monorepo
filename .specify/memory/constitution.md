<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: 模板占位符 → 五项正式原则（Rush Monorepo、技术栈与契约、规格驱动、测试与质量闸门、配置与安全）
- Added sections: 「技术与仓库约束」「开发工作流与质量闸门」
- Removed sections: 无（由占位符变为正式章节）
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ Constitution Check 已与闸门对齐
  - .specify/templates/spec-template.md — ✅ 无需结构性修改（已与用户故事/验收口径一致）
  - .specify/templates/tasks-template.md — ✅ 补充 Rush monorepo 路径约定说明
  - .cursor/commands/*.md — ✅ 无 CLAUDE 等过时代理名需改
- Follow-up TODOs: 无
-->

# Orangehome Monorepo Constitution

## Core Principles

### I. Rush Monorepo 一致性

- 依赖安装与构建 MUST 在仓库根目录通过 **Rush** 执行：`rush update`、`rush build`；在包内运行脚本 MUST 使用 `rushx <script>`（先 `cd` 到对应 `apps/<项目>`）。
- 包路径与注册 MUST 与 `rush.json` 一致；新增应用 MUST 纳入 Rush 工程清单，禁止在仓库根引入与 Rush/pnpm 工作流冲突的平行包管理器。
- **理由**：保证依赖图可复现、CI 与本地一致，避免「隐式全局依赖」导致构建漂移。

### II. 技术栈与契约边界

- **前端**（`@orangehome/web_*`）：TypeScript ~5.3、React 18、Vite；UI 与路由等技术选型 MUST 与既有包保持一致，新增依赖需在评审中说明必要性。
- **后端**（`@orangehome/server_*`）：NestJS 10、Node.js 版本 MUST 落在 `rush.json` 的 `nodeSupportedVersionRange` 内；与服务间通信相关的 **gRPC / proto** MUST 以权威来源为准（例如 `proto/core.proto` 由 core-service 同步复制，禁止私自分叉）。
- **理由**：降低跨应用认知负担，保证跨服务契约可审计、可升级。

### III. 规格驱动与可验证交付

- 功能开发 MUST 可追溯到 `specs/<编号-功能名>/` 或 `apps/<应用>/specs/<编号-功能名>/` 下的规格文档（含 `spec.md`）；用户故事 MUST 可独立测试，并带明确优先级（P1、P2…）。
- 验收口径 MUST 使用 **Given / When / Then**（或等价结构化表述）；对跨边界行为 MUST 列出边界与错误场景。
- **理由**：避免口头需求漂移，使实现、测试与评审有共同依据。

### IV. 测试与质量闸门

- 若某包声明了 `test` 与 `lint` 脚本，合并前 MUST 通过 `npm test && npm run lint`（在对应包目录执行）。
- Nest 服务端新逻辑 SHOULD 配套自动化测试（例如 `*.spec.ts` + Jest）；对 HTTP/gRPC 契约或关键路径的变更 SHOULD 增加或更新集成/契约级验证（按功能规格说明）。
- 已建立的健康检查与可观测入口（如 `GET /health`） MUST 在变更后仍可用，除非规格明确废弃并给出迁移说明。
- **理由**：将缺陷左移，保证回归可重复、发布可判断。

### V. 配置、安全与可观测性

- 密钥与本地环境 MUST NOT 提交；MUST 通过 `.env.example` 文档化变量，本地使用 `.env` / `.env.local` 等已约定方式（如 Nest `ConfigModule`）。
- 跨服务调用 MUST 使用配置项中的地址与认证元数据，禁止硬编码生产级秘密。
- **理由**：降低泄露风险，便于多环境部署与审计。

## 技术与仓库约束

| 领域 | 要求 |
|------|------|
| 包管理 | Rush + pnpm（版本以 `rush.json` 为准） |
| Node | `>=18.12.0 <23.0.0`（与 Rush 声明一致）；团队对齐 **Node 20+** 用于与 Nest/工具链一致 |
| 应用 | `@orangehome/web_platform`、`web_builder`、`web_admin`、`server_bside`、`server_cside`（以 `rush.json` 为准） |
| 目录 | 应用代码位于 `apps/<name>/`；公共 Rush 配置位于 `common/config/rush/` |
| Proto | 从权威服务同步；更新流程 MUST 为「覆盖同步」，禁止手写分叉 |

## 开发工作流与质量闸门

- 分支与规格目录命名 SHOULD 与功能编号一致（例如 `001-runtime-page-render`），计划与任务文档（`plan.md`、`tasks.md`）MUST 与同一规格对齐。
- 实施计划中的 **Constitution Check** 须在 Phase 0 前通过；若在架构上偏离原则（例如新增非 Rush 包），MUST 在计划的 Complexity Tracking 中说明原因与更简单方案被拒理由。
- 变更引入新环境变量或运维行为时，MUST 更新对应应用 `README.md` 或规格中的 `quickstart.md`。

## Governance

- 本宪章优先于零散约定；与之冲突的临时做法 MUST 在评审中显式记录并在后续迭代消除或升格为宪章修正案。
- **修订**：修改 `.specify/memory/constitution.md` 须更新版本号、**Last Amended** 日期，并在文件顶部 Sync Impact Report 中记录变更摘要；重大原则删除或重定义须 **MAJOR** 版本递增；新增或实质性扩展指导为 **MINOR**；措辞澄清为 **PATCH**。
- **合规**：PR 审查 SHOULD 对照相关原则（Monorepo、契约、规格、测试、密钥）；应用级细节以各包 `.cursor/rules` 与规格为准，且不得与本宪章抵触。
- **运行时指引**：日常开发在确认无冲突时可参考 `.cursor/rules` 与各 `specs/**/plan.md`；宪章为全仓治理基线。

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30
