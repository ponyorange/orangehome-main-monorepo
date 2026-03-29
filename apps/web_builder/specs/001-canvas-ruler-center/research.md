# Research: 画布与横向标尺水平居中

## R1 — 何时重算画布水平偏移

**Decision**: 在 `CenterCanvas` 内对**画布滚动容器**（当前 `scrollRef` 指向的节点）注册 `ResizeObserver`，在 `contentRect` / 边框盒宽度变化时重算 `canvasLeftOffset`。保留对 `zoom` 的 `useEffect` 依赖，使缩放后仍正确。

**Rationale**:

- `window` 的 `resize` 在浏览器窗口宽度变化时一般会触发，满足 spec P1。
- 中间列宽度还可能因 **flex 子项宽度变化**（例如左侧面板折叠、右侧面板内容变化、将来可调分隔条）而变，此类变化**不一定**触发 `window.resize`。
- `ResizeObserver` 在元素实际布局尺寸变化时回调，覆盖「窗口变窄」与「侧栏导致列宽变」两类场景，直接对齐 FR-002。

**Alternatives considered**:

- **仅 `window.resize`**：实现已部分存在；无法可靠覆盖侧栏单独导致的列宽变化 → 拒绝作为唯一手段。
- **在父级 `EditorView` 传宽度 props**：需向上穿透多层 slot，耦合高 → 不推荐。
- **MutationObserver**：与布局尺寸无强绑定，噪声大 → 不推荐。

## R2 — 与横向标尺的对齐

**Decision**: 维持现有关系：`RulerX` 使用 `scrollX - canvasLeftOffset` 与滚动内容对齐；`canvasLeftOffset` 更新后标尺与画布保持同一逻辑原点，无需改 `Ruler` 组件 API。

**Rationale**: 标尺已按画布逻辑宽度与滚动偏移绘制；居中问题来自偏移未及时随**列宽**更新，而非标尺公式错误。

**Alternatives considered**:

- **将标尺与画布包进同一 `margin: 0 auto` 列**：需重构中间列结构，风险与回归面大；仅在产品明确要求「标尺视觉宽度等于画布宽度」时再做 → 本次不采纳。

## R3 — 性能与抖动

**Decision**: 在 `ResizeObserver` 回调中使用 `requestAnimationFrame` 合并同一帧内多次触发，再读取 `clientWidth` 并 `setCanvasLeftOffset`，避免多余 setState。

**Rationale**: 调整窗口或面板时可能连续触发多次观察回调；rAF 合并为常见模式。

**Alternatives considered**：同步在回调里 `setState` — 可接受但可能多渲染；优先 rAF 合并。
