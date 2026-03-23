# Data Model: 001-runtime-page-render

> server_cside 无自有库表；以下为**运行时领域对象**与校验规则，对应 HTTP/gRPC 边界。

## RuntimeRouteParams

| 字段 | 类型 | 规则 |
|------|------|------|
| `type` | enum | `release` \| `preview` \| `dev`（小写） |
| `pageid` | string | Mongo ObjectId 十六进制 24 位；非法 → 400 |

## ResolvedPageVersion

| 字段 | 来源 | 说明 |
|------|------|------|
| `versionId` | core PageVersion | 选用版本的 id |
| `pageSchema` | `page_schema_json` 解析 | `Record<string, unknown>`；解析失败 → 502 |
| `title` | 可选 | 来自 Page `title` 或 schema 根节点约定字段（实现时二选一并文档化） |

## MaterialScriptMap（componentsAmdMap）

| 字段 | 类型 | 规则 |
|------|------|------|
| 键 | string | `materialUid` |
| 值 | string | 绝对 URL，`http`/`https`；空或非法 → 按 spec 默认整页失败 |

## RuntimeTemplateView（EJS locals）

| 字段 | 类型 | 说明 |
|------|------|------|
| `lang` | string | 默认 `zh-CN`；可由查询参数 `lang` 覆盖 |
| `pageTitle` | string | 来自 Page 或默认值 `Page` |
| `siteName` | string | 配置项，默认 `OrangeHome` |
| `pageSchema` | object | 与 `ORANGEHOME_DATA.schema` 一致 |
| `componentsAmdMap` | Record<string, string> | 与 JSON 内一致 |
| `pageScripts` | string | 可选 HTML 片段；默认空 |

## 错误映射（对外）

| 场景 | HTTP | 对外文案原则 |
|------|------|----------------|
| 非法 type / pageid | 400 | 简短、无细节 |
| 页面或版本不存在 | 404 | 统一「未找到」 |
| core 不可用 / 超时 | 502/504 | 不暴露上游主机名 |
| 物料缺失或 URL 空 | 502 | 可记录 requestId 供内部查 |
