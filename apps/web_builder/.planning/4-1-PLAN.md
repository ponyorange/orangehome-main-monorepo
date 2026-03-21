# 4-1-PLAN.md

## 计划 4-1: 画布容器与基础渲染

### 前置依赖
- 计划 3-2 完成（Schema 渲染）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `src/extensions/canvas/hooks/useZoom.ts` | 缩放 Hook |
| 创建 | `src/extensions/canvas/components/Grid.tsx` | 网格组件 |
| 创建 | `src/extensions/canvas/components/Ruler.tsx` | 标尺组件 |
| 修改 | `src/extensions/ui/center-canvas/components/CenterCanvas.tsx` | 集成画布功能 |

### 实现步骤

1. **创建 useZoom Hook**
   - zoom 状态管理
   - 放大/缩小/重置方法
   - Ctrl/Cmd + 滚轮缩放支持

2. **创建 Grid 组件**
   - SVG 虚线网格
   - 根据画布尺寸动态生成

3. **创建 Ruler 组件**
   - 水平和垂直标尺
   - 显示刻度数值

4. **更新 CenterCanvas**
   - 集成缩放控制按钮
   - 集成网格背景
   - 集成 Schema 渲染
   - 支持滚轮缩放

### 验收标准

- [x] 画布能正确显示 Schema 内容
- [x] 支持缩放按钮和滚轮缩放
- [x] 网格背景显示
- [x] 显示缩放比例

### 截图验证

画布显示：
- 顶部工具栏（画布尺寸 375x667、缩放控制按钮 100%）
- 网格背景（虚线网格）
- Schema 内容（"欢迎使用 Orange Editor" / "这是一个低代码编辑器"）
- 缩放提示（Ctrl/Cmd + 滚轮缩放）

---

*由 GSD 生成*
