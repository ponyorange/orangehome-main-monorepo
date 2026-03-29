# Research: 008-schema-selection-portal

## R1 — 叶节点如何去掉 `SelectableSchemaNode` 的双层 `div` 仍保留命中与测量？

**Decision**: 以 **物料根 DOM 节点** 作为唯一「宿主」：`data-schema-id`、指针事件（click / mousedown 移动 / contextmenu / enter/leave）与 **ResizeObserver 测量** 均挂在该宿主上；**不再** 使用外层 `nodeRef` + 内层 `contentRef` 的固定双 `div` 结构。

**Rationale**:

- 规格要求叶节点 DOM 与真实组件对齐；当前 `SelectableComponents.tsx` 中 `SelectableSchemaNode` 的 `nodeRef` 与 `contentRef` 两层仅服务于包裹与测量，可直接收敛。
- `ResizeObserver` 与 `getBoundingClientRect` 对 **宿主元素** 即可订阅尺寸与位置变化。

**Alternatives considered**:

- **保留一层透明包裹 div**：实现简单，但违背「不再为编辑器增加包裹层」的 P1 目标。
- **全局事件委托 + `elementFromPoint`**：可减少每节点监听，但命中/冒泡/stopPropagation 与当前行为对齐成本高，且与 `SelectableContainer` 嵌套选中逻辑耦合重。

## R2 — `SelectionBox` 与悬停描边放在哪里，才能不依赖「包住组件」？

**Decision**: 将 **选中框（`SelectionBox`）** 与 **悬停轮廓** 迁到 **画布内专用覆盖层**（`position: absolute; inset: 0` 一类，与画布内容同受 transform/scale 祖先约束），通过 **`createPortal` 挂载**；矩形位置用 **宿主 `getBoundingClientRect()` 与覆盖层 `getBoundingClientRect()` 的差值** 换算为覆盖层局部坐标，并继续乘以现有的 `selectionRectVisualToLogical` 与 `SelectionBox` 的 `chromeVisualScale` 约定。

**Rationale**:

- 当前 `SelectionBox` 为 `position: absolute`，依赖父级 `position: relative` 的包裹 `div`；Portal 到与画布同坐标系的层后，可用「视口矩形差分」保持与改造前等价的视觉对齐（规格 SC-002）。
- 覆盖层默认 `pointer-events: none`，仅手柄等子区域 `auto`，与当前「边框不挡点击、手柄可点」行为一致。

**Alternatives considered**:

- **`fixed` 全屏层 + 视口坐标**：需额外补偿画布滚动、缩放与侧栏布局，易与 `CenterCanvas` 的 transform 不同步；优先 **画布局部覆盖层**。
- **保留包裹 div 仅用于定位 SelectionBox**：仍多一层，不满足 FR-001。

## R3 — 远程 `RemoteComponent` 不 `forwardRef` 时如何拿到宿主 DOM？

**Decision**: 分两层：

1. **首选**：在 `RemoteSchemaNode` 渲染 `RemoteComponent` 时 **传入** `data-schema-id`（及必要的 `data-*`）与 **可合并的 DOM 属性**（若物料将多余 props 落到根 DOM）；并在 `contracts/` 中约定物料 **应对根节点 `forwardRef`**，以便编辑器挂载 ref。
2. **兜底**：若首帧后仍无法获得可观测的根元素（无 ref、非 DOM 根），**保留最薄一层无语义宿主**（如单 `span`/`div`）且 **在规格走查中单独计数**，避免编辑功能完全失效。

**Rationale**: 物料由第三方或动态 bundle 提供，无法保证一律 `forwardRef`；与规格 Assumptions「以物料主渲染根为准」一致。

**Alternatives considered**:

- **强制所有物料改造**：成本高，超出本迭代范围。
- **`findDOMNode`**：已废弃 API，不采用。

## R4 — `SelectableContainer` 是否同期 Portal 化选中框？

**Decision**: **建议同期**：容器节点仍保留 **一层** 布局/子树挂载结构（符合 FR-004），但将 **选中框** 与 **悬停** 与叶节点 **同一套覆盖层机制** 渲染，避免容器与叶节点两套定位逻辑分叉。

**Rationale**: 规格 P3 允许容器有结构；Portal 化的是 **装饰**，不是「再包一层组件根」。

---

**Outcome**: 无未决 `NEEDS CLARIFICATION`；实现阶段以 `SelectableSchemaNode`、`SelectionBox` 调用方、`CenterCanvas`（或等价画布壳）(`apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx`) 与可选 **React Context** 提供覆盖层 ref 为主修改面。
