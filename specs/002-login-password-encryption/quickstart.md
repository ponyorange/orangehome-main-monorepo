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
2. 确认 `GET http://localhost:<port>/auth/login-crypto-params` 返回 200 与公钥。
3. 配置 `web_platform` / `web_builder` 的 BFF 基地址（如 `VITE_*_API_URL`）指向该实例。
4. 使用有效用户走登录；用 DevTools 网络面板确认 `POST /auth/login` 负载中无用户输入的明文密码（开发环境若开启明文开关则为例外）。

## 测试命令（节选）

- `cd apps/server_bside && npx jest`（实现补充用例后）
- 前端：`cd apps/web_platform`（若后续增加 `test`/`lint` 脚本则按宪章执行）

## 相关路径

- 规格：`specs/002-login-password-encryption/spec.md`
- 计划：本目录 `plan.md`
- 契约：`specs/002-login-password-encryption/contracts/login-password-transport.md`
