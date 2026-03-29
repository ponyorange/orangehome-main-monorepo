# Research: 006-canvas-750x1334-rulers

## R1 — 常量放哪里

- **Decision**：在 `apps/web_builder/src` 增加 **`editorCanvasArtboard.ts`**（或放在 `extensions/ui/center-canvas/constants.ts`）导出 `EDITOR_CANVAS_WIDTH = 750`、`EDITOR_CANVAS_HEIGHT = 1334`；`CenterCanvas` 引用；`RulerX`/`RulerY` 继续由 `CenterCanvas` 传入 props，不强制改 Ruler 包内默认值。
- **Rationale**：单一真相，避免标尺与画布各维护一对数字；符合 constitution 与 spec FR-001。
- **Alternatives considered**：仅改 `CenterCanvas` 内两个 const — 最快但易被后续复制粘贴分叉。

## R2 — 标尺刻度间隔

- **Decision**：默认 **`tickInterval = 50`** 保留；750、1334 均与 50 对齐良好（750=15×50，1334 非整除但末尾 `maxValue` 强制刻度已存在）。若 1334 下次要刻度过密，可在实现中改为 **100** 仅用于纵向或全局，以走查为准。
- **Rationale**：减少改动面；`Ruler.tsx` 已在末端绘制 `maxValue` 刻度。
- **Alternatives considered**：统一改为 100 — 横向 750 仅 8 个大格，可能过稀。

## R3 — 历史页面与 schema

- **Decision**：**不**在 schema 根节点强制写入宽高字段；旧 JSON 中组件绝对坐标仍可渲染，可能视觉上「超出」新手机框或留白，由 spec Assumptions 接受；本迭代**不**做自动缩放迁移工具。
- **Rationale**：FR-004 要求基本操作可用；迁移属独立特性。
- **Alternatives considered**：打开旧页时 Toast 提示幅面已变 — 可作为 polish 任务。

## R4 — 预览模式设备框

- **Decision**：**本迭代不修改** `Preview.tsx` 的 `mobile` 375×667，与 spec「预览设备列表是否同步由 plan 单列」一致；在 `plan.md` Phase 2 写明 follow-up。
- **Rationale**：规格允许分阶段；避免预览与编辑强绑一次改两处引发验收范围膨胀。
- **Alternatives considered**：将 `mobile` 改为 750×1334 与编辑区一致 — 产品若要求可在同一 PR 追加。
