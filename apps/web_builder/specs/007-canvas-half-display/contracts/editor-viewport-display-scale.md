# Contract: 中心编辑区视口展示比例（007）

**Consumer**：`CenterCanvas`、标尺、网格、对齐辅助、拖放/拖拽相关逻辑  
**Package**：`apps/web_builder`  
**extends**：`specs/006-canvas-750x1334-rulers/contracts/editor-canvas-artboard.md`（逻辑幅面仍适用）

## 常量

| 名称 | 默认值 | 说明 |
|------|--------|------|
| `EDITOR_VIEWPORT_SCALE` | `0.5` | 中心编辑区 **视觉/占位** 相对「改造前纯 zoom 布局」的 **线性** 比例；实现文件与导出方式以 `plan.md` / 代码为准 |

## 行为契约

1. **逻辑幅面**：`EDITOR_CANVAS_WIDTH` / `EDITOR_CANVAS_HEIGHT` 及 schema 语义 **不得** 因本合同改为 375×667 或其它值。
2. **用户缩放标签**：`useZoom` 的 `zoom` 与 `formatZoomPercent(zoom)` **不得** 仅因 `EDITOR_VIEWPORT_SCALE` 而显示为 50%（默认档仍为 **100%** 语义，见 spec FR-003）。
3. **中心画布占位**（滚动区域、居中计算、白底区域外轮廓的 **屏幕上线性尺寸**）：MUST 使用  
   `EDITOR_CANVAS_WIDTH * zoom * EDITOR_VIEWPORT_SCALE` × `EDITOR_CANVAS_HEIGHT * zoom * EDITOR_VIEWPORT_SCALE`（亚像素误差可接受）。
4. **内层排版**：承载 `SelectableSchemaRenderer` 的容器 MUST 仍以 **逻辑 CSS 尺寸** `EDITOR_CANVAS_WIDTH * zoom` × `EDITOR_CANVAS_HEIGHT * zoom` 排版，再通过 **整体缩放**（如 `transform: scale(EDITOR_VIEWPORT_SCALE)` + 合适定位）映射到占位尺寸，避免子树按 375 宽重排。
5. **标尺**：`canvasWidth` / `canvasHeight` 仍传逻辑上界 **750 / 1334**；用于 **像素换算** 的 zoom 参数 MUST 与占位宽度一致（等价于 `zoom * EDITOR_VIEWPORT_SCALE` 的合成，或单独 prop，二选一但行为等价）。
6. **用户可见「画布像素」文案**（若存在）：仍 MUST 展示 **750×1334**（或与 `editor-canvas-artboard` 常量同步），除非明确标注为预览/非编辑画布。

## 非目标

- 不改变 `Preview.tsx` 默认设备框策略（除非单独规格）。
- 不规定运行时发布页视口。
