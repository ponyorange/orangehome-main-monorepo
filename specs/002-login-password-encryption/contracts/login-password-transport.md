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

---

## 5. 客户端实现约定（`packages/password-transport`）

**与 §2 线上字节格式一致**；差异仅在「用哪套 API 算出密文」。

### 5.1 优先：Web Crypto（`SubtleCrypto`）

在**安全上下文**（HTTPS、`http://localhost` 等）下，使用浏览器原生 **`crypto.subtle`** 实现 RSA-OAEP（SHA-256）+ AES-256-GCM，与 BFF `PasswordTransportCryptoService` 解密参数对齐。

### 5.2 降级：`http://公网IP` 等非安全上下文

浏览器不提供 `crypto.subtle` 时，**不得**要求用户仅能明文登录；共享包内对 `encryptForge` **动态按需加载**（`import()`），使用 **`node-forge`** 实现与 §5.1 **相同算法与载荷拆分**（`ciphertext` / `iv` / `wrappedKey` / `authTag` 独立 Base64），以便与 Node `crypto.privateDecrypt` / `createDecipheriv` 互通。

**说明**：传输层仍为 HTTP 时，无法替代 TLS 的防窃听/防篡改；生产环境仍应部署 HTTPS。降级用于「无证书环境下的密文负载」与联调。

### 5.3 获取加密参数响应的归一化

若 API 网关将 JSON 包在 **`{ "data": { "version", "keyId", "publicKey", ... } }`** 等结构中，客户端 MUST 通过 **`normalizeLoginCryptoParams`**（或等价逻辑）解析出 §1 的扁平字段后再加密，避免 `publicKey` 为空导致失败。

### 5.4 前端 HTTP 客户端（`web_platform`）

对 **`/auth/login-crypto-params`**、**`/auth/login`** 等公开鉴权路径，请求匹配 MUST 兼容 Axios 中 **`config.url` 为完整 URL 或带 query** 的情况，避免误附加 `Authorization` 导致拉公钥失败。
