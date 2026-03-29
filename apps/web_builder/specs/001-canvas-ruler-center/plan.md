# Implementation Plan: 画布与横向标尺视口内水平居中

**Branch**: `001-canvas-ruler-center` | **Date**: 2026-03-27 | **Spec**: `D:/ai_coding/orangehome/main-monorepo/apps/web_builder/specs/001-canvas-ruler-center/spec.md`  
**Input**: Feature specification from `specs/001-canvas-ruler-center/spec.md`

## Summary

在缩小浏览器窗口或中间画布列宽度变化时，保持**画布工作区**与**横向标尺**在中间画布列内水平居中。当前实现（`CenterCanvas.tsx`）用 `canvasLeftOffset = max(CANVAS_MARGIN, (scrollContainerClientWidth - scaledWidth) / 2)` 居中画布，但偏移量仅在 `zoom` 变化与 `window.resize` 时重算；**列宽因侧栏显隐/布局变化而改变时不会触发 `resize` 事件**，导致偏移过时。方案：对画布**滚动容器**使用 `ResizeObserver`（可辅以 `requestAnimationFrame` 合并回调）在列宽变化时重算 `canvasLeftOffset`，并保持与 `RulerX` 的 `scrollX - canvasLeftOffset` 同步。变更限定在 `src/extensions/ui/center-canvas/`，不触碰 Schema、公共包导出或 BFF。

## Technical Context

**Language/Version**: TypeScript 5.x, Node >=18 (Rush 约束)  
**Primary Dependencies**: React 18, Semi Design, Zustand（现有 schema/selection 不变）  
**Storage**: N/A（纯布局）  
**Testing**: Vitest（本特性以手动/可视验收为主；若有布局钩子可补轻量单测，非强制）  
**Target Platform**: 桌面浏览器中的 Orange Editor（Vite 宿主）  
**Project Type**: Rush monorepo 包 `@orangehome/web_builder` 内的编辑器 UI 扩展  
**Performance Goals**: 布局重算在交互帧内完成；避免在 `ResizeObserver` 回调中做重计算（可用 rAF 节流）  
**Constraints**: 不改变 `ISchema` 与文档坐标；不新增硬编码 API 主机  
**Scale/Scope**: 单文件为主（`CenterCanvas.tsx`），可选极小常量/工具抽取

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|--------|
| Extensions | Pass | 修改留在 `extensions/ui/center-canvas`，不绕过 SlotRegistry |
| Schema | Pass | 无文档结构或 schema 变更 |
| DI | Pass | 无新跨切服务 |
| State & data | Pass | 布局偏移保持组件本地 state；不涉及 `data/api` |
| Public API | Pass | 不修改 `src/index.ts` / `package.json` exports |
| Quality | Pass | 合并前执行 `rushx type-check` 与 `rushx lint` |

**Post-Phase-1**: 设计仍满足上表；实现路径为 `ResizeObserver` + 既有偏移公式，无新增违规。

## Project Structure

### Documentation (this feature)

```text
specs/001-canvas-ruler-center/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── layout-canvas-column.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (`apps/web_builder`)

```text
src/extensions/ui/center-canvas/
├── components/
│   └── CenterCanvas.tsx          # 主要改动：ResizeObserver 驱动 calculateOffset
├── hooks/
│   └── useCanvasDrop.ts          # 无要求变更（除非共享 ref 边界）
```

**Structure Decision**: 在现有 Center Canvas 扩展内完成；不新增包或后端。

## Complexity Tracking

本计划无宪法违规，无需复杂度豁免行。

## Phase 0 & Phase 1 Outputs

- **research.md**: 已确定采用 `ResizeObserver` 相对仅 `window.resize` 的取舍（见该文件）。
- **data-model.md**: 布局相关概念实体（非持久化）。
- **contracts/layout-canvas-column.md**: 画布列内居中行为约定。
- **quickstart.md**: 验收步骤与回归注意点。

## Known limitation（US2 / 侧栏宽度）

`src/core/components/EditorView.tsx` 中左、右侧 `aside` 为固定宽度（约 280px / 300px）；`LeftPanel` 内部折叠不会缩小外层 `aside`。因此**仅切换左栏折叠**时，中间 `main` 的 flex 分配宽度可能**不变**，画布列上的 `ResizeObserver` **不会**触发，US2 的「侧栏变化 → 重算居中」在此布局下可能无感知。浏览器窗口宽度变化（US1）与将来若将侧栏改为随内容/折叠收缩宽度，仍可从本实现的 `ResizeObserver` 受益。完整 US2 需后续调整 `EditorView` 或侧栏外包宽度策略。
