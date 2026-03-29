# Data Model: 006-canvas-750x1334-rulers

本特性**不引入**新的持久化实体或 API 载荷字段；以下为编辑器内**概念与常量**。

## 概念

### EditorCanvasArtboard（编辑画布幅面）

- **逻辑宽度**：750（与 schema 中 `x`/`width` 等单位一致）
- **逻辑高度**：1334
- **与缩放关系**：`useZoom` 的 `zoom` 仅缩放**屏幕呈现**；逻辑幅面数值不变。

### RulerDomain（标尺域）

- **水平标尺**：数值范围 **0 … 750**，与画布逻辑宽度对应。
- **垂直标尺**：数值范围 **0 … 1334**，与画布逻辑高度对应。
- **滚动偏移**：沿用现有 `scrollX`/`scrollY` 与 `canvasLeftOffset`、`VERTICAL_OFFSET` 管线，仅底层 `canvasWidth`/`canvasHeight` 变大后需回归滚动居中逻辑。

## 与 ISchema 的关系

- 页面节点仍存储于 `ISchema` 树；**无**必选的新增 schema 属性。
- 旧数据中坐标可能超出 0–750 / 0–1334：渲染行为保持「按坐标绘制」，兼容策略见 spec Assumptions。

## 状态

- 无新 Zustand slice；画布尺寸为**编译期/模块常量** + 现有 `zoom` store。
