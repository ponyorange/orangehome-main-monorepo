# Data Model: 008-schema-selection-portal

本特性 **不引入持久化实体**；以下为 **运行时编辑器概念模型**，用于实现与测试对齐规格。

## 实体

### 1. `SchemaNodeId`

- **说明**：与 `ISchema.id` 一致，用于选中、拖拽、右键菜单、覆盖层上的 `componentId` 展示。
- **不变性**：仍由 schema store 为真源；DOM 仅作镜像（`data-schema-id`）。

### 2. `EditorChromeHost`（叶节点）

- **说明**：画布上某一叶节点在 DOM 中的 **唯一宿主元素**（通常为远程物料根节点），承担：
  - `data-schema-id={id}`
  - 指针事件（与当前 `SelectableSchemaNode` 行为等价）
  - `ResizeObserver` 测量目标
- **关系**：1:1 对应一个叶节点 schema id（在编辑器挂载生命周期内）。

### 3. `EditorOverlayMount`

- **说明**：位于画布内容坐标系内的 **覆盖层根节点**（绝对定位于画布滚动/缩放容器内），作为 `createPortal` 的目标。
- **约束**：与画布共享同一 CSS transform/scale 祖先，以保证装饰几何与内容同步（规格 Edge Cases）。

### 4. `ChromeRect`（派生状态）

- **字段**（逻辑像素，与现有 `selectionRectVisualToLogical` 一致）：
  - `x`, `y`：相对 `EditorOverlayMount` 的左上角偏移
  - `width`, `height`
- **来源**：`EditorChromeHost.getBoundingClientRect()` 与 `EditorOverlayMount.getBoundingClientRect()` 差分，再乘以视觉→逻辑系数。
- **用途**：驱动 `SelectionBox` 的 `x/y/width/height`；悬停虚线框可复用同一套矩形。

### 5. `ContainerChromeHost`（容器节点）

- **说明**：与现有 `SelectableContainer` 一致：**允许** 保留带 `data-schema-id` 的 **单层** 容器元素作为子树挂载点；装饰仍走 `EditorOverlayMount` + Portal。

## 校验规则（行为层）

- 同一 `SchemaNodeId` 在编辑器树中 **至多一个** `EditorChromeHost`（与当前单实例假设一致）。
- `ChromeRect` 在选中或尺寸变化时 **须** 在下一帧布局内更新到可接受误差（满足 SC-002）。

## 状态迁移（简）

- 未选中 → 选中：`ChromeRect` 开始驱动 `SelectionBox`；Portal 子树挂载或更新。
- 选中 → 未选中：移除对应 `SelectionBox`（或隐藏）；释放监听按现有模式。
- 画布 scale 变化：`ResizeObserver` + 宿主 rect 差分使 `ChromeRect` 自动收敛。
