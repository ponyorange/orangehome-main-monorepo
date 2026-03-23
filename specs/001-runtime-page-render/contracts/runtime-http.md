# HTTP Contract: GET 运行时页面 HTML

**Base path**：与全局前缀一致（若 `main.ts` 未设全局前缀，则为根路径）。

## Endpoint

`GET /orangehome/runtime/:type/:pageid`

### Path parameters

| 名称 | 约束 |
|------|------|
| `type` | 字面量 `release`、`preview`、`dev` |
| `pageid` | 24 位十六进制 Mongo ObjectId |

### Query parameters（可选）

| 名称 | 说明 |
|------|------|
| `lang` | 覆盖 HTML `lang`，如 `zh-CN`、`en-US` |

### Success

- **Status**: `200`
- **Content-Type**: `text/html; charset=utf-8`
- **Body**: 完整 HTML 文档，满足 spec FR-008、FR-009（含 `id="ORANGEHOME_DATA"` 的 `application/json` 块、`#app`、去重后的物料 `defer` 脚本）。

### Cache（响应头）

| type | 建议 `Cache-Control` |
|------|----------------------|
| `release` | `public, max-age=60, stale-while-revalidate=300`（可配置） |
| `preview` | `private, no-store` |
| `dev` | `private, no-store` |

### Errors

| 条件 | Status |
|------|--------|
| `type` 非法 | 400 |
| `pageid` 非法 | 400 |
| 页面/版本不存在；release 无已发布版本 | 404 |
| 上游失败、物料缺失、模板错误 | 502 |

错误体为 JSON 或纯文本由项目统一过滤器决定，**不得**含堆栈或敏感字段。
