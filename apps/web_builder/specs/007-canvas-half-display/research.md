# Research: 007 编辑区半屏展示（逻辑 750 不变）

## R1 — 如何把「视觉半屏」与「逻辑 750×1334」同时满足？

**Decision**：在中心画布内采用 **逻辑像素层 + 固定视口展示比例** 的两层结构：内层保持与当前一致的 **逻辑布局尺寸** `W = EDITOR_CANVAS_WIDTH * zoom`、`H = EDITOR_CANVAS_HEIGHT * zoom`（schema、子组件、网格仍以该尺寸排版）；对该内层施加 **`transform: scale(s)`**（`transformOrigin: top left`），外层用 **绝对定位 + 明确宽高** 包住，使 **滚动与占位** 使用 **视觉尺寸** `W*s`、`H*s`（默认 `s = 0.5`）。

**Rationale**：若仅把外层 `width/height` 设为 `750*zoom*0.5` 而不保持内层逻辑宽度为 `750*zoom`，子树会按 **375 宽** 参与 flex/百分比布局，**违背 FR-001**（逻辑幅面仍为 750）。内层保真 + 整体缩放可保持 schema 坐标语义不变。

**Alternatives considered**：

- **全局把 `zoom` 存成 0.5 且 UI 显示「100%」**：需在多处伪造显示值，易与 `useZoom`、快捷键、持久化冲突，**否决**。
- **仅 CSS `zoom: 0.5`（非标准 / 语义混杂）**：跨浏览器与嵌套滚动行为不一致，**否决**。
- **把展示比例做成用户可调滑块**：规格当前仅要求默认半屏，**留作后续**；实现时可用常量收口，便于日后升为 store 配置。

---

## R2 — 缩放读数保持「100%」时，标尺与画布视觉宽度如何一致？

**Decision**：`useZoom` 中的 **`zoom` 不变**；`formatZoomPercent(zoom)` **不引入展示比例**。标尺绘制用的 **像素比例** 使用 **有效绘制系数** `zoom_eff = zoom * EDITOR_VIEWPORT_SCALE`（常量名以代码为准），传入 `RulerX`/`RulerY` 的 `zoom` 参数，**逻辑上界**仍为 `EDITOR_CANVAS_WIDTH` / `EDITOR_CANVAS_HEIGHT`，刻度数字仍为 0…750 / 0…1334，满足 **FR-005**。

**Rationale**：标尺组件已按「逻辑 max × zoom → 像素长度」工作；将展示比例乘入 `zoom` 等价于「同一套逻辑刻度，更短的物理长度」。

**Alternatives considered**：为 Ruler 增加单独 `displayScale` prop — 可行但 API 面更大；本阶段优先 **单常量 + 调用处合成 zoom_eff**。

---

## R3 — 拖拽、缩放、对齐线、拖入坐标是否与 `scale` 冲突？

**Decision**：实现阶段 **必须走查** `useMove`、`useResize`、`useCanvasDrop` 及 **对齐线**（`AlignmentService` + `getBoundingClientRect`）在 **存在 `transform: scale`** 时是否仍等价于「逻辑像素位移」。若出现 **指针移动与 schema 位移比例不对**，在 **同一套「有效系数 = zoom × EDITOR_VIEWPORT_SCALE」** 下统一修正（例如在 hook 内对 `client` 增量除以该系数，或改为相对 **未变换坐标系** 的测量）。

**Rationale**：当前 `useMove`/`useResize` 以 **视口 `clientX/Y` 差值** 直接加减 schema 数值；在 **纯布局放大**（无 transform）时，理论上应除以 `zoom`，代码中未见统一处理 — 以 **不扩大本特性范围** 为原则：**默认 zoom=1 路径必须先正确**；若 zoom≠1 已存在问题，可单独记债或一并修。

**Alternatives considered**：在画布上捕获事件并做坐标变换层 — 侵入面大，**仅作为兜底方案**。

---

## R4 — 与 006 合同 `editor-canvas-artboard.md` 的关系？

**Decision**：**逻辑幅面合同不变**（750×1334、属性/schema 语义）。006 中「`scaledWidth` = `EDITOR * zoom`」针对 **当时无展示比例** 的表述；007 通过新合同 **`editor-viewport-display-scale.md`** 定义 **布局占位/视觉宽度** = `EDITOR * zoom * EDITOR_VIEWPORT_SCALE`，并声明 **用户可见「画布逻辑尺寸」文案仍为 750×1334**。

**Rationale**：避免修改已合并的 006 合同语义模糊；007 合同显式 **扩展** 布局规则。

---

## R5 — `Preview.tsx` 与独立预览？

**Decision**：**默认不改** `Preview.tsx` 设备框尺寸；与本特性解耦，与 spec Assumptions 一致。

**Rationale**：规格边界为 **中心编辑区**；预览策略由既有 plan/产品另定。
