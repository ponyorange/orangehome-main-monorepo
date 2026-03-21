# 8-2-PLAN.md

## 计划 8-2: 高级原子组件

### 实现步骤

1. **实现高级组件**
   - ColorPick 颜色选择器
   - ImageUpload 图片上传
   - RichText 富文本编辑
   - ArrayEditor 数组编辑

2. **创建组件配置映射**
   - 每种组件的属性配置
   - 动态生成表单

3. **优化属性面板**
   - 折叠面板分组
   - 搜索属性
   - 属性联动

### 验收标准

- [ ] 颜色选择器工作
- [ ] 图片上传可用
- [ ] 富文本编辑正常
- [ ] 属性分组清晰

---

## 在 Cursor 中执行

```
请实现高级原子组件。

任务:
1. 创建 src/common/components/atom/ColorPick.tsx:
   - 颜色选择器
   - 支持 HEX/RGB
   - 预设颜色

2. 创建 src/common/components/atom/ImageUpload.tsx:
   - 图片上传组件
   - 预览功能
   - URL 输入

3. 创建 src/common/components/atom/RichText.tsx:
   - 富文本编辑器
   - 基础格式化
   - 使用 contenteditable 或轻量编辑器

4. 创建 src/common/components/atom/ArrayEditor.tsx:
   - 数组编辑
   - 增删改项
   - 拖拽排序

5. 创建组件配置:
   - src/common/components/configs/textConfig.ts
   - src/common/components/configs/imageConfig.ts
   - src/common/components/configs/buttonConfig.ts

验证:
- 颜色选择器正常
- 图片上传可用
- 富文本可编辑
- 数组可增删
```

---

*由 GSD 生成*
