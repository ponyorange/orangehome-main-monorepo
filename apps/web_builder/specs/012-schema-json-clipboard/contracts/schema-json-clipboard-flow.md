# Contract: Schema JSON 编辑器剪贴板快捷键路由

## 参与者

- **Schema JSON 编辑器**：`MonacoSchemaEditor`（「编辑 Schema」弹窗内）
- **全局画布快捷键**：`KeyboardShortcuts`（document keydown 监听）
- **系统剪贴板**：浏览器/操作系统提供的文本剪贴板

## 目标

当 **Schema JSON 编辑器拥有焦点** 时：

- Ctrl/⌘+C / Ctrl/⌘+V / Ctrl/⌘+X MUST 按**文本编辑语义**执行（复制/粘贴/剪切文本）
- MUST NOT 触发画布层的组件复制/粘贴/剪切行为

当 **Schema JSON 编辑器不拥有焦点** 时：

- 画布快捷键行为保持现状（不在本功能范围内改动）

## 路由规则（简化）

```
onKeyDown(e):
  if e 来源于 Monaco 编辑器 DOM / Monaco 聚焦:
    交由编辑器处理（或显式处理后阻止冒泡）
    return
  else:
    交由画布 KeyboardShortcuts 处理（现有逻辑）
```

## 粘贴后的校验契约

- 粘贴会改变 JSON 文本后，若文本能解析且结构校验通过 → 允许同步更新画布。
- 若解析失败或结构无效 → MUST 提示错误且 MUST 不更新画布（保持上一次有效状态）。

## 版本

- **012**：引入编辑器焦点态下剪贴板快捷键不被画布劫持的契约。

