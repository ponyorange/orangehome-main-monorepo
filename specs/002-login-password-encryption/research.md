# Research: Login Password Transport Protection

## 1. 客户端 → BFF 的密码保护形态

**Decision**: 采用 **混合加密**：随机 AES-256-GCM 对称密钥加密密码明文，再用 **RSA-OAEP**（SHA-256）封装对称密钥与 IV；请求中携带密文、IV、封装后的密钥、算法版本与密钥标识（keyId）。

**Rationale**:

- 仅 RSA 直接加密密码时，受 RSA 模长限制，长密码或 UTF-8 多字节场景易触顶；混合加密是常见且可审计的模式。
- AES-GCM 提供机密性与完整性；与 RSA-OAEP 组合可满足「线路上不可直接识读明文密码」的规格要求。
- Web 端在**安全上下文**下优先使用 **Web Crypto (`SubtleCrypto`)**；在 **HTTP 公网 IP** 等非安全上下文下无 `subtle` 时，使用 **`node-forge`** 纯 JS 实现同一算法族（见下文 §7）。服务端始终使用 Node **`crypto`**，与 Nest 技术栈一致。

**Alternatives considered**:

| 方案 | 放弃原因 |
|------|----------|
| 仅 RSA-OAEP 加密整段密码 | 密码长度与编码导致长度上限难保证 |
| 仅依赖 TLS（HTTPS） | 规格明确要求在 TLS 之外仍不发送可读明文负载 |
| 自定义对称算法或 ECB | 不符合行业默认实践，审计成本高 |

---

## 2. 公钥分发与密钥管理

**Decision**: B 端（`server_bside`）提供 **`GET /auth/login-crypto-params`**（或等价路径），返回 **公钥 PEM**（或 JWK）、**keyId**、**协议版本号** `v`。私钥仅存在于 B 端运行环境，通过环境变量注入（如 PEM 或 Base64），**禁止**提交仓库。

**Rationale**: 与宪章「密钥不得入库」一致；keyId 便于未来多密钥轮换而不强制前端与 core 同时升级。

**Alternatives considered**:

- 公钥硬编码在前端：轮换困难且易分叉，否决。
- 由 core-service 下发公钥：增加跨团队依赖与链路；当前登录代理在 B 端完成解密后再调 core，公钥由 B 端托管更内聚。

---

## 3. 与 core-service HTTP 的衔接

**Decision**: B 端在成功解密后，将 **`{ email, password }` 明文** 以与**当前一致**的方式转发至 `CORE_SERVICE_HTTP_URL/api/auth/login`（现有 `AuthService.proxyRequest` 行为）。core 接口保持不变。

**Rationale**: 规格要求「再继续后续的登录操作」；内网 HTTP 至 core 的路径与信任边界由既有部署与网络策略约束，本功能不改变 core 契约。

**Alternatives considered**:

- 要求 core 接受密文：超出当前规格与改造范围，否决。

---

## 4. 共享代码放置（两前端一致性）

**Decision（推荐）**: 在 monorepo 中新增 Rush 子工程 **`packages/password-transport`**（或 `packages/auth-crypto`），导出：

- 浏览器侧：`encryptPasswordPayload(plainPassword, cryptoParams)`（基于 SubtleCrypto）
- 共享类型：`LoginCryptoParams`、`ProtectedLoginBody` 等

`web_platform` 与 `web_builder` 均依赖该包，避免两套实现漂移。

**备选**: 首版在两端各复制同一模块并标注「须保持字节级一致」，后续再抽取包（若需更快落地且接受短期重复）。

**Rationale**: 符合宪章可维护性与规格「两前端共享同一套保护协议」的假设。

---

## 5. 注册 / 重置密码是否同期改造

**Decision**: **本计划范围以 `/auth/login` 为主**；注册、重置密码仍发送明文密码的字段时，在规格上属于「相关但非 P1」；若需同等保护，应单开迭代扩展同一加密负载到 `register` / `reset-password`，并在本计划中 **Assumptions** 中注明「非本次里程碑」。

**Rationale**: 规格用户故事聚焦登录链路；减少首版范围风险。

---

## 6. 开发环境是否允许明文登录

**Decision**: 可通过 **`ALLOW_PLAIN_PASSWORD_LOGIN`**（默认 `false`；本地可为 `true`）在开发机跳过加密以简化调试；**预发/生产必须为 false**，且集成测试覆盖「仅密文」路径。

**Rationale**: 满足规格「无约定不得回退明文」；开发效率与 CI 门禁可兼顾。

---

---

## 7. 无安全上下文（HTTP 公网 IP）下的客户端实现

**Decision**：在 `packages/password-transport` 中，若 **`globalThis.crypto.subtle` 不可用**，则 **`import()` 动态加载** `encryptForge` 模块，使用 **`node-forge`** 完成 **RSA-OAEP（SHA-256，MGF1-SHA-256）+ AES-256-GCM**，输出字段与既有 Web Crypto 路径一致，供 BFF 现有解密逻辑消费。

**Rationale**

- 浏览器规范在非安全上下文下不暴露 `SubtleCrypto`，无法用原生 API 完成同一协议。
- `node-forge` 在浏览器打包中成熟可用，且与 Node `oaepHash: 'sha256'`、AES-GCM tag 拆分可对齐；已通过 `npm run verify-forge` 与 Node 解密做 roundtrip 校验。

**Alternatives considered**

| 方案 | 放弃原因 |
|------|----------|
| `@peculiar/webcrypto` | 浏览器 bundle 仍依赖 Node 的 `buffer`/`crypto` 等，**Vite 浏览器构建失败** |
| 仅文档要求用户上 HTTPS | 与「公网 IP 无证书」联调场景冲突；作为降级补充而非替代 HTTPS |
| 手写 `@noble/*` + 自拼 RSA-OAEP | 实现与审计成本高，首版不采用 |

**约束**：HTTP 传输仍**不具备 TLS 的机密性与完整性**；本决策仅保证「请求体按约定协议加密」；**生产环境仍应使用 HTTPS**。

---

## 已解决的 NEEDS CLARIFICATION

技术上下文中未再保留 `NEEDS CLARIFICATION`：算法族、密钥位置、与 core 的边界、共享模块策略均已收敛为上述决策；HTTP 下客户端实现已补充为 §7。
