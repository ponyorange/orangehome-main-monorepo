# Implementation Plan: 画布叶节点直出 DOM，选中装饰 Portal 化

**Branch**: `008-schema-selection-portal` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-schema-selection-portal/spec.md`

## Summary

去掉 `SelectableSchemaNode` 为叶节点引入的 **双层包裹 `div`**，使 **远程物料的根 DOM** 直接作为画布上的可见结构；**选中框、缩放手柄与悬停轮廓** 改为挂载到画布内 **专用覆盖层**（`createPortal`），通过 **宿主与覆盖层的 `getBoundingClientRect` 差分** 计算位置，从而在 **不增加组件外结构层** 的前提下保持现有编辑体验。容器节点（`SelectableContainer`）保留 **单层** 子树挂载结构，装饰与叶节点 **共用** 同一套覆盖层机制。详见 [research.md](./research.md)。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18（Rush monorepo 包 `@orangehome/web_builder`）  
**Primary Dependencies**: React DOM（`createPortal`）、Semi Design、Zustand、Inversify、Vite  
**Storage**: N/A（编辑器运行时 DOM / schema store）  
**Testing**: 现有包内测试命令（若有）；本特性以 **手工 DOM/交互走查** 为主（规格 SC-001–SC-004），按需补组件级单测  
**Target Platform**: 现代浏览器（Chromium / Firefox / Safari 最新两个大版本）  
**Project Type**: Web SPA（低代码编辑器画布）  
**Performance Goals**: `ResizeObserver` 与 Portal 更新在常规页面规模下保持可交互（60fps 目标为尽力，无硬性数值合同）  
**Constraints**: 须与 `CenterCanvas` 的画布 **transform scale** 及现有 `selectionRectVisualToLogical` / `chromeVisualScale` 语义一致  
**Scale/Scope**: 叶节点优先；容器同期统一装饰路径；远程物料可能需 `forwardRef` 兜底策略

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Per `.specify/memory/constitution.md` (Orange Editor / `@orangehome/web_builder`):

| 原则 | 本计划符合性 |
|------|----------------|
| **Extensions / Slot** | 覆盖层挂载在 **画布壳**（`CenterCanvas` 或等价）内，作为 **编排用 DOM**，非随意全局挂载；若后续存在画布 overlay slot，可再抽取为扩展贡献点（本迭代允许直接落在 `center-canvas`）。 |
| **Schema 真源** | 仅变更 **渲染与命中层**；schema 读写路径不变。 |
| **DI** | 不新增未注册全局单例；若需共享「覆盖层 ref」，优先 **React Context** 局部提供。 |
| **State / data** | 选中态仍在既有 store / 上下文；不把 `ChromeRect` 升格为全局持久状态，除非测量抖动需要且单一职责可文档化。 |
| **Public API** | 不破坏 `package.json` exports；若增强 `RemoteSchemaNode` props，保持向后兼容或仅限内部调用路径。 |
| **Quality** | 合并前对触及文件执行 `rushx type-check`、`rushx lint`；有回归测试则 `rushx test`。 |

**Post–Phase 1 re-check**: 设计仍满足上表；无 Complexity Tracking 项。

## Project Structure

### Documentation (this feature)

```text
specs/008-schema-selection-portal/
├── plan.md              # 本文件
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── README.md
│   └── material-root-host.md
└── tasks.md             # /speckit.tasks（本命令不生成）
```

### Source Code (`apps/web_builder`)

```text
apps/web_builder/src/
├── common/components/SchemaRenderer/
│   ├── SelectableComponents.tsx      # SelectableSchemaNode / SelectableContainer：去壳、事件与测量迁宿主
│   ├── SelectableSchemaRenderer.tsx  # 若需消费 Overlay Context
│   └── BaseComponents.tsx            # RemoteSchemaNode：data-schema-id、可选 ref 合并、兜底策略
├── extensions/select-and-drag/components/
│   └── SelectionBox.tsx              # 可选：抽离为「仅 UI」或增加 portal 包装器
└── extensions/ui/center-canvas/components/
    └── CenterCanvas.tsx              # 提供覆盖层 DOM 节点 +（可选）React Context
