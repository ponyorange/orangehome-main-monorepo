# Data Model: Login Password Transport Protection

本文件描述本功能涉及的**逻辑实体**与校验规则（非数据库表设计）。

## 1. LoginCryptoParams（公钥参数）

由 B 端公开接口返回，供浏览器在登录前拉取。

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 协议版本，如 `1` |
| `keyId` | string | 当前 RSA 密钥对标识，用于轮换与排障 |
| `publicKey` | string | RSA 公钥，PEM 或文档约定的 JWK 序列化形式（与实现一致） |
| `algorithm` | string（可选） | 固定为项目约定值，如 `RSA-OAEP-256` + `AES-256-GCM` 的组合标签 |

**校验**: `version`、`keyId`、`publicKey` 必填；未知 `version` 时客户端应拒绝加密并提示升级或联系管理员。

---

## 2. ProtectedLoginPayload（受保护的登录请求体）

浏览器向 `POST /auth/login` 发送的**密文形态**（字段名可在 contracts 中最终锁定）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `email` | string | 与现有一致，邮箱 |
| `version` | string | 与 `LoginCryptoParams.version` 对齐 |
| `keyId` | string | 使用的 RSA key |
| `ciphertext` | string | Base64，AES-GCM 密文 |
| `iv` | string | Base64，GCM nonce/IV |
| `wrappedKey` | string | Base64，RSA-OAEP 封装后的对称密钥（或封装结构按实现文档） |
| `authTag` | string | 若算法将 tag 与密文分开传输则必填；若合并于 ciphertext 则可为空（实现二选一，须统一） |

**不变量**: 任意字段被篡改时，服务端解密或 GCM 校验 MUST 失败，并返回与「密码错误」不可区分或统一的失败表现（与现有安全策略一致）。

---

## 3. PlainLoginPayload（明文形态 · 仅受控环境）

| 字段 | 类型 | 说明 |
|------|------|------|
| `email` | string | 邮箱 |
| `password` | string | 明文密码 |

**约束**: 仅当 `ALLOW_PLAIN_PASSWORD_LOGIN=true` 时允许进入该分支；生产环境关闭。

---

## 4. 服务端内部：解密结果

解密成功后，内存中短时持有 `password` 字符串，仅用于调用既有 `proxyRequest('POST', '/api/auth/login', { email, password })`，不得记录完整明文密码到日志。

---

## 5. 与现有 DTO 的关系

- 现有 `LoginDto`（`email` + `password`）扩展为 **联合形态** 或 **独立 DTO + 管道校验**：同一 `POST /auth/login` 根据 Content 特征或 `Content-Type`/字段判别分支。
- 推荐：**单一入口**，通过自定义校验器判断「密文包完整性」与「是否允许明文」。

---

## 状态与错误

无长期状态机；每次请求独立。失败原因对外映射为统一认证失败语义（与当前 `HttpException` 行为一致）。
