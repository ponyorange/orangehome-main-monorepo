# Contract: 编辑区画布幅面（逻辑像素）

**Consumer**: `CenterCanvas`、`RulerX`、`RulerY`、`Grid`、`AlignmentGuides` 及任何依赖「中心编辑区逻辑尺寸」的代码  
**Package**: `apps/web_builder`

## 常量

| 名称 | 值 | 说明 |
|------|-----|------|
| `EDITOR_CANVAS_WIDTH` | `750` | 逻辑宽 |
| `EDITOR_CANVAS_HEIGHT` | `1334` | 逻辑高 |

实现文件路径以代码为准（见 `plan.md`）；**禁止**在业务组件中再写魔法数 `375`/`667` 指代本画布。

## 行为契约

1. **CenterCanvas** 白底画布容器（`scaledWidth`/`scaledHeight`）必须等于 `EDITOR_CANVAS_WIDTH * zoom` × `EDITOR_CANVAS_HEIGHT * zoom`（浮点误差允许在亚像素级）。
2. **RulerX** 收到的 `canvasWidth` MUST 等于 `EDITOR_CANVAS_WIDTH`；**RulerY** 收到的 `canvasHeight` MUST 等于 `EDITOR_CANVAS_HEIGHT`。
3. **用户可见文案** 中若描述「当前画布像素尺寸」，MUST 显示 **750×1334**（或与常量同步的格式化字符串），除非明确标注为「预览设备」等非编辑画布场景。

## 非目标

- 不规定 runtime 预览页视口尺寸。
- 不规定 `Preview.tsx` 内 `mobile` 设备框尺寸（本迭代默认不变，见 `research.md` R4）。
