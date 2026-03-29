# Data Model: 顶栏用户展示（视图层）

非持久化实体，描述 UI 使用的字段与回退。

## UserProfileView

| 字段 | 来源 | 规则 |
|------|------|------|
| `avatarUrl` | `UserInfo.avatar` | 可选；空串视为无 |
| `displayName` | `UserInfo.nickname` → `UserInfo.email` 本地展示用截断 | 不得渲染为完全空白 |
| `hasImage` | 派生 | `Boolean(avatarUrl)` 且加载成功 |

## 校验 / 回退

- 无 `avatarUrl`：`Avatar` 使用渐变 + 首字或图标。  
- 图片 `onError`：等同无图处理。  
- `displayName` 过长：CSS `text-overflow: ellipsis` + `max-width`。

## 与后端关系

只读 `GET /auth/me`（经 `useUserData`）；本特性不新增实体表或 DTO。
