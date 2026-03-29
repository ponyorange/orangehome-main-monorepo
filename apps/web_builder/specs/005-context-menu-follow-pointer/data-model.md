# Data Model: 005-context-menu-follow-pointer

本特性以 **UI 几何与交互状态** 为主，无持久化实体。以下为概念模型，供实现与测试对齐规格用语。

## 概念实体

### PointerAnchor（指针锚点）

- **含义**：用户触发上下文菜单时，用于定位的视口坐标点。
- **字段**：
  - `clientX: number` — 相对视口水平坐标
  - `clientY: number` — 相对视口垂直坐标
- **来源**：`React.MouseEvent` / `MouseEvent` 的 `clientX`/`clientY`（与 FR-001 一致）。

### Viewport（可视区域）

- **含义**：放置计算时所参照的矩形区域；与浏览器窗口视口一致。
- **字段**：
  - `width: number` — 通常 `window.innerWidth`
  - `height: number` — 通常 `window.innerHeight`
  - `padding: number` — 与屏幕边缘的安全间距（建议 8）

### MenuBox（菜单包围盒）

- **含义**：已渲染菜单 DOM 的轴对齐矩形。
- **字段**：
  - `width: number`
  - `height: number`
- **来源**：挂载后由 `getBoundingClientRect()` 或 `offsetWidth`/`offsetHeight` 读取。

### MenuPlacement（放置结果）

- **含义**：`position: fixed` 使用的左上角坐标。
- **字段**：
  - `left: number`
  - `top: number`
- **约束**：`MenuBox` 完全落在 `Viewport` 扣减 `padding` 后的矩形内（在极端小视口允许夹取到最大重叠，见 spec Edge Cases）。

## 关系

- `MenuPlacement` 由 **`resolveContextMenuPlacement(PointerAnchor, MenuBox, Viewport)`**（命名以代码为准）唯一确定，满足 **FR-002** 的翻转与夹取规则。

## 状态转换（运行时）

1. **Closed** → **Open（未测量）**：收到右键，`PointerAnchor` 确定，菜单挂载。
2. **Open（未测量）** → **Open（已放置）**：layout 后读取 `MenuBox`，计算 `MenuPlacement` 并更新样式。
3. **Open** → **Closed**：点击外部、`Escape`、或执行菜单项回调。

无服务端同步、无 schema 字段变更。
