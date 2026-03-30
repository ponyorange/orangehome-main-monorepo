# Implementation Plan: Login Password Transport Protection

**Branch**: `002-login-password-encryption` | **Date**: 2026-03-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-login-password-encryption/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

在 **web_platform** 与 **web_builder** 登录时，将密码以**受保护负载**提交到 **server_bside**；B 端在调用既有 core HTTP 登录前**解密**得到明文密码，再转发至 `CORE_SERVICE_HTTP_URL/api/auth/login`，保持 token 与用户行为与现有实现一致。技术方案采用 **RSA-OAEP + AES-256-GCM 混合加密**，公钥由 B 端公开接口下发，私钥仅配置于 B 端环境；可选共享库 `packages/password-transport` 供两前端复用加密逻辑（详见 [research.md](./research.md)）。

## Technical Context

**Language/Version**: TypeScript ~5.3；Node.js 与 `rush.json` 的 `nodeSupportedVersionRange` 一致；浏览器侧 Web Crypto（现代 Chromium/Safari/Edge 基线）  
**Primary Dependencies**: React 18 + Vite（`web_platform`、`web_builder`）；NestJS 10 + `@nestjs/axios` + `class-validator`（`server_bside`）；Node `crypto`（解密）  
**Storage**: N/A（密钥通过环境变量注入，不落业务库）  
**Testing**: `server_bside` 使用 Jest 单元测试（新增 `*.spec.ts`）；前端以手动/抽检脚本为主，若包内后续增加 `test`/`lint` 则按宪章执行  
**Target Platform**: 浏览器（两前端）+ Node 服务器（BFF）  
**Project Type**: Rush monorepo 内多应用（2 前端 + 1 BFF），可选新增 `packages/password-transport`  
**Performance Goals**: 登录提交路径额外增加 1 次公钥拉取（可缓存）与加解密开销；P95 仍满足规格「约 5 秒内完成登录或明确失败」  
**Constraints**: 私钥不得入库；生产环境禁止无明文开关；core 侧 API 不改为接收密文  
**Scale/Scope**: 覆盖 `POST /auth/login`；注册/重置密码的密码字段同期加密不在本里程碑（见 research）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*Gates are defined in `.specify/memory/constitution.md` (Orangehome Monorepo). Verify at minimum:*

- **Rush Monorepo**：实现代码位于 `apps/web_platform`、`apps/web_builder`、`apps/server_bside`；若新增 `packages/password-transport`，须同步更新 `rush.json` 并 `rush update`。**本计划无平行包管理器。**
- **技术栈与契约**：保持 React/Nest/TS 版本与仓库一致；**不涉及 gRPC/proto 分叉**（本功能仅为 HTTP JSON）。
- **规格驱动**：可追溯至 `specs/002-login-password-encryption/spec.md`；用户故事与验收场景已映射到契约与 data-model。
- **测试与质量闸门**：B 端新增解密与 DTO 校验逻辑，**SHOULD** 配套 Jest；健康检查路由未改动。
- **配置与安全**：私钥与 `ALLOW_PLAIN_PASSWORD_LOGIN` 通过 `.env` / 部署注入，**须在 `quickstart.md` 与 `apps/server_bside` 的 `.env.example` 中记录**（实现任务中落地）。

**Post-Phase 1 re-evaluation**: 无未解决的宪章冲突；新增环境变量与可选 Rush 包已在文档中说明，无违规需写入 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/002-login-password-encryption/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── login-password-transport.md
└── tasks.md             # Phase 2 (/speckit.tasks) — not created by /speckit.plan
```

### Source Code (repository root)

```text
apps/web_platform/src/
├── api/auth.ts                    # login()：改为发送密文负载（或经封装）
├── pages/Login/index.tsx          # 提交前加密（或调用共享封装）
└── …

apps/web_builder/src/
├── data/modules/useUserData.ts    # login()：同上
└── …

apps/server_bside/src/
├── auth/
│   ├── auth.controller.ts         # GET login-crypto-params；POST login 分支
│   ├── auth.service.ts          # 解密后 proxyRequest('POST','/api/auth/login', { email, password })
│   └── dto/auth.dto.ts          # 扩展 Login 请求 DTO / 自定义校验
└── …

packages/password-transport/       # （可选）共享类型 + 浏览器加密函数
├── package.json
└── src/
```

**Structure Decision**: 两前端经 **axios** 现有 `apiClient`/`post` 调用 BFF；BFF 继续 **HTTP 代理** core。若引入 `packages/password-transport`，两前端 `package.json` 依赖该 workspace 包；否则在 `apps/web_platform` 与 `apps/web_builder` 各实现一份等价模块并标注同步风险（research 已对比）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无。新增可选 `packages/` 工程为降低双前端实现漂移，属于宪章允许的 Rush 内扩展，非「绕过 monorepo」。

## Phase 0 & Phase 1 Outputs

| Artifact | Path |
|----------|------|
| Research | `d:\ai_coding\orangehome\main-monorepo\specs\002-login-password-encryption\research.md` |
| Data model | `d:\ai_coding\orangehome\main-monorepo\specs\002-login-password-encryption\data-model.md` |
| Contracts | `d:\ai_coding\orangehome\main-monorepo\specs\002-login-password-encryption\contracts\login-password-transport.md` |
| Quickstart | `d:\ai_coding\orangehome\main-monorepo\specs\002-login-password-encryption\quickstart.md` |

## Agent context

执行 `.specify/scripts/bash/update-agent-context.sh cursor-agent` 以将本计划技术栈摘要合并到 Cursor 规则（若脚本检测到当前功能分支与 `plan.md`）。
