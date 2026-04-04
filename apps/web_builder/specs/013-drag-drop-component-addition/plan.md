# Implementation Plan: 拖动组件到容器上方添加组件、计算鼠标落点、单击添加组件到选中容器

**Branch**: `[013-drag-drop-component-addition]` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-drag-drop-component-addition/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

通过扩展现有拖拽系统（useCanvasDrop）和物料面板交互，实现三个核心功能：
1. 拖动组件时智能识别下方容器并添加子组件
2. 精确计算鼠标落点位置（考虑画布缩放）
3. 单击物料面板组件添加到当前选中容器

技术方案复用现有 `useCanvasDrop` 钩子的 `findDropTarget` 命中测试逻辑，扩展视觉反馈和坐标计算。

## Technical Context

**Language/Version**: TypeScript 5, React 18  
**Primary Dependencies**: Zustand (state), Inversify (DI), Semi Design (UI), Vite  
**Storage**: ISchema document tree (Zustand store)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web (Chrome/Firefox/Edge/Safari)  
**Project Type**: web-builder SPA  
**Performance Goals**: <100ms响应时间，95%拖拽成功率  
**Constraints**: 坐标偏差<5px，支持画布缩放(0.1x-5x)  
**Scale/Scope**: 单页面编辑器，支持嵌套容器任意深度

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Per `.specify/memory/constitution.md` (Orange Editor / `@orangehome/web_builder`):

- **Extensions**: ✅ UI/feature work使用现有extension模型，`useCanvasDrop`已位于`src/extensions/ui/center-canvas/hooks/`
- **Schema**: ✅ 所有变更通过`ISchema`和`schemaOperator`（addChild），符合schema source of truth原则
- **DI**: ✅ 使用现有Zustand stores（schemaStore, selectionStore, materialBundleStore），无新单例
- **State & data**: ✅ Store路径符合`src/core/store/`，无新HTTP调用
- **Public API**: ✅ 无新公开API，内部功能增强
- **Quality**: ✅ 计划包含type-check和lint验证

**Status**: 所有检查通过，无需Complexity Tracking

## Project Structure

### Documentation (this feature)

```text
specs/013-drag-drop-component-addition/
├── plan.md              # This file
├── research.md          # Phase 0 output (无需额外研究，复用现有patterns)
├── data-model.md        # Phase 1 output (使用现有ISchema，无新实体)
├── quickstart.md        # Phase 1 output (测试步骤)
├── contracts/           # N/A (无外部接口)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/web_builder/src/
├── extensions/ui/center-canvas/
│   ├── hooks/
│   │   └── useCanvasDrop.ts          # 修改：添加视觉反馈和精确落点
│   └── components/
│       └── CenterCanvas.tsx          # 修改：视觉反馈渲染
├── extensions/features/material-panel/
│   └── components/
│       └── MaterialPanel.tsx         # 修改：单击添加逻辑
├── common/base/
│   ├── schemaLayout.ts               # 已有：isBuiltInLayoutContainerType
│   └── schemaOperator.ts             # 已有：addChild
├── core/store/
│   ├── schemaStore.ts                # 已有：schema mutations
│   ├── selectionStore.ts             # 已有：selectedIds
│   └── materialBundleStore.ts        # 已有：editorConfigs[isContainer]
└── types/base/
    └── schema.ts                     # 已有：ISchema
```

**Structure Decision**: 复用现有`useCanvasDrop`钩子和物料面板，修改两个主要文件：
1. `useCanvasDrop.ts` - 增强drop逻辑和视觉状态
2. `MaterialPanel.tsx` - 添加单击交互

## Phase 0: Research

**状态**: 无需额外研究。所有技术patterns已在现有代码中验证：

