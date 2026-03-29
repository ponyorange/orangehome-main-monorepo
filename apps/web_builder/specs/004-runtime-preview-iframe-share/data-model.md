# Data Model: 004-runtime-preview-iframe-share

## 1. 配置（构建期 / 运行时只读）

| 名称 | 说明 |
|------|------|
| `runtimePreviewUrlTemplate` | 含 `{pageId}` 的 URL 模板；来自 `import.meta.env.VITE_*`，缺省时拼接逻辑应返回 null 或回退策略（见 plan）。 |

## 2. 派生值

| 名称 | 类型（概念） | 规则 |
|------|----------------|------|
| `runtimePreviewUrl` | string \| null | `pageId` 有效且模板配置合法时，将模板中 `{pageId}` 替换为当前页 id 得到完整 HTTPS/HTTP URL。 |
| `shareableUrl` | 与上相同 | **必须**与 iframe `src` 使用同一函数输出，保证 FR-002/FR-003。 |

## 3. 与现有 store 的关系

| Store | 变更 |
|-------|------|
| `previewStore` | 可不变；仍为 `isPreviewMode` / `device` / `openPreview` / `closePreview`。设备尺寸继续包裹 iframe 外层。 |
| `schemaStore` | 预览不再读取 schema 渲染时可仍挂载（其它功能需要）；iframe 路径不依赖 schema 内容。 |

## 4. 校验规则

- **INV-001**: `shareableUrl === iframe.src`（规范化后比较，忽略尾部 `/` 差异若产品统一 trim）。
- **INV-002**: `pageId == null` ⇒ 不调用 `navigator.clipboard.writeText` 写入「伪 URL」。
