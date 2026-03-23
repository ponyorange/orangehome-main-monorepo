<!--
Sync Impact Report
- Version change: (template placeholders only) → 1.0.0
- Principles: 占位符 → I. NestJS 模块化与依赖注入; II. SSG 优先与可缓存交付;
  III. C 端体验与安全基线; IV. 性能与非功能指标; V. 可观测性与运维就绪
- Added sections: 技术与架构约束; 质量与交付流程（替换原 SECTION_2/3 占位）
- Removed sections: 无（自模板占位落地为正式章节）
- Templates: .specify/templates/plan-template.md ✅ | .specify/templates/tasks-template.md ✅ |
  .specify/templates/spec-template.md ✅ | .cursor/commands/speckit.constitution.md ✅
- Follow-up: 无
-->

# server_cside（C 端 SSG 服务端）Constitution

## Core Principles

### I. NestJS 模块化与依赖注入

- 功能 MUST 以 Nest 模块（`*.module.ts`）为边界组织；控制器、服务、守卫、管道职责单一，禁止无边界
  的「上帝模块」堆叠无关提供者。
- 依赖 MUST 通过构造函数注入取得；禁止用服务定位器、全局可变单例承载领域逻辑（框架级引导代码除
  外）。
- 跨模块依赖 MUST 通过模块的 `exports` / `imports` 显式声明，禁止深层相对路径穿透模块边界。

**Rationale**：与现有 `AppModule` + Nest 10 技术栈一致，提升可测性、可替换实现与团队协作清晰度。

### II. SSG 优先与可缓存交付

- 面向 C 端用户的页面与公共资源，在产品允许的前提下 MUST 优先静态化（构建期生成或预渲染），减少
  运行时拼装与数据库依赖。
- 对仍需动态的接口，MUST 在方案中写明缓存策略（CDN、浏览器、`Cache-Control` 等）与失效条件。
- 已发布的静态资源 URL MUST 保持稳定；若 breaking 变更不可避免，MUST 采用版本化路径或迁移说明。

**Rationale**：本项目定位为 SSG 服务端，静态化与可缓存性是性能与成本的核心杠杆。

### III. C 端体验与安全基线

- 对外错误响应 MUST 使用稳定、可理解的业务语义，禁止返回堆栈、内部路径、连接串或密钥片段。
- 不可信输入 MUST 在边界层（控制器 / 全局管道 / 守卫）完成校验与规范化。
- 生产部署目标 MUST 启用 HTTPS（或由边缘终止 TLS 且到源为受信链路），与运维约定一致。

**Rationale**：C 端流量暴露面大，错误与输入处理直接影响用户信任与合规。

### IV. 性能与非功能指标

- 热路径（高频请求或页面生成关键路径）上 MUST 避免长时间同步阻塞（如同步磁盘大读写、未设上限的
  CPU 密集计算）；若需重任务，MUST 拆到异步任务或构建阶段。
- 对明显影响延迟或吞吐的功能，plan/spec MUST 写明可验证指标（例如 p95 延迟、QPS、SSG 构建耗时
  上限）；无数据时标注 `NEEDS CLARIFICATION` 并在实现前补齐。
- 微优化前 SHOULD 先通过测量（日志、压测、profiler）定位瓶颈，禁止无依据的过早优化。

**Rationale**：满足「高性能」目标，并把性能从口号落实为可验收标准。

### V. 可观测性与运维就绪

- 请求级错误与关键业务事件 MUST 具备可检索日志（结构化字段或统一前缀），在 HTTP 场景下 SHOULD 支
  持关联 ID（若中间件或网关提供）。
- 面向负载均衡或编排部署时，MUST 提供健康检查语义（如 Nest Terminus 或等价机制），与部署文档一
  致。

**Rationale**：C 端流量需要可诊断、可扩容，避免黑盒故障。

## 技术与架构约束

- **语言与运行时**：TypeScript（版本与 `strict` 选项以仓库配置为准）；Node.js 宜与团队 LTS 策略一
  致。
- **主框架**：NestJS 10.x；默认 HTTP 适配为 `@nestjs/platform-express`（若变更适配器须在 plan 中论
  证并更新本宪章相关描述）。
- **工程位置**：npm 包名 `@orangehome/server_cside`，应用位于 monorepo 的 `apps/server_cside`；
  构建与启动脚本以 `package.json` 为准（`nest build`、`nest start`、`node dist/main`）。
- **依赖治理**：新增重型依赖或替代默认栈组件 MUST 在 `plan.md` 的 Constitution Check 中说明理由与
  对性能/安全的影响。

## 质量与交付流程

- 功能开发 MUST 具备可追溯的 `spec.md` 与 `plan.md`（由 Speckit 工作流生成或等价文档）；`plan.md`
  中的 **Constitution Check** 须在 Phase 0 研究前通过，Phase 1 设计后复验。
- 合并请求 MUST 对改动触及的原则逐条自检（模块边界、SSG/缓存、安全响应、性能指标、可观测性）。
- 当 `spec.md` 明确要求测试时：MUST 在合并前提供对应自动化测试（单测或集成测，按特性选择）；未要
  求时 SHOULD 仍为关键 HTTP 契约或 SSG 管线变更补充最小回归覆盖。

## Governance

- 本宪章优先于仓库内与之冲突的非正式约定；冲突时在 PR 中显式说明并先修订宪章或取得豁免记录。
- **修订程序**：修改原则或约束时须更新本文、递增版本号、更新 **Last Amended**，并同步检查
  `.specify/templates/plan-template.md` 中 Constitution Check 是否仍对齐。
- **版本策略**：语义化版本。MAJOR：删除或重新定义原则导致既有计划失效；MINOR：新增原则或实质性扩
  展约束；PATCH：措辞澄清与非语义修订。
- **合规审查**：计划评审与代码审查须将 Core Principles 与「技术与架构约束」作为门禁；Complexity
  Tracking 表仅用于记录经批准的例外及原因。

**Version**: 1.0.0 | **Ratified**: 2025-03-23 | **Last Amended**: 2025-03-23
