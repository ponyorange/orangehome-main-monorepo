# Implementation Plan: 画布区组件悬停虚线框

**Branch**: `009-canvas-hover-outline` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/009-canvas-hover-outline/spec.md`

## Summary

在编辑器**画布内容区**内，当指针悬停在可编辑 schema 节点上时，显示与组件宿主边界对齐的**虚线轮廓**；视觉上与**选中框**区分，且不改变选中状态。

**现状**：`CanvasInteractionChrome` 已具备基于 `canvasSchemaHostRegistry` + `measureChromeRect` + `createPortal` 的悬停虚线渲染（`pushHover`），并与 `SelectionContext` 的 `hoverId` 联动；与选中框共用同一套测量与覆盖层路径，满足 FR-006。

**缺口**：`hoverId` 目前主要依赖节点上的 React `onMouseEnter` / `onMouseLeave`。与选中问题相同，**未向 DOM 根转发事件的远程物料**不会更新 `hoverId`，导致虚线框不出现。实施重点为在**画布区内**用与选中一致的 **DOM 命中策略**（指针位置 + `id` + `findById`）驱动 `hoverId`，并处理根容器、原生控件、节流与离开清除。

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Vite, Semi UI, Zustand（选择/hover 状态）, 既有 `CanvasInteractionChrome` / `EditorChromeOverlayContext` / `CanvasSchemaHostRegistry`  
**Storage**: N/A（瞬时 UI 状态）  
**Testing**: `npm run type-check` / `rushx type-check`；本功能以手工走查为主（见 spec SC）；可选 Vitest 单测命中解析纯函数（若抽取）  
**Target Platform**: 现代桌面浏览器（Chromium / Firefox / Safari 当前支持范围）  
**Project Type**: `apps/web_builder` 单包 SPA / 库构建  
**Performance Goals**: 指针移动时悬停更新主观「即时」（spec SC-001：约 200ms 内）；`mousemove` 须节流（`requestAnimationFrame` 或同等）避免布局抖动  
**Constraints**: 覆盖层 `pointer-events: none`；不得拦截输入框/textarea/select/contenteditable；不改变 `Preview` / 导出页行为（ARCH-002）  
**Scale/Scope**: 单画布编辑器实例；`hoverId` 仅 0–1 个节点

## Constitution Check

*GATE: Passed. Re-checked after Phase 1 design.*

- **Extensions**：变更落在既有 `src/extensions/select-and-drag/` 与 `CenterCanvas` 协调层，不新增随意挂到 `OrangeEditor` 核心的 DOM；与 008 门户方案一致。  
- **Schema**：不新增 schema 字段；`hoverId` 为编辑会话 UI 状态，不写入 `ISchema`。  
- **DI**：不新增 Inversify 服务；复用 Context + registry。  
- **State**：延续 `useSimpleSelection`（或等价）中的 `hoverId` / `handleMouseEnter` / `handleMouseLeave`，避免第二套 hover store。  
- **Public API**：不修改 `package.json` exports。  
- **Quality**：合并前对 touched 文件 `rushx type-check`、`rushx lint`。

无 Complexity Tracking 条目。

## Project Structure

### Documentation (this feature)

```text
specs/009-canvas-hover-outline/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── editor-hover-chrome.md
└── tasks.md              # /speckit.tasks — 非本命令产出
```

### Source Code (`apps/web_builder`)

```text
apps/web_builder/src/
├── common/components/SchemaRenderer/
│   ├── CanvasSchemaHostRegistry.ts   # 宿主登记（已存在）
│   └── EditorChromeOverlayContext.tsx
├── extensions/select-and-drag/components/
│   └── CanvasInteractionChrome.tsx   # 悬停 Portal 绘制（已存在，或微调 zIndex/样式）
├── extensions/ui/center-canvas/components/
│   └── CenterCanvas.tsx               # 建议：document/canvas 捕获 pointer 命中 → 更新 hover
├── extensions/select-and-drag/hooks/
│   └── useSelection.ts                # hoverId 状态源（已存在）
```

**Structure Decision**：不新建 feature 包；在 **画布协调层（CenterCanvas）** 补充指针命中与 **既有 SelectionContext** 对齐，**Chrome 层**仅按需微调。

## Phase 0 — Research

见 [research.md](./research.md)。结论：采用 **画布内 pointer 命中 + 复用 registry 测量 + 既有 Portal 虚线**；`mousemove` 节流；根节点与原生控件规则与选中分发对齐。

## Phase 1 — Design Artifacts

- [data-model.md](./data-model.md) — 状态与命中规则  
- [contracts/editor-hover-chrome.md](./contracts/editor-hover-chrome.md) — 编辑器 UI 约定  
- [quickstart.md](./quickstart.md) — 验证步骤  

## Phase 2 — 实施要点（供 /speckit.tasks 拆解）

1. **命中解析**（与 `findById` + DOM `id` 策略一致）：从 `event.target` 向上查找第一个 `id` 在当期 schema 树中的节点；排除 `input/textarea/select/[contenteditable]`；限定在 `[data-canvas-area="true"]` 内。  
2. **根容器**：若命中 id 为**页面根** `schema.id`，且产品规则与选中一致（根不可当普通子组件选中），则**不设置** hoverId（或显式 `handleMouseLeave`），避免误导性虚线。  
3. **绑定方式**：在 `CenterCanvas`（或等价单一协调点）对 `document` 或画布容器使用 **`mousemove` 捕获/冒泡**（与现有 `mousedown` 选中分发同文件便于维护），节流后调用 `handleMouseEnter(id)` / `handleMouseLeave()`。  
4. **离开画布**：指针离开画布区域时清除 `hoverId`。  
5. **与选中叠放**：保持 `CanvasInteractionChrome` 现有逻辑「已选中则不画 hover 虚线」或按 spec Assumptions 允许微调（仅一种主视觉清晰即可）。  
6. **回归**：`rushx type-check`、`rushx lint`；手工走查 SC-001～SC-003。

---

**产出清单**：`plan.md`（本文件）、`research.md`、`data-model.md`、`quickstart.md`、`contracts/editor-hover-chrome.md`；**未**生成 `tasks.md`（由 `/speckit.tasks` 负责）。
