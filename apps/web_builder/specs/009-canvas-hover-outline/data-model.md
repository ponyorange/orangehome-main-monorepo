# Data Model: 009 画布悬停虚线框

## 状态

| 名称 | 类型 | 持久化 | 说明 |
|------|------|--------|------|
| `hoverId` | `string \| null` | 否 | 当前指针悬停下的**单一**可编辑 schema 节点 id；由选择 hook / Context 暴露 |
| `selectedIds` | `string[]` | 否 | 既有选中；本功能**不得**被 hover 逻辑修改 |

## 不变量

1. **至多一个** hover 目标：`hoverId` 为 null 或单个 id。  
2. **hover 不写 schema**：`ISchema` 树不因悬停变化。  
3. **命中一致**：`hoverId` 对应的节点必须满足 `findById(rootSchema, hoverId) !== null`（根策略见下）。  
4. **根排除**：若产品定义页面根 `rootSchema.id` 不可作为「子组件级」交互目标，则 `hoverId` **不得**等于 `rootSchema.id`。

## 与 DOM 的关系

- **宿主元素**：由 `canvasSchemaHostRegistry` 登记，与选中框同源。  
- **测量**：覆盖层矩形 = `getBoundingClientRect(host)` 相对 overlay 的差值 × `selectionRectVisualToLogical`（与选中一致）。

## 状态转移（概念）

```
指针在画布内移动
  → 解析命中 id（或 null）
  → 若 id === rootId（排除策略）→ 视为 null
  → hoverId := id（与上一值比较，相同则跳过更新）

指针离开画布区
  → hoverId := null
```

（实现可合并 `handleMouseEnter` / `handleMouseLeave`，但对外语义等价。）
