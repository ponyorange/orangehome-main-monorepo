# Implementation Plan: 编辑区画布半屏展示（逻辑仍 750）

**Branch**: `007-canvas-half-display` | **Date**: 2026-03-29 | **Spec**: `D:\ai_coding\orangehome\main-monorepo\apps\web_builder\specs\007-canvas-half-display\spec.md`  
**Input**: Feature specification from `/specs/007-canvas-half-display/spec.md`

## Summary

在 **不改变逻辑幅面 750×1334** 与 **schema/属性语义** 的前提下，将 **中心编辑区** 在屏幕上的 **线性占地约减半**（接近以往 375 宽的观感），且 **缩放控件仍表示设计空间 zoom**（默认仍显示 100%，不因半屏单独变成 50%）。技术路线：**常量 `EDITOR_VIEWPORT_SCALE`（默认 0.5）** + **内层保持 `EDITOR×zoom` 逻辑排版** + **`transform: scale` 映射到视觉占位**；标尺使用 **逻辑上界 + 合成后的像素 zoom**；拖拽/对齐等按 `research.md` R3 做走查与必要修正。详见 `research.md`、`contracts/editor-viewport-display-scale.md`。

## Technical Context

**Language/Version**: TypeScript 5.x（Rush 包 `apps/web_builder`）  
**Primary Dependencies**: React 18、Semi Design、Zustand、Vite、既有 `CenterCanvas` / `useZoom` / 标尺与选区拖拽扩展  
**Storage**: N/A（无新持久化）  
**Testing**: 手工走查 `quickstart.md`；合并前 `rushx type-check`、可执行时 `rushx lint`  
**Target Platform**: 桌面浏览器（Chromium 系优先）  
**Project Type**: Rush monorepo 内的编辑器 SPA / 库包 `@orangehome/web_builder`  
**Performance Goals**: 画布区重绘与滚动保持现有水平；避免全页额外 layout thrash  
**Constraints**: 遵守 constitution（扩展优先、schema 为真源）；不硬编码生产 API  
**Scale/Scope**: 单包内 `CenterCanvas` 链路与相关交互；**默认不修改** `Preview.tsx`

## Constitution Check

*GATE: Phase 0 前通过；Phase 1 设计后复核。*

| 项 | 状态 |
|----|------|
| 扩展优先：改动落在 `src/extensions/ui/center-canvas` 等与画布相关的扩展模块，不往 `OrangeEditor` 核心里硬挂 DOM | ✅ |
| Schema 为真源：不通过本特性改写 `ISchema` 坐标系或幅面字段 | ✅ |
| DI：无新全局单例；展示比例为常量或后续显式 store | ✅ |
| 状态：`useZoom` 保持现有 store/hook 路径 | ✅ |
| 公共 API：若导出常量，需在 `package.json` exports / `src/index.ts` 评估破坏性（默认仅内部 `constants` 引用即可） | ⚠️ 实现时确认 |
| 质量：`rushx type-check` + 可用时 `rushx lint` | ✅ |

**Phase 1 后复核**：无新增违规；公共 API 若仅内部使用则 ✅。

## Project Structure

### Documentation（本特性）

```text
D:\ai_coding\orangehome\main-monorepo\apps\web_builder\specs\007-canvas-half-display\
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── editor-viewport-display-scale.md
└── tasks.md                    # 由 /speckit.tasks 生成，非本命令产出
```

### 源码（预期触及）

```text
D:\ai_coding\orangehome\main-monorepo\apps\web_builder\src\
├── constants\
│   └── editorCanvasArtboard.ts          # 增加 EDITOR_VIEWPORT_SCALE（或并列常量文件）
├── extensions\ui\center-canvas\
│   ├── components\CenterCanvas.tsx      # 布局、scale、滚动尺寸、标尺 zoom_eff
│   └── hooks\useCanvasDrop.ts           # 若需坐标修正（R3）
└── extensions\select-and-drag\hooks\
    ├── useMove.ts                       # 若需坐标修正（R3）
    └── useResize.ts                     # 若需坐标修正（R3）
```

**Structure Decision**：以 `apps/web_builder` 为包根；不引入新应用目录。

## Complexity Tracking

> 无 constitution 违规需豁免。

## Phase 0: Outline & Research

**Output**: `research.md`（已完成）

- R1：内层逻辑尺寸 + `transform: scale` + 外层明确占位  
- R2：标尺 `zoom_eff = zoom * EDITOR_VIEWPORT_SCALE`  
- R3：指针/对齐线与 transform 的走查与修正策略  
- R4：与 006 合同扩展方式  
- R5：Preview 默认不改  

**NEEDS CLARIFICATION**：无（均在 research 中收敛）。

## Phase 1: Design & Contracts

**Output**（已完成）：

| 产物 | 路径 |
|------|------|
| 概念/关系 | `data-model.md` |
| 行为合同 | `contracts/editor-viewport-display-scale.md` |
| 验证步骤 | `quickstart.md` |

**Agent context**：运行 `update-agent-context.sh cursor-agent`（自 `apps/web_builder`）。

## Phase 2

由 **`/speckit.tasks`** 生成 `tasks.md` 与实现排期；**本命令不在 Phase 2 拆任务**。

---

## Implementation Notes（供 tasks 引用）

1. **常量**：在 `editorCanvasArtboard.ts`（或专文件）导出 `EDITOR_VIEWPORT_SCALE = 0.5`，注释链到 `contracts/editor-viewport-display-scale.md`。  
2. **CenterCanvas**：区分 `layoutLogicalW/H` 与 `layoutVisualW/H`；滚动 `minWidth`、居中 `scrollLeft` 计算使用 **视觉** 尺寸。  
3. **RulerX/Y**：逻辑 `canvasWidth`/`canvasHeight` 不变；传入的 zoom 使用 **与视觉宽度一致** 的合成值。  
4. **Grid / AlignmentGuides**：与 **逻辑层** 尺寸一致（随内层容器）；若对齐线测量受 `getBoundingClientRect` + transform 影响，按 R3 调整 `canvasContainer` 或 `AlignmentService`。  
5. **useCanvasDrop**：`_zoom` 今日未参与坐标换算；若拖入落点偏差，按 `zoom * EDITOR_VIEWPORT_SCALE` 修正。  

## Stop

规划命令止于 Phase 2 说明；**下一步**：执行 **`/speckit.tasks`** 生成 `tasks.md`。
