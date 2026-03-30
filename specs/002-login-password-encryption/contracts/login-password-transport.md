# Contract: Login Password Transport (BFF `server_bside`)

本文档约定 **浏览器 ↔ `server_bside`** 的 HTTP 契约；**`server_bside` → core-service** 仍为既有 `POST /api/auth/login`，body `{ "email": string, "password": string }`，不在此变更。

## 1. 获取加密参数

**Request**

- `GET /auth/login-crypto-params`
- Headers: 无强制鉴权（公开参数）

**Response** `200` `application/json`

```json
{
  "version": "1",
  "keyId": "string",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "algorithm": "RSA-OAEP-256+AES-256-GCM"
}
```

**Errors**

- `503` / `500`：密钥未配置或加载失败时，客户端应提示「登录服务暂不可用」，不得回退为明文（除非本地开发显式开启，见 quickstart）。

---

## 2. 登录（受保护密码）

**Request**

- `POST /auth/login`
- `Content-Type: application/json`

```json
{
  "email": "user@example.com",
  "version": "1",
  "keyId": "string",
  "ciphertext": "<base64>",
  "iv": "<base64>",
  "wrappedKey": "<base64>",
  "authTag": "<base64>"
}
```

说明：`authTag` 是否独立字段由实现选定：若 GCM tag 已附加在 `ciphertext` 内，可省略 `authTag` 并在实现文档中固定一种格式。

**Response**

与现有登录成功/失败一致（例如 200 返回 `accessToken`、`refreshToken`、`expiresIn`、`user`；4xx 认证失败）。

**Errors**

- 解密失败、校验失败、版本不支持：返回 **401** 或 **400**（与当前 `AuthService` 对 core 错误透传策略一致），**响应体不得**包含私钥、堆栈或明文密码。

---

## 3. 登录（明文 · 仅开发）

当且仅当服务端配置 `ALLOW_PLAIN_PASSWORD_LOGIN=true`：

**Request**

```json
{
  "email": "user@example.com",
  "password": "plain-text"
}
```

生产环境 MUST 禁用此路径。

---

## 4. 版本协商

- 客户端 MUST 在加密前检查 `version`；若本地不支持，应阻止登录并提示升级前端。
- 服务端 MUST 拒绝未知 `version` 的密文包。
