<!--
Sync Impact Report
- Version change: (unratified placeholders) → 1.0.0
- Principles: 全部为新建（原模板占位符）
  - Monorepo 与 Rush 工作流
  - 契约优先与跨服务一致性
  - NestJS / TypeScript 实现纪律
  - 测试与可验证交付
  - 安全、配置与可观测性
- Added sections: 技术栈与边界、规范与交付流程（由原 SECTION_2/3 具像化）
- Removed sections: 无（由占位符变为正式章节）
- Templates:
  - ✅ .specify/templates/plan-template.md（Constitution Check 门禁）
  - ✅ .specify/templates/spec-template.md（Constitution Alignment）
  - ✅ .specify/templates/tasks-template.md（Rush 路径约定）
  - ✅ .specify/templates/checklist-template.md（无需改：无 constitution 硬编码）
  - ✅ .specify/templates/agent-file-template.md（无需改）
- Follow-up TODOs: 无
-->

# Orangehome Monorepo Constitution（server_bside / SpecKit 工作区）

本宪法适用于本仓库中通过 SpecKit（`.specify/`）驱动、以 `apps/server_bside` 为工作区锚点的特性规划与实现；与仓库根目录 `README.md` 及 Rush monorepo 约定一并生效。

## Core Principles

### I. Monorepo 与 Rush 工作流

- 依赖安装与批量构建 MUST 在 monorepo 根目录通过 `rush update`、`rush build` 执行；单包开发 MUST 使用 `rushx` 在对应 `apps/*` 目录运行脚本。
- 新增或调整包边界、Rush 工程引用 MUST 在 `plan.md` 的「Project Structure」中写明，并说明对其它 `@orangehome/*` 包的影响。
- **理由**：避免绕过 Rush 的依赖图与版本策略，降低「本地能跑、CI 不能」的差异。

### II. 契约优先与跨服务一致性

- 对外的 gRPC / HTTP 契约（如 `proto/*.proto`、OpenAPI/Swagger 定义）MUST 作为单一事实来源；修改契约 MUST 同步说明消费者（`server_cside`、`web_*` 等）与兼容策略（向后兼容或显式破坏性变更）。
- 破坏性协议变更 MUST 标注版本或迁移步骤，并在 `plan.md` 的 Constitution Check 中通过门禁说明。
- **理由**：B/C 端与多端前端并存时，契约漂移是最常见集成故障源。

### III. NestJS / TypeScript 实现纪律

- `server_bside` 中的实现 MUST 遵循现有 Nest 模块边界与依赖注入风格；DTO MUST 使用 `class-validator` / `class-transformer` 等与现栈一致的手段做输入校验。
- 配置与密钥 MUST 通过 `@nestjs/config`（或项目既定模式）注入，禁止将密钥写入源码或提交到仓库。
- **理由**：与现有代码库一致，降低审查成本与运行时配置事故。

### IV. 测试与可验证交付

- `spec.md` 中的用户故事 MUST 各自可独立验收；`tasks.md` MUST 按用户故事组织任务，且关键路径须有可执行的验证方式（自动化测试或 `quickstart.md` 中的手动步骤）。
- 若特性声明需要自动化测试：MUST 在实现前或同步于实现编写失败用例再变绿；涉及契约或跨服务行为 MUST 包含契约或集成级验证（具体工具以 `plan.md` 技术上下文为准）。
- **理由**：SpecKit 流程依赖「可独立测试的故事」作为交付与回滚单位。

### V. 安全、配置与可观测性

- 认证授权边界、敏感数据与日志中个人数据 MUST 按最小权限与脱敏原则处理；错误响应 MUST 避免向客户端泄露内部栈细节（开发环境可另行约定）。
- 服务 MUST 使用结构化或一致的日志字段，便于排查；新增关键路径 SHOULD 具备可观测性（请求标识、错误码等），并在计划中说明。
- **理由**：B 端服务承载管理与数据面，安全与可诊断性是运维基线。

## 技术栈与边界

- **运行时**：Node.js >= 18.12.0（以根 `README.md` 为准）。
- **本工作区后端**：NestJS 10、TypeScript 5.x、gRPC（`@grpc/grpc-js`、`@nestjs/microservices`）及 `proto` 定义；HTTP 栈以项目现有 Express 平台为准。
- **同仓库其它包**：`web_platform`、`web_builder`（React + Vite + TypeScript）、`server_cside`（NestJS）；特性若跨包，必须在 spec/plan 中列出受影响包名。
- **Docker / 部署**：以仓库内现有脚本与 `docker-compose` 为准；新增服务端口与环境变量 MUST 在计划或 quickstart 中记录。

## 规范与交付流程

- 特性文档 MUST 位于 `specs/<分支或特性目录>/`，至少包含 `spec.md`；实现计划与任务分别由 `/speckit.plan`、`/speckit.tasks` 等流程生成或维护的 `plan.md`、`tasks.md` 等补齐。
- 在进入 Phase 0 研究与 Phase 1 设计前后，MUST 按 `plan-template.md` 中的 **Constitution Check** 自检；存在违背须在 **Complexity Tracking** 表中说明原因及更简单方案被拒绝的理由。
- PR 审查 SHOULD 核对：契约与 consumer 列表、Rush 边界、安全与日志约定、以及 spec 中成功标准是否仍与技术无关且可度量。

## Governance

- 本宪法优先于同一工作区内与 SpecKit 冲突的临时约定；与组织级安全/合规策略冲突时，以组织策略为准并应修订本文件。
- **修订程序**：修改 `.specify/memory/constitution.md`，更新 **Version**（语义化版本：MAJOR = 原则删除或重新定义；MINOR = 新增或重大扩充；PATCH = 澄清与文字修正），更新 **Last Amended**，并在文件顶部 Sync Impact Report 中记录变更摘要。
- **合规**：每个 SpecKit 特性的 `plan.md` MUST 包含通过的 Constitution Check 或已登记的违规豁免；重大特性发布前建议对照本文件做一次快速合规核对。
- **运行时指引**：日常环境与命令以 monorepo 根目录 `README.md` 为准。

**Version**: 1.0.0 | **Ratified**: 2026-03-27 | **Last Amended**: 2026-03-27
