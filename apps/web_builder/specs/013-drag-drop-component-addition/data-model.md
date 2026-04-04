# Data Model: 013-drag-drop-component-addition

## 概述

本功能不引入新数据实体，完全复用现有 `ISchema` 类型和存储结构。

## 现有实体使用

### ISchema (核心文档)

```typescript
interface ISchema {
  id: string;                    // 组件唯一标识
  type: string;                  // 组件类型（Container, Button, Text等）
  name?: string;                 // 显示名称
  position?: {                   // 位置（逻辑坐标，与画布缩放无关）
    x: number;
    y: number;
  };
  size?: {                       // 尺寸
    width: number;
    height: number;
  };
  children?: ISchema[];          // 子组件数组（仅容器类型有）
  props?: Record<string, any>;  // 组件属性
}
```

## 坐标系统

### 视觉坐标 (Visual Coordinate)

- 来源: 鼠标事件 `event.clientX` / `event.clientY`
- 单位: 屏幕像素
- 受画布缩放影响: 否（总是屏幕像素）

### 逻辑坐标 (Logical Coordinate)

- 存储: `ISchema.position.x/y`
- 单位: CSS像素
- 受画布缩放影响: 否

### 坐标转换公式

```
// 视觉坐标 → 逻辑坐标
逻辑x = (视觉clientX - 容器Rect.left) / 画布缩放因子
逻辑y = (视觉clientY - 容器Rect.top) / 画布缩放因子

// 示例
画布缩放: 200% (zoom = 2)
鼠标屏幕位置: (400, 300)
容器DOM位置: Rect { left: 100, top: 100 }
→ 逻辑x = (400 - 100) / 2 = 150
→ 逻辑y = (300 - 100) / 2 = 100
```

## 存储交互

### 读取

| Store | 字段 | 用途 |
|-------|-----|-----|
| schemaStore | `schema` | 获取完整schema树，用于查找目标容器 |
| selectionStore | `selectedIds` | 获取当前选中组件，单击添加时使用 |
| materialBundleStore | `editorConfigs[type].isContainer` | 判断组件类型是否为容器 |

### 写入

| Store | 操作 | 用途 |
|-------|-----|-----|
| schemaStore | `setSchema(updated)` | 添加新子组件后更新schema |
| selectionStore | `setSelectedIds([newId])` | 自动选中新添加的组件 |

## 辅助函数

### 容器识别

```typescript
// src/common/base/schemaLayout.ts
function isBuiltInLayoutContainerType(type: string): boolean
// 判断是否为内置容器类型（Container, @orangehome/common-component-rootcontainer）

// src/extensions/ui/center-canvas/hooks/useCanvasDrop.ts
function isDropContainerNode(node: ISchema): boolean
// 综合判断：内置容器 或 editorConfigs[type].isContainer === true
```

### Schema操作

```typescript
// src/common/base/schemaOperator.ts
function addChild(schema: ISchema, parentId: string, child: ISchema): ISchema
// 在指定父节点下添加子组件，返回新的schema树

function findById(schema: ISchema, id: string): ISchema | null
// 根据ID查找schema节点
```

### 命中测试

```typescript
// src/extensions/ui/center-canvas/hooks/useCanvasDrop.ts
function findDropTarget(
  clientX: number,
  clientY: number,
  schema: ISchema
): string
// 返回命中的容器ID或根schemaID
```

## 不变性约束

1. **Schema不可变性**: 所有schema变更通过`addChild`等纯函数，返回新schema对象
2. **坐标系统一致性**: 逻辑坐标始终独立于画布缩放状态
3. **容器类型一致性**: 容器识别逻辑统一使用`isDropContainerNode`，避免多处不一致判断
