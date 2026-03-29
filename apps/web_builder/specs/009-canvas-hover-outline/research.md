# Research: 009 画布悬停虚线框

## R1 — 悬停状态从哪里来？

**Decision**：继续以 `SelectionContext` / `useSimpleSelection` 的 **`hoverId`** 为唯一权威，不新增 Zustand 字段或并行 store。

**Rationale**：与选中、右侧面板、既有 `CanvasInteractionChrome` 已读取的 API 一致；避免双源 hover 状态。

**Alternatives considered**：新建 `hoverStore` — 拒绝：违反 Constitution「不重复权威状态」。

---

## R2 — 如何命中「指针下的组件」？

**Decision**：与画布 **mousedown 选中分发** 相同思路：在画布区域内，从 `pointer` 事件的 `target` **向上遍历**，找第一个带 **`id`** 且 **`findById(schema, id)`** 命中的元素；跳过原生可编辑控件祖先策略与选中一致。

**Rationale**：远程物料常不转发 `onMouseEnter`；DOM 几何命中与选中一致可满足 FR-006 / SC-002。

**Alternatives considered**：仅依赖 React 合成事件 — 拒绝：已证明对多物料无效。  
**Alternatives considered**：全量 `elementsFromPoint` — 暂缓：复杂度高；当前 id 向上遍历足够且与选中代码可复用。

---

## R3 — 高频 mousemove 性能

**Decision**：使用 **`requestAnimationFrame` 合并**（或单帧节流）：每帧最多更新一次 `hoverId`；若 id 与上一帧相同则跳过 setState。

**Rationale**：满足 SC-001 的「即时」感同时避免一事件一渲染。

**Alternatives considered**：固定 50ms debounce — 拒绝：快速划过时延迟感明显。

---

## R4 — 根容器是否显示悬停框？

**Decision**：当解析到的 id 等于**当前页根** `schema.id` 时，**不设置** hoverId（视为空白/根区，与 spec Assumptions、选中「根不可选」策略一致）。

**Rationale**：避免「整页虚线」误导为可选中子组件。

**Alternatives considered**：根也显示虚线 — 拒绝：与 spec FR-005 / Assumptions 冲突。

---

## R5 — 预览 / 导出

**Decision**：不在 `Preview` 或运行时 bundle 中注册画布 hover 监听；仅 `CenterCanvas` 编辑路径生效。

**Rationale**：ARCH-002。
