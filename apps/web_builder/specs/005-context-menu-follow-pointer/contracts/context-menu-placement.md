# Contract: 上下文菜单视口内放置

**Consumer**: `ContextMenu`（及未来复用同一规则的右键菜单）  
**Package**: `apps/web_builder`

## 纯函数语义（概念）

```
resolveContextMenuPlacement(input): { left: number; top: number }
```

### Input（字段名以实现为准）

| 字段 | 类型 | 说明 |
|------|------|------|
| `clientX` | `number` | 指针视口 X |
| `clientY` | `number` | 指针视口 Y |
| `menuWidth` | `number` | 菜单实际宽度，> 0 |
| `menuHeight` | `number` | 菜单实际高度，> 0 |
| `viewportWidth` | `number` | 视口宽，> 0 |
| `viewportHeight` | `number` | 视口高，> 0 |
| `padding` | `number` | 与视口边缘最小距离，≥ 0 |

### Output

- `left`、`top`：`position: fixed` 的左上角，使菜单矩形完全位于  
  `[padding, viewportWidth - padding - menuWidth]` × `[padding, viewportHeight - padding - menuHeight]`  
  的**夹取结果**内（当视口小于菜单时，夹取到允许的最大可见重叠，见 spec 小视口说明）。

### 算法要求（与 research R2 一致）

1. **默认**：菜单左上角 = `(clientX, clientY)`。
2. **水平**：若 `clientX + menuWidth + padding > viewportWidth`，优先尝试 `left = clientX - menuWidth`（菜单在指针左侧）；再与夹取区间取交集。
3. **竖直**：若 `clientY + menuHeight + padding > viewportHeight`，优先尝试 `top = clientY - menuHeight`（菜单在指针上方）；再与夹取区间取交集。
4. **最终**：对 `left`、`top` 分别 `clamp` 到上述可行区间；若 `menuWidth > viewportWidth - 2*padding` 等极端情况，`left` 取 `padding`（或等价最大可见策略）。

### 不变量

- 调用方 **不得** 在多个右键菜单中复制另一套「固定角」逻辑；新入口须调用此函数或唯一包装。

### 非目标

- 不处理 iframe 内坐标（本编辑器菜单在顶层文档）。
- 不处理菜单打开后随指针移动（由 FR-003 禁止，无需 API 支持）。
