# Implementation Plan: 画布 750×1334 与标尺一致

**Branch**: `006-canvas-750x1334-rulers` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/006-canvas-750x1334-rulers/spec.md`

## Summary

将中心编辑画布由当前 **375×667** 调整为规格要求的 **750×1334**（逻辑像素，与 schema 坐标一致）。**标尺**（`RulerX` / `RulerY` → `Ruler.tsx`）已通过 `canvasWidth` / `canvasHeight` props 与画布联动，需同步传入新尺寸并更新注释/末尾刻度逻辑中的硬编码文案。**顶栏「画布: WxH」**等用户可见文案一并改为 **750×1334**。**预览模式**（`Preview.tsx` 设备框 `mobile` 仍为 375×667）按 spec **FR-005** 本迭代**不强制**与编辑画布统一；若产品要求一致，可作为 follow-up 将「手机」设备框改为 750×1334 或新增一档。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18  
**Primary Dependencies**: 既有 `CenterCanvas`、`Ruler`、`useZoom`、`Grid`、`AlignmentGuides`  
**Storage**: N/A（幅面为编辑器常量，非持久化 schema 字段；历史页面仍按节点坐标渲染）  
**Testing**: 手工走查 + `quickstart.md`；可选 Vitest 纯函数（若抽出常量模块）  
**Target Platform**: 桌面浏览器编辑器  
**Project Type**: Rush 包 `apps/web_builder`  
**Performance Goals**: 画布像素面积增大约 4×，注意滚动与标尺 Canvas 重绘仍保持流畅（现状 ResizeObserver 已存在）  
**Constraints**: Constitution；**单一真相**：画布逻辑宽高建议集中为一处常量或 `src/` 下小模块，避免 `CenterCanvas` 与标尺各写一套魔法数  
**Scale/Scope**: 主要文件 `CenterCanvas.tsx`、`Ruler.tsx`（注释）、可选新建 `canvasConstants.ts`；`Grid` 的 `gridSize` 与 zoom 关系保持即可

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| Extensions + SlotRegistry | ✅ | 改动留在 `extensions/ui/center-canvas`、`extensions/ruler` |
| Schema 真相 | ✅ | 不强制改 schema 形状；仅编辑区幅面常量变化 |
| DI | ✅ | 无新服务 |
| State & data | ✅ | 无新全局 store |
| Public API | ✅ | 不扩展 `package.json` exports（除非抽常量给多包，本计划单包内 import） |
| Quality | ✅ | `rushx type-check` / `rushx lint` |

**Post-Phase-1**: 无新增违背。

## Project Structure

### Documentation (this feature)

```text
specs/006-canvas-750x1334-rulers/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── editor-canvas-artboard.md
└── tasks.md                    # /speckit.tasks
```

### Source Code（拟修改）

```text
apps/web_builder/
├── src/
│   ├── extensions/
│   │   ├── ui/center-canvas/components/
│   │   │   └── CenterCanvas.tsx          # CANVAS_WIDTH/HEIGHT → 750/1334；文案；scaled*；Ruler 传参
│   │   └── ruler/components/
│   │       └── Ruler.tsx                 # 注释「375/667」→ 泛化；逻辑已用 props，一般仅需注释与可选 tickInterval
│   └── （可选）extensions/ui/center-canvas/constants.ts 或 src/constants/editorCanvas.ts
```

**Structure Decision**: 优先在 `CenterCanvas` 同目录或 `src/` 下增加 **命名常量模块**（如 `EDITOR_CANVAS_WIDTH = 750`），由 `CenterCanvas` 与（若需）标尺封装组件共同引用，满足 spec「单一基准」。

## Phase 0: Research

**Output**: [research.md](./research.md)（本命令生成）

## Phase 1: Design & Contracts

**Outputs**:

- [data-model.md](./data-model.md)
- [contracts/editor-canvas-artboard.md](./contracts/editor-canvas-artboard.md)
- [quickstart.md](./quickstart.md)

**Agent context**: 运行 `update-agent-context.sh cursor-agent`（`SPECIFY_FEATURE=006-canvas-750x1334-rulers`）。

## Phase 2（实现概要，由 /speckit.tasks 细化）

1. 将 `CANVAS_WIDTH`/`CANVAS_HEIGHT` 改为 **750**/**1334**（或从共享常量导入）；更新 `scaledWidth`/`scaledHeight`、`minHeight` 计算、`Grid`/`AlignmentGuides` 传入尺寸。  
2. 确认 `RulerX`/`RulerY` 收到新 `canvasWidth`/`canvasHeight`；视需要调整默认 `tickInterval`（如保持 50：750、1334 均可整除或接近）。  
3. 更新 `Ruler.tsx` 内注释「375 或 667」为与 `maxValue` 一致的描述。  
4. 全仓检索用户可见 **375×667** / **375x667**（顶栏、文档字符串），按 **FR-003** 改为 **750×1334** 或注明例外。  
5. **Preview**：本迭代默认**不改**；若合并前产品要求统一，再改 `Preview.tsx` 的 `DEVICE_SIZES.mobile`。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
