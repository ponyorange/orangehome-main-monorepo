---
description: "Task list for Login Password Transport Protection (002)"
---

# Tasks: Login Password Transport Protection

**Input**: Design documents from `/specs/002-login-password-encryption/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/login-password-transport.md](./contracts/login-password-transport.md), [quickstart.md](./quickstart.md)

**Tests**: Jest 单元测试仅针对 `server_bside` 解密逻辑（见 plan.md）；前端以手工/抽检为主。

**Organization**: 任务按阶段与用户故事排列；**建议 MVP**：完成 Phase 1–2 + Phase 3（US3）+ Phase 4（US1）即可在平台端端到端验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 用户故事标签仅出现在对应故事阶段（Setup 与 Foundational 无 story 标签）

## Path Conventions

本仓库为 Rush monorepo：路径以 `apps/<应用>/`、`packages/<库>/` 为准。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 注册共享库工程，便于两前端共用同一套浏览器侧加密实现。

- [ ] T001 Create Rush library `packages/password-transport` with `package.json` (name `@orangehome/password-transport`), `tsconfig.json`, and `src/index.ts`; append the project to `rush.json`
- [ ] T002 Run `rush update` at repository root `d:\ai_coding\orangehome\main-monorepo` after T001

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 完成浏览器侧 **加密** 包；**无** BFF 解密时前端尚不能 E2E，但本阶段完成后可与 Phase 3 并行 review。

**⚠️ CRITICAL**: Phase 3（US3）可与 Phase 2 并行由不同开发者进行，但端到端联调须在 Phase 3 完成后。

- [ ] T003 [P] Add `packages/password-transport/src/types.ts` for `LoginCryptoParams` and protected login payload fields per `specs/002-login-password-encryption/data-model.md` and `specs/002-login-password-encryption/contracts/login-password-transport.md`
- [ ] T004 Implement `packages/password-transport/src/encrypt.ts` using Web Crypto (RSA-OAEP + AES-256-GCM) per `specs/002-login-password-encryption/research.md`, and export from `packages/password-transport/src/index.ts`
- [ ] T005 Add `build` (and `types` if needed) scripts to `packages/password-transport/package.json` and verify `rush build --to @orangehome/password-transport` succeeds

**Checkpoint**: 共享加密库可构建；可进入 BFF 实现。

---

## Phase 3: User Story 3 - 服务端在校验前恢复凭证并拒绝异常负载 (Priority: P1)

**Goal**: `server_bside` 提供公钥参数接口、解密受保护登录负载、失败时拒绝认证且不泄露敏感细节；解密成功后沿用现有 core 代理登录。

**Independent Test**: 对 `POST /auth/login` 发送合法密文负载可透传 core 成功路径；损坏/伪造负载返回失败且响应体不含密钥与明文密码。

- [ ] T006 [US3] Update `apps/server_bside/.env.example` with `LOGIN_RSA_PRIVATE_KEY_PEM`, `LOGIN_RSA_KEY_ID`, `ALLOW_PLAIN_PASSWORD_LOGIN` documented per `specs/002-login-password-encryption/quickstart.md`
- [ ] T007 [P] [US3] Extend `apps/server_bside/src/auth/dto/auth.dto.ts` with response DTO for `GET /auth/login-crypto-params` and validated body DTO for protected `POST /auth/login` per `specs/002-login-password-encryption/contracts/login-password-transport.md`
- [ ] T008 [US3] Create `apps/server_bside/src/auth/password-transport-crypto.service.ts` to load RSA private key from config, expose public key material for clients, and decrypt protected payload to plaintext password using Node.js `crypto`
- [ ] T009 [US3] Register `PasswordTransportCryptoService` in `apps/server_bside/src/auth/auth.module.ts` with `ConfigService` for env-based flags
- [ ] T010 [US3] Add `GET /auth/login-crypto-params` handler in `apps/server_bside/src/auth/auth.controller.ts` with Swagger `@ApiOperation` / `@ApiResponse` per contract
- [ ] T011 [US3] Update `login` in `apps/server_bside/src/auth/auth.service.ts` to branch on request shape: protected payload → decrypt → existing `proxyRequest('POST', '/api/auth/login', { email, password })`; plain `{ email, password }` only when `ALLOW_PLAIN_PASSWORD_LOGIN` is enabled
- [ ] T012 [US3] Add `apps/server_bside/src/auth/password-transport-crypto.service.spec.ts` Jest tests for successful decrypt and failure on tampered or invalid ciphertext
- [ ] T013 [US3] Ensure startup or first-use validation fails clearly when production mode expects RSA key but `LOGIN_RSA_PRIVATE_KEY_PEM` / `LOGIN_RSA_KEY_ID` is missing (avoid silent insecure fallback)

**Checkpoint**: BFF 可独立用 curl/自动化测通；可与 Phase 4 联调。

---

## Phase 4: User Story 1 - 平台端登录且密码不以明文随请求发送 (Priority: P1) 🎯 MVP

**Goal**: `web_platform` 登录请求中不再出现可读明文密码负载；会话与 token 行为与现有一致。

**Independent Test**: 平台端有效凭证登录成功；开发者工具 / 抓包可见 `POST /auth/login` 体为密文字段而非用户输入的明文密码。

- [ ] T014 [US1] Add `@orangehome/password-transport` workspace dependency to `apps/web_platform/package.json` and run `rush update` at repository root
- [ ] T015 [P] [US1] Update `apps/web_platform/src/api/auth.ts` to `GET` crypto params from BFF base URL, encrypt password with `@orangehome/password-transport`, then `POST /auth/login` with protected JSON body; preserve `LoginResponse` storage and interceptors behavior
- [ ] T016 [US1] Confirm `apps/web_platform/src/pages/Login/index.tsx` continues to call `login({ email, password })` with no UI change; refactor only if `login` signature must change

**Checkpoint**: 平台端 E2E 登录（密文）可用。

---

## Phase 5: User Story 2 - 搭建器端登录且密码不以明文随请求发送 (Priority: P2)

**Goal**: `web_builder` 登录流程与平台一致地使用受保护负载。

**Independent Test**: 搭建器端有效凭证登录成功；请求负载不可直接识读明文密码。

- [ ] T017 [US2] Add `@orangehome/password-transport` workspace dependency to `apps/web_builder/package.json` and run `rush update` at repository root
- [ ] T018 [P] [US2] Update `apps/web_builder/src/data/modules/useUserData.ts` so `login` fetches crypto params and posts protected body via `post` from `apps/web_builder/src/data/api/client.ts` with `skipAuth: true` for login
- [ ] T019 [US2] Adjust `apps/web_builder/vite.app.config.ts` or `apps/web_builder/tsconfig.json` / `package.json` exports only if Vite fails to resolve `@orangehome/password-transport` during `rushx dev` or `rushx build`

**Checkpoint**: 两前端均完成密文登录。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 文档、构建与冒烟一致。

- [ ] T020 [P] Update `apps/server_bside/README.md` with `GET /auth/login-crypto-params`, protected `POST /auth/login`, and required environment variables
- [ ] T021 [P] Align `specs/002-login-password-encryption/quickstart.md` environment variable names with final `apps/server_bside/.env.example` values
- [ ] T022 Run `rush build --to @orangehome/password-transport`, `rush build --to @orangehome/server_bside`, `rush build --to @orangehome/web_platform`, and `rush build --to @orangehome/web_builder` from repository root
- [ ] T023 Smoke-test login flows per `specs/002-login-password-encryption/quickstart.md` (protected path mandatory; plain path only with `ALLOW_PLAIN_PASSWORD_LOGIN=true` locally)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2**: Sequential (Rush 注册后再实现库代码)
- **Phase 2** → **Phase 4/5**: 前端依赖 `@orangehome/password-transport` 构建产物
- **Phase 3 (US3)** → **Phase 4/5**: BFF 必须先实现 `login-crypto-params` 与解密，前端才能 E2E
- **Recommended order**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6  
- **Phase 3 与 Phase 2** 可由不同人并行，但 **Phase 4/5 须在 Phase 3 完成后** 联调

### User Story Dependencies

- **US3**: 无前置用户故事；阻塞 US1/US2 的端到端验证
- **US1**: 依赖 US3（BFF 接口与解密）
- **US2**: 依赖 US3；可与 US1 并行开发（均依赖 Phase 2 包）

### MVP Scope

- **最小可演示增量**: Phase 1 + Phase 2 + Phase 3 + Phase 4（US3 + web_platform 密文登录）
- **全量规格**: 加上 Phase 5（web_builder）

### Parallel Opportunities

- T003, T007, T015, T018, T020, T021 标记 [P]，在依赖就绪后可并行
- US1 与 US2 实现阶段可在 US3 与 Phase 2 完成后由两人并行

---

## Parallel Example: After US3 Complete

```bash
# Developer A: web_platform — tasks T014–T016
# Developer B: web_builder — tasks T017–T019
```

---

## Implementation Strategy

### MVP First (US3 + US1)

1. Complete Phase 1–2（shared encrypt package）
2. Complete Phase 3（US3 BFF）
3. Complete Phase 4（US1 platform）
4. **STOP**: 抓包验证 `POST /auth/login` 无明文密码；再决定是否进入 Builder

### Incremental Delivery

1. Ship MVP（平台密文登录）
2. Add Phase 5（搭建器）
3. Phase 6 文档与全量 build

---

## Notes

- 任务含 **精确文件路径**；若实现时合并 DTO 或服务文件，保持行为与契约一致即可，但 PR 中应说明映射关系。
- `package.json` workspace 协议以 Rush/pnpm 实际配置为准（`workspace:*` 或 Rush 推荐写法）。
- 注册/重置密码的密码加密不在本 `tasks.md` 范围内（见 plan/research）。
