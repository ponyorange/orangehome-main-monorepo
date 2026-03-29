# Implementation Plan: 右键菜单锚定指针位置

**Branch**: `005-context-menu-follow-pointer` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-context-menu-follow-pointer/spec.md`

## Summary

编辑器画布右键菜单由 `CenterCanvas` 传入 `event.clientX` / `event.clientY`，`ContextMenu` 使用 `position: fixed` 展示。实现上采用 **`useLayoutEffect` + 菜单实测尺寸** 与 **`src/utils/contextMenuPlacement.ts` 中 `resolveContextMenuPlacement`**（翻转 + 视口夹取，内边距 8px），替代原固定估算宽高的 `Math.min` 逻辑；符合 **FR-001～FR-003**。**Story 3**：本迭代仅 **画布 `ContextMenu`**；新增其他右键菜单须复用同一 util（见 `contextMenuPlacement.ts` 文件头注释）。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18  
**Primary Dependencies**: React、`@douyinfe/semi-ui`（本菜单为自绘 div，不强制使用 Semi Dropdown）  
**Storage**: N/A  
**Testing**: 以手工走查 + `quickstart.md` 为主；可选对纯函数 `resolveContextMenuPlacement` 做 Vitest 单测（非强制）  
**Target Platform**: 现代桌面浏览器（`position: fixed` + `clientX`/`clientY` 视口坐标）  
**Project Type**: Rush 包 `apps/web_builder`  
**Performance Goals**: 打开菜单仅一次 layout 测量（`useLayoutEffect`），避免拖动时重复计算  
**Constraints**: 遵守 constitution；**不**为放置逻辑新增全局单例；优先纯函数 + 组件内局部 state  
**Scale/Scope**: 改动集中在 `ContextMenu.tsx`；可选新建 `src/utils/contextMenuPlacement.ts`；`CenterCanvas` 仅在有坐标系变更时调整

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| Extensions + SlotRegistry | ✅ | 菜单已在 `extensions/editing/context-menu`；继续扩展该扩展，不向 `OrangeEditor` 根节点乱挂菜单 |
| Schema 真相 | ✅ | 本特性仅 UI 定位，不改 schema 变更路径 |
| DI | ✅ | 放置算法为纯函数，无需新 Inversify 服务 |
| State & data | ✅ | 不引入新全局 store；定位用组件内 `useState`/`useLayoutEffect` |
| Public API | ✅ | 不修改 `package.json` exports（除非后续把 util 导出给外仓，本计划不导出） |
| Quality | ✅ | `rushx type-check` / `rushx lint` |

**Post-Phase-1**: 无新增违背。

## Project Structure

### Documentation (this feature)

```text
specs/005-context-menu-follow-pointer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── context-menu-placement.md
└── tasks.md                    # /speckit.tasks
```

### Source Code（拟修改）

```text
apps/web_builder/
├── src/
│   ├── utils/
│   │   └── contextMenuPlacement.ts     # resolveContextMenuPlacement（新建，可选）
│   └── extensions/
│       ├── editing/
│       │   └── context-menu/
│       │       └── components/
│       │           └── ContextMenu.tsx # 测量尺寸 + 调用放置算法 + 降级
│       └── ui/
│           └── center-canvas/
│               └── components/
│                   └── CenterCanvas.tsx # 若无坐标问题可不改；仅传递 clientX/Y 已满足 FR-001
```

**Structure Decision**: 单包 `apps/web_builder`；放置逻辑抽到 `utils` 便于单测与复用（Story 3）。

## Phase 0: Research

**Output**: [research.md](./research.md)（本命令生成）

## Phase 1: Design & Contracts

**Outputs**:

- [data-model.md](./data-model.md)
- [contracts/context-menu-placement.md](./contracts/context-menu-placement.md)
- [quickstart.md](./quickstart.md)

**Agent context**: 运行 `update-agent-context.sh cursor-agent`（`SPECIFY_FEATURE=005-context-menu-follow-pointer`）。

## Phase 2（实现概要，由 /speckit.tasks 细化）

1. 新增 `resolveContextMenuPlacement`（或等价命名），输入指针坐标、菜单实测宽高、视口宽高与内边距，输出 `left`/`top`（含水平/垂直翻转与最终夹取）。  
2. 修改 `ContextMenu.tsx`：首帧可先用指针坐标渲染隐藏或可见，**`useLayoutEffect`** 读取 `menuRef` 宽高后计算最终位置并 `setState`，避免闪烁可采用 opacity 0→1 或初始即正确（二次 layout 可接受则简化）。  
3. 按 `quickstart.md` 在四角、滚动容器内走查；若发现 `CenterCanvas` 滚动导致坐标偏差，再评估是否传入容器 `getBoundingClientRect` 做相对修正（当前 `clientX/Y` 已为视口坐标，通常足够）。  
4. **Story 3 范围（本迭代）**：仅 **画布节点右键 → `ContextMenu`**；其他入口若存在需另开任务并复用 `contextMenuPlacement`。

**Placement 排查（2026-03-29）**：全仓 `onContextMenu` 仅经 `SelectableComponents` / `SelectableSchemaRenderer` 透传至画布；当前唯一弹出 **`ContextMenu`** 的入口为 `CenterCanvas`。无第二套 `position: fixed` 右键菜单需合并；**SC-004** 第二触发区域待后续面板等接入后再验收。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
