# Contract: 编辑器画布悬停装饰（009）

## 范围

仅 **Orange Editor 画布编辑区**（`data-canvas-area` 内、可选择 schema 渲染路径）。**不包含**纯预览、导出 HTML、运行时只读页。

## 视觉

- **悬停**：组件宿主外轮廓上显示 **虚线** 边框（颜色/线宽与主题变量一致，且与**选中实线/手柄**可区分）。  
- **选中**：保持现有 `SelectionBox` 行为；若实现选择「已选中则不显示悬停虚线」，须在走查中确认仍满足 spec 对「可区分」的要求。

## 行为

1. 指针在**可编辑节点**宿主上时，悬停装饰与宿主 **getBoundingClientRect** 对齐（含画布缩放/滚动后的视口一致）。  
2. 指针不在任何可编辑节点上（或命中被策略排除的根）时，**不显示**悬停装饰。  
3. 悬停 **不改变** `selectedIds`。  
4. 指针在 **input / textarea / select / contenteditable** 上时，不破坏其获得焦点与输入；悬停装饰为 `pointer-events: none`。

## 与宿主注册的关系

悬停与选中 **共用** `CanvasSchemaHostRegistry` 中同一 host 元素；若某节点未注册宿主，装饰不显示（与选中框一致，属数据/物料问题）。

## 版本

- **009**：补充指针命中驱动 `hoverId`（与 React 冒泡解耦）。  
- 既有 008：Portal + overlay + registry 架构保持不变。
