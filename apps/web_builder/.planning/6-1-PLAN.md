# 6-1-PLAN.md

## 计划 6-1: 组件面板与添加功能

### 实现步骤

1. **创建组件面板**
   - ComponentPanel 组件
   - 分类显示
   - 可拖拽组件项

2. **实现拖拽添加**
   - 监听拖拽结束
   - 计算放置位置
   - 生成新组件 Schema
   - 添加到画布

3. **实现点击添加**
   - 选择组件类型
   - 画布点击放置模式
   - 连续添加支持

4. **定义基础组件**
   - Text 组件
   - Image 组件
   - Button 组件
   - Container 组件

### 验收标准

- [ ] 组件面板正确显示
- [ ] 拖拽添加组件到画布
- [ ] 点击添加组件
- [ ] 组件有默认样式

---

## 在 Cursor 中执行

```
请实现组件面板与添加功能。

任务:
1. 创建 src/extensions/add/components/ComponentPanel.tsx:
   - 左侧组件面板
   - 分类折叠面板 (Semi Collapse)
   - 组件图标和名称

2. 创建 src/extensions/add/components/ComponentItem.tsx:
   - 单个组件项
   - 可拖拽
   - 点击选中

3. 创建 src/extensions/add/services/ComponentRegistry.ts:
   - 注册基础组件
   - Text, Image, Button, Container
   - 每个组件有默认 props

4. 创建 src/extensions/add/hooks/useAddComponent.ts:
   - 添加组件逻辑
   - 生成新 Schema
   - 计算位置

5. 集成拖拽添加:
   - 从面板拖到画布
   - 释放时调用 addComponent

验证:
- 面板显示组件列表
- 拖拽添加到画布
- 点击添加到画布
```

---

*由 GSD 生成*
