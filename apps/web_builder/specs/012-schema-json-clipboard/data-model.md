# Data Model: 012 Schema JSON 编辑器剪贴板快捷键

本功能不引入新的持久化数据模型；仅涉及 UI 焦点与剪贴板文本交互。

## 概念实体

### Schema JSON 编辑器

| 字段/属性 | 类型 | 说明 |
|----------|------|------|
| `focused` | boolean | 编辑器是否拥有输入焦点（影响快捷键路由） |
| `selection` | string range | 当前选区（复制/剪切/替换粘贴） |
| `value` | string | 当前 JSON 文本（由 Monaco model 与 `PropertiesPanel` 状态共同驱动） |

### 剪贴板文本

| 字段/属性 | 类型 | 说明 |
|----------|------|------|
| `text` | string | 系统剪贴板中的纯文本内容 |

## 状态转移（摘要）

```
Monaco Editor 聚焦
  → 复制/剪切/粘贴快捷键按文本语义处理
  → 全局画布快捷键不应响应

Monaco Editor 失焦
  → 画布快捷键按既有规则处理（组件复制/粘贴等）
```

