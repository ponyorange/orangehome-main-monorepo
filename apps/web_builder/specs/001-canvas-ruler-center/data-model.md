# Data Model: 画布与横向标尺水平居中

本特性**不引入持久化实体**或后端模型。以下为**布局语义**实体，便于 spec/plan/实现对照。

## LayoutViewport（画布列视口）

| 概念 | 说明 |
|------|------|
| 宿主 | 中间 `main` 内、Center Canvas 扩展中的**滚动容器**（`overflow: auto` 区域） |
| clientWidth | 用于计算水平居中的可用视口宽度 |
| 变化来源 | 浏览器窗口尺寸、左右侧栏显隐/宽度、缩放导致的内部重排（间接） |

## CanvasFrame（画布 + 横向标尺单元）

| 概念 | 说明 |
|------|------|
| 逻辑宽度 | `CANVAS_WIDTH * zoom`（与现有常量一致） |
| 水平偏移 | `canvasLeftOffset`：滚动内容坐标系内，画布块左边缘位置 |
| 约束 | `canvasLeftOffset >= CANVAS_MARGIN`，且在视口足够宽时满足「画布块在视口内水平居中」 |

## 关系

- **LayoutViewport** 提供 `clientWidth`；**CanvasFrame** 的 `canvasLeftOffset` 由视口宽度与逻辑宽度推导。
- **横向标尺**与画布共享同一水平原点（通过 `scrollX` 与 `canvasLeftOffset` 校正），不单独持久化状态。

## 校验规则（来自 spec）

- 视口或列宽变化并稳定后，`canvasLeftOffset` 必须使画布块在滚动容器可视区域内水平居中（在 `CANVAS_MARGIN` 约束下）。
- 不修改 schema 节点坐标与序列化结果。
