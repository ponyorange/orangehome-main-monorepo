# 8-1-PLAN.md

## 计划 8-1: 属性面板容器与基础组件

### 实现步骤

1. **创建属性面板容器**
   - PropertiesPanel 组件
   - 显示选中组件信息
   - 分组显示属性

2. **实现基础原子组件**
   - Input 文本输入
   - InputNumber 数字输入
   - Select 下拉选择
   - Switch 开关
   - Slider 滑块

3. **实现属性表单**
   - 根据组件配置生成表单
   - 双向绑定
   - 实时更新画布

4. **样式配置**
   - 基础样式：宽、高、位置
   - 外观样式：背景、边框、阴影

### 验收标准

- [ ] 属性面板正确显示
- [ ] 选中组件属性可编辑
- [ ] 修改实时同步到画布
- [ ] 基础原子组件工作正常

---

## 在 Cursor 中执行

```
请实现属性面板和基础原子组件。

任务:
1. 创建 src/extensions/comp-settings/components/PropertiesPanel.tsx:
   - 右侧属性面板
   - 显示选中组件信息
   - 空状态显示

2. 创建 src/common/components/atom/:
   - Input.tsx: 文本输入
   - InputNumber.tsx: 数字输入
   - Select.tsx: 下拉选择
   - Switch.tsx: 开关
   - Slider.tsx: 滑块

3. 创建 src/extensions/comp-settings/components/PropertyForm.tsx:
   - 根据组件类型渲染不同表单
   - 双向绑定 props
   - 调用 schemaOperator.updateProps

4. 创建 src/extensions/comp-settings/components/StyleForm.tsx:
   - 样式配置表单
   - 位置、尺寸
   - 背景、边框

验证:
- 选中组件显示属性面板
- 修改属性实时更新
- 原子组件样式正确
```

---

*由 GSD 生成*
