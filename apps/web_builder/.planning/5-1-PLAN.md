# 5-1-PLAN.md

## 计划 5-1: 选择与悬停系统

### 实现步骤

1. **创建 HoverSelectService**
   - 管理 hover 和 select 状态
   - 提供 select(), hover(), clear() 方法

2. **实现悬停检测**
   - 鼠标移动事件
   - 碰撞检测
   - Hover 状态更新

3. **实现单选/多选**
   - 点击选中
   - Ctrl+点击多选
   - 框选（Shift+拖拽）

4. **创建选中框组件**
   - SelectionBox 组件
   - 显示在选中组件上方
   - 显示组件尺寸

### 验收标准

- [ ] 鼠标悬停显示高亮
- [ ] 点击选中组件
- [ ] Ctrl+点击多选
- [ ] 选中框正确显示

---

## 在 Cursor 中执行

```
请实现组件选择与悬停系统。

任务:
1. 创建 src/extensions/select-and-drag/services/HoverSelectService.ts:
   - @injectable() 装饰
   - hoverId, selectedIds 状态
   - select(id, multi?), hover(id), clear() 方法
   - 事件通知

2. 创建 src/extensions/select-and-drag/components/SelectionBox.tsx:
   - 选中框组件
   - 显示在选中组件位置
   - 显示尺寸信息
   - 支持多选显示

3. 创建 src/extensions/select-and-drag/hooks/useSelection.ts:
   - 获取选中状态
   - 处理点击事件

4. 集成到 SchemaRenderer:
   - 节点添加点击事件
   - 鼠标悬停效果

验证:
- 悬停显示高亮边框
- 点击选中显示选中框
- Ctrl+点击多选
```

---

*由 GSD 生成*