```

**Structure Decision**: 变更集中在 **SchemaRenderer + 画布壳 + 选中扩展**；不新增应用目录。

## Complexity Tracking

> 无宪法违背项；本表留空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0: Outline & Research

**输出**: [research.md](./research.md)（已完成）

- R1：叶节点宿主合并、去掉双 `div`。  
- R2：`SelectionBox` / 悬停 → Portal + rect 差分。  
- R3：远程组件 `forwardRef` 与兜底。  
- R4：容器与叶节点统一装饰路径。

## Phase 1: Design & Contracts

**输出**:

- [data-model.md](./data-model.md) — `EditorChromeHost`、`EditorOverlayMount`、`ChromeRect`。  
- [contracts/material-root-host.md](./contracts/material-root-host.md) — 物料根节点契约。  
- [quickstart.md](./quickstart.md) — 验证步骤。

### 架构要点（实现指引）

1. **Overlay 根节点**  
   - 在 `CenterCanvas`（或与画布内容 **同源 transform** 的父级）内增加 **绝对定位、铺满可编辑区** 的容器，例如 `position: absolute; inset: 0; pointer-events: none`。  
   - 通过 **React Context** 向下提供 `overlayElement` 或 `getOverlayEl()`，供 `SelectableSchemaNode` / `SelectableContainer` Portal 使用。

2. **`SelectableSchemaNode`（叶节点）**  
   - 渲染：`RemoteSchemaNode`（或等价）为 **唯一** 主内容；将 `data-schema-id`、事件处理器、`ref`（或 ref 回调）挂到 **物料根**。  
   - 删除外层 `nodeRef` + 内层 `contentRef` 的固定双 `div`（未知组件/加载态可保留 **最薄** 占位，不计入「成功路径」）。  
   - `SelectionBox` 与悬停轮廓：**Portal 到 Overlay**；`x,y,width,height` 由宿主与 Overlay 的 **client rect 差** × `selectionRectVisualToLogical` 得到（与当前测量语义对齐）。  
   - `SelectionBox` 内手柄需 `pointer-events: auto`（保持现有实现思路）。

3. **`RemoteSchemaNode`**  
   - 向 `RemoteComponent` 传入 `data-schema-id={schema.id}`（及既有 props）；若物料将未知 props 过滤，则依赖 **forwardRef + ref 回调** 在 `useLayoutEffect` 中查找子树根（**仅作兜底**，性能与复杂度需在实现中收敛）。  
   - 契约见 [contracts/material-root-host.md](./contracts/material-root-host.md)。

4. **`SelectableContainer`**  
   - 保留 **一层** 带 `data-schema-id` 的容器以挂载 `children`。  
   - 将 **选中框** 从容器内部绝对定位改为与叶节点相同的 **Portal + rect**（容器宿主 rect 即当前 `nodeRef` 对应元素）。

5. **边界**  
   - 远程加载中、错误态：允许短暂占位 div；加载完成后叶节点应回到「单宿主」模型。  
   - 零尺寸节点：沿用现有 `SelectionBox` 默认最小宽高策略或等价处理。

### Agent context

执行（在 `apps/web_builder` 下）：

`bash .specify/scripts/bash/update-agent-context.sh cursor-agent`

## Phase 2（实现，非本命令产出）

由 `/speckit.tasks` 生成 `tasks.md` 后按任务拆解提交；本计划不替代任务列表。

## Testing & 质量

- **必做**: `rushx type-check`、`rushx lint`（触及文件）。  
- **规格对照**: [quickstart.md](./quickstart.md) 与 spec 中 SC-001–SC-004。  
- **回归**: 组件拖入、点击选中、拖拽、缩放、右键菜单、画布缩放（若可用）。

## Risks

| 风险 | 缓解 |
|------|------|
| 物料不 `forwardRef` 导致无法稳定测量 | `material-root-host` 契约 + 单层兜底宿主 + 文档标注 |
| Portal 与 transform 不同步导致框偏移 | Overlay 与画布内容 **共享** scale 祖先；差分用同一 `getBoundingClientRect` 时机（`ResizeObserver` + 可选 `requestAnimationFrame`） |
| 事件 `stopPropagation` 行为变化 | 保持与当前处理器同一元素上绑定，尽量不改为全局委托 |
