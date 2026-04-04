# Research: 012 Schema JSON 编辑器剪贴板快捷键

## R1 — Monaco 与全局 document 快捷键冲突处理

**Decision**：采用“双保险”：

1. **编辑器内优先**：在 `MonacoSchemaEditor` 创建 editor 后注册复制/粘贴/剪切命令，并在编辑器侧处理并阻止事件外溢。
2. **全局兜底**：在 `KeyboardShortcuts.tsx` 的 document keydown 监听里，检测事件来源若属于 Monaco 编辑器 DOM（或处于 Monaco 文本输入焦点）则直接 return，不再执行画布组件复制/粘贴逻辑。

**Rationale**：仅靠“全局判断 target 标签”不稳定（Monaco DOM 多为 div/span）；仅靠“Monaco 内 addCommand”也可能因未来全局监听更早捕获或 DOM 结构变化而回归。

**Alternatives considered**：移除全局 document 监听，改成画布容器监听（作用域更小）— 风险较高且超出本期。

---

## R2 — 跨应用剪贴板读写能力

**Decision**：优先依赖浏览器原生文本复制/粘贴行为（当 Monaco 处理快捷键时让其走默认剪贴板路径）；若需要显式读写剪贴板，优先 `navigator.clipboard`，失败时可降级 `document.execCommand`（仅在产品允许时）。

**Rationale**：规格关注“用户能复制/粘贴”，不强制实现自定义剪贴板读写；尽量少触碰权限与安全上下文差异。

---

## R3 — 粘贴非法 JSON 的安全性

**Decision**：继续复用 `PropertiesPanel.handleSchemaChange` 的链路：`JSON.parse` + `validate`，失败仅提示错误且不更新画布（保持上一次有效 schema）。

**Rationale**：符合 FR-003/SC-002；避免破坏画布状态。

