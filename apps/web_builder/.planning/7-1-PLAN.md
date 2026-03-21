# 7-1-PLAN.md

## 计划 7-1: 组件移动与调整大小

### 实现步骤

1. **实现拖拽移动**
   - 选中组件可拖拽
   - 更新组件位置
   - 拖拽时显示辅助线

2. **实现 8 方向调整大小**
   - ResizeHandle 组件
   - 8 个方向手柄
   - 拖拽调整尺寸

3. **实现键盘微调**
   - 方向键移动 1px
   - Shift+方向键移动 10px

4. **智能对齐**
   - 与其他组件对齐
   - 显示对齐辅助线

### 验收标准

- [ ] 选中组件可拖拽移动
- [ ] 8 方向手柄调整大小
- [ ] 键盘方向键微调
- [ ] 对齐辅助线显示

---

## 在 Cursor 中执行

```
请实现组件移动与调整大小。

任务:
1. 创建 src/extensions/move/components/Moveable.tsx:
   - 可移动包装组件
   - 监听拖拽
   - 更新组件位置

2. 创建 src/extensions/resize/components/ResizeHandles.tsx:
   - 8 个方向手柄
   - 每个手柄可拖拽
   - 更新组件尺寸

3. 创建 src/extensions/move/hooks/useMove.ts:
   - 拖拽移动逻辑
   - 更新 Schema 位置

4. 创建 src/extensions/resize/hooks/useResize.ts:
   - 调整大小逻辑
   - 保持比例选项

5. 创建 src/extensions/move/services/AlignmentService.ts:
   - 智能对齐检测
   - 辅助线显示

6. 添加键盘事件:
   - 方向键监听
   - 微调位置

验证:
- 选中组件可拖拽
- 调整大小手柄工作
- 键盘微调有效
- 对齐辅助线显示
```

---

*由 GSD 生成*
