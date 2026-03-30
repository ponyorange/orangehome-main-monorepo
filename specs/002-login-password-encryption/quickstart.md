# Quickstart: Login Password Transport Protection

## 前置

- 仓库根目录已 `rush update`
- Node 与 Rush 要求见根目录 `README.md` 与 `.specify/memory/constitution.md`

## 环境变量（`apps/server_bside`）

在 `.env.example` 中补充（具体名称以实现为准）：

| 变量 | 说明 |
|------|------|
| `LOGIN_RSA_PRIVATE_KEY_PEM` | RSA 私钥 PEM（或多行 Base64），**勿提交** |
| `LOGIN_RSA_KEY_ID` | 与公钥对应的 keyId，需与 `GET /auth/login-crypto-params` 一致 |
| `ALLOW_PLAIN_PASSWORD_LOGIN` | `true`/`false`；本地可 `true` 便于调试，**生产必须为 false** |

可选：`LOGIN_RSA_PUBLIC_KEY_PEM` 若选择由配置显式提供公钥（否则由私钥推导）。

## 生成测试用 RSA 密钥对（示例）

```bash
openssl genrsa -out login_rsa_private.pem 2048
openssl rsa -in login_rsa_private.pem -pubout -out login_rsa_public.pem
```

将私钥内容配置到运行环境；公钥内容用于校验 `GET /auth/login-crypto-params` 返回值。

## 本地联调顺序

1. 启动 `server_bside`（端口以各环境为准，如 4000）。
2. 确认 `GET http://localhost:<port>/api/auth/login-crypto-params`（全局前缀 `api`）返回 200 与公钥。
3. 配置 `web_platform` 的 `VITE_BFF_API_URL`、`web_builder` 的 `VITE_BFF_API_URL`，指向 `http://localhost:<port>/api`。
4. 可选：前端设置 `VITE_ALLOW_PLAIN_PASSWORD_LOGIN=true` 且 BFF 设置 `ALLOW_PLAIN_PASSWORD_LOGIN=true`，仅在加密失败或无 RSA 配置时走明文登录调试（**公网 HTTP 在实现 `node-forge` 降级后，正常应仍走密文**）。
5. 使用有效用户走登录；用 DevTools 网络面板确认 `POST .../api/auth/login` 负载中无用户输入的明文密码（除非第 4 步显式开启明文）。

## HTTP / 公网 IP（无 `crypto.subtle`）

- 浏览器在 **`http://<公网IP>`** 等非安全上下文下不提供 `window.crypto.subtle`；`@orangehome/password-transport` 会自动 **按需加载 `node-forge`**，与 BFF 解密格式一致，**无需**为「能登录」而开启明文开关。
- 部署前端前须 **重新构建**（含共享包与依赖它的 `web_platform` / `web_builder`），确保产物包含 forge 分包。
- 验证 forge 与 Node 解密一致（可选）：在仓库根或 `packages/password-transport` 下执行  
  `cd packages/password-transport && npm run verify-forge`

## 网关与 Axios

- 若 `GET .../login-crypto-params` 经网关返回 **`{ data: { publicKey, ... } }`**，前端依赖 `normalizeLoginCryptoParams` 解包（见契约 `contracts/login-password-transport.md` §5.3）。
- `web_platform` 对公开登录相关 URL 的匹配须覆盖 **完整 URL / query**，避免带旧 Token 请求公钥（见契约 §5.4）。

## 测试命令（节选）

- `cd apps/server_bside && npx jest`（实现补充用例后）
- `cd packages/password-transport && npm run verify-forge`（forge 加密与 Node 解密 roundtrip）
- 前端：`cd apps/web_platform`（若后续增加 `test`/`lint` 脚本则按宪章执行）

## 相关路径

- 规格：`specs/002-login-password-encryption/spec.md`
- 计划：本目录 `plan.md`
- 契约：`specs/002-login-password-encryption/contracts/login-password-transport.md`
