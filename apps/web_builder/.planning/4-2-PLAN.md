# 4-2-PLAN.md

## 计划 4-2: 标尺系统实现

### 前置依赖
- 计划 4-1 完成（画布容器）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `src/extensions/ruler/components/Ruler.tsx` | 标尺组件 |
| 创建 | `src/extensions/ruler/components/RulerX.tsx` | 水平标尺 |
| 创建 | `src/extensions/ruler/components/RulerY.tsx` | 垂直标尺 |
| 创建 | `src/extensions/ruler/hooks/useRuler.ts` | 标尺 Hook |
| 修改 | `src/extensions/canvas/components/Canvas.tsx` | 集成标尺 |

### 实现步骤

1. **创建标尺组件**
   - 使用 Canvas 绘制刻度
   - 支持缩放
   - 显示刻度值

2. **实现水平和垂直标尺**
   - RulerX - 顶部标尺
   - RulerY - 左侧标尺

3. **集成到画布**
   - 画布添加标尺容器
   - 同步缩放比例

### 验收标准

- [ ] 标尺显示正确
- [ ] 随画布缩放变化
- [ ] 刻度清晰可读

---

## 在 Cursor 中执行

```
请实现标尺系统。

前置: 画布容器已实现。

任务:
1. 创建 src/extensions/ruler/components/Ruler.tsx:
   - 基础标尺组件
   - 使用 HTML5 Canvas 绘制刻度
   - 接收 width, height, zoom, direction

2. 创建 src/extensions/ruler/components/RulerX.tsx:
   - 水平标尺
   - 显示在画布上方

3. 创建 src/extensions/ruler/components/RulerY.tsx:
   - 垂直标尺
   - 显示在画布左侧

4. 创建 src/extensions/ruler/hooks/useRuler.ts:
   - 标尺刻度计算
   - 根据 zoom 调整刻度密度

5. 修改 src/extensions/canvas/components/Canvas.tsx:
   - 添加标尺容器
   - 传入 zoom 值

验证:
- 标尺正确显示
- 缩放时刻度变化

参考: https://github.com/daybrush/ruler
```

---

*由 GSD 生成*
