# 9-1-PLAN.md

## 计划 9-1: 图层树实现

### 实现步骤

1. **创建图层树组件**
   - LayerTree 组件
   - 递归渲染树
   - 缩进表示层级

2. **实现图层项**
   - 显示组件名称和图标
   - 选中状态
   - 操作按钮（显隐、锁定）

3. **实现拖拽排序**
   - 同层级拖拽排序
   - 跨层级移动

4. **同步选中状态**
   - 与画布选中同步
   - 双向同步

### 验收标准

- [ ] 图层树显示正确
- [ ] 点击选中组件
- [ ] 拖拽排序工作
- [ ] 显隐锁定功能正常

---

## 在 Cursor 中执行

```
请实现图层树。

任务:
1. 创建 src/extensions/layer/components/LayerPanel.tsx:
   - 左侧图层面板
   - 标题和工具栏

2. 创建 src/extensions/layer/components/LayerTree.tsx:
   - 树形组件
   - 递归渲染
   - Semi Tree 组件

3. 创建 src/extensions/layer/components/LayerItem.tsx:
   - 图层项
   - 组件图标、名称
   - 显隐按钮、锁定按钮
   - 选中状态

4. 创建 src/extensions/layer/hooks/useLayerTree.ts:
   - 从 Schema 生成树数据
   - 处理选中
   - 处理排序

5. 实现拖拽排序:
   - 使用 react-sortable-tree 或自研
   - 更新 Schema children 顺序

验证:
- 图层树正确显示层级
- 点击选中画布组件
- 拖拽改变顺序
- 显隐锁定按钮工作
```

---

*由 GSD 生成*
