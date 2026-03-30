# Data Model: 011 HTTP 分享与复制兜底

## 概念实体

### 预览分享链接

| 属性 | 说明 |
|------|------|
| 存在性 | 由 `pageId` 与 `VITE_RUNTIME_PREVIEW_URL_TEMPLATE` 是否含 `{pageId}` 决定 |
| 值 | 完整绝对 URL 字符串（`buildRuntimePreviewUrl` 产出） |

无服务端实体；无持久化。

## UI 状态（组件局部即可）

| 状态 | 类型 | 说明 |
|------|------|------|
| `shareFallbackOpen` | `boolean` | 兜底 Modal 是否可见 |
| `shareFallbackUrl` | `string \| null` | 当前 Modal 展示的 URL（与失败时一致） |

可选：若 Modal 已打开时再次点击「分享」，可更新 `shareFallbackUrl` 或保持单次会话单例 — 由实现选定并在 quickstart 注明。

## 结果枚举（逻辑层）

与 [contracts/share-preview-link-flow.md](./contracts/share-preview-link-flow.md) 一致：`no_url` | 交付成功 | 需 Modal 兜底。
