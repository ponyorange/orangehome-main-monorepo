# Contract: 运行时预览 URL 构建

**Consumer**: `Preview.tsx`、`Toolbar.tsx`、任意「复制预览链接」按钮  
**Package**: `apps/web_builder`

## 函数语义（概念）

```
buildRuntimePreviewUrl(pageId: string | null | undefined): string | null
```

- **Input**: 当前编辑器上下文中的页面 id（与 `useEditorPageId()` 一致）。
- **Output**: 可在外部浏览器打开的完整 URL；无法构造时返回 `null`。

## 模板

- 来源：环境变量 `VITE_RUNTIME_PREVIEW_URL_TEMPLATE`（名称以实现为准，写入 `.env.example`）。
- 必须包含字面量占位 `{pageId}`，实现用当前 `pageId` 替换**一次或按规范多次**（单页场景通常一次）。
- 示例：`http://192.168.1.91:50055/orangehome/runtime/preview/{pageId}`

## 错误与边界

- 空 `pageId` ⇒ `null`。
- 未配置模板或模板不含 `{pageId}` ⇒ `null`（调用方 Toast / 禁用按钮）。

## 不变量

- 分享、预览 iframe、预览内「复制链接」**仅**通过此（或唯一包装函数）生成 URL，禁止另一套硬编码分支。
