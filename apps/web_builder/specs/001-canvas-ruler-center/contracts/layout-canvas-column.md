# Contract: 中间画布列 — 画布与横向标尺水平居中

**Consumer**: Orange Editor 编辑态 UI  
**Provider**: `CenterCanvas` 布局（`src/extensions/ui/center-canvas/components/CenterCanvas.tsx`）

## 行为约定

1. **居中定义**  
   设滚动容器可视宽度为 `W`，画布逻辑宽度为 `w`（= 设计宽度 × 缩放），最小水平边距为 `m`。  
   画布块左偏移 `left` 满足：  
   - `left = max(m, (W - w) / 2)`（与当前实现公式一致）。  
   稳定布局下，画布块在可视区域内水平居中（在 `W >= w + 2m` 时严格居中；更窄时贴边不小于 `m`）。

2. **触发重算**  
   当 `W` 因以下任一原因变化时，必须在布局稳定前/后更新 `left`：  
   - 浏览器窗口尺寸变化；  
   - 中间画布列在 flex 布局中分配到的宽度变化（含侧栏显隐、宽度变化）。

3. **横向标尺**  
   横向标尺与画布共享同一水平原点：标尺滚动偏移与画布滚动偏移一致（现有 `scrollX - canvasLeftOffset` 语义保持不变）。

4. **非范围**  
   - 不改变页面 schema、导出 JSON、预览模式 DOM 契约（除非预览复用同一组件且需一致体验，另议）。  
   - 纵向标尺不参与本契约的水平居中计算。

## 版本

- 文档版本：与特性 `001-canvas-ruler-center` 计划同步；实现变更时请更新本文或 plan 中的「契约」段落。