| 未知项 | 解决方案来源 |
|--------|-----------|
| 容器识别 | `useCanvasDrop.ts` 已使用 `isDropContainerNode` + `editorConfigs.isContainer` |
| 命中测试 | `findDropTarget` 使用 `document.elementsFromPoint` |
| 坐标转换 | 现有画布缩放因子 `zoom` 在 `CenterCanvas` 中获取 |
| 选中容器 | `selectionStore.selectedIds` 已可用 |

**Decision**: 直接复用现有实现，无需新建research.md

## Phase 1: Design & Contracts

### 数据模型

使用现有 `ISchema`，无新实体。坐标计算使用以下已有字段：
- `ISchema.position.x/y` - 组件位置（逻辑坐标）
- `ISchema.children` - 容器子组件数组

### 核心算法

**坐标转换算法**:
```
逻辑坐标 = (视觉坐标 - 容器原点) / 缩放因子
其中：
- 视觉坐标 = clientX/Y (鼠标屏幕坐标)
- 容器原点 = targetContainer.getBoundingClientRect()
- 缩放因子 = canvasZoom (来自画布store)
```

**位置防重叠算法（单击添加）**:
```
初始位置 = (20, 20)
while 位置已被占用:
  位置 += (20, 20)  // 右下递增
返回位置
```

### 视觉反馈设计

**容器悬停高亮**: 2px solid #1890ff 边框 + rgba(24,144,255,0.1) 背景
**实现方式**: `useCanvasDrop` 返回 `dropTargetId`，`CenterCanvas` 通过 `SelectionContext` 或专用样式注入

### 文件变更清单

| 文件 | 变更类型 | 说明 |
|-----|---------|-----|
| `useCanvasDrop.ts` | 修改 | 增强`handleDrop`计算落点坐标，添加视觉反馈状态 |
| `CenterCanvas.tsx` | 修改 | 渲染容器高亮效果（基于`dropTargetId`） |
| `MaterialPanel.tsx` | 修改 | 添加`onClick`处理，调用`addChild`到选中容器 |
| `SelectableComponents.tsx` | 可选 | 微调容器点击事件，确保拖拽时不受干扰 |

### 依赖关系

```
MaterialPanel.tsx
  ↓ imports
  useSchemaStore, useSelectionStore, schemaOperator.addChild
  ↓
useCanvasDrop.ts (existing)
  ↓ imports
  schemaStore, selectionStore, materialBundleStore
```

## Implementation Strategy

### 修改点 1: useCanvasDrop.ts - 精确落点计算

当前`handleDrop`使用默认样式，需修改以：
1. 计算鼠标相对于目标容器的位置
2. 转换视觉坐标到逻辑坐标（考虑缩放）
3. 设置新组件的position.x/y

### 修改点 2: CenterCanvas.tsx - 视觉反馈

1. 从`useCanvasDrop`获取`dropTargetId`
2. 当`dropTargetId`有效时，在对应容器DOM上添加高亮class
3. 使用CSS-in-JS或data-attribute方式动态样式

### 修改点 3: MaterialPanel.tsx - 单击添加

1. 监听物料项`onClick`
2. 获取`selectionStore.selectedIds[0]`作为目标
3. 检查目标是否为容器（使用`isDropContainerNode`）
4. 生成默认位置（20,20递增）
5. 调用`addChild`并自动选中新组件

### 坐标系统说明

- **视觉坐标**: 屏幕像素，鼠标event.clientX/clientY
- **逻辑坐标**: ISchema中存储的坐标，与画布缩放无关
- **容器原点**: 容器DOM的getBoundingClientRect()
- **转换**: `逻辑 = (视觉 - 原点) / 缩放`

## Quality Gates

- `rushx type-check` - TypeScript无错误
- `rushx lint` - ESLint通过
- 手动测试:
  1. 拖动到容器 → 视觉反馈 + 正确落点
  2. 拖动到画布 → 根级添加
  3. 单击添加 → 选中容器/根画布
  4. 坐标精度 <5px偏差

## Next Steps

1. `/speckit.tasks` - 生成具体任务清单
2. `/speckit.implement` - 执行实现
