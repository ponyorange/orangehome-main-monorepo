# 11-1-PLAN.md

## 计划 11-1: 预览与导出功能

### 实现步骤

1. **实现预览模式**
   - Preview 组件
   - 隐藏编辑面板
   - 显示模拟设备框

2. **实现导出功能**
   - 导出 JSON 文件
   - 复制到剪贴板
   - 生成分享链接

3. **实现导入功能**
   - 上传 JSON 文件
   - 解析并加载
   - 验证 Schema

4. **工具栏集成**
   - 预览按钮
   - 导出按钮
   - 导入按钮

### 验收标准

- [ ] 预览模式隐藏编辑 UI
- [ ] 导出 JSON 文件
- [ ] 导入 JSON 文件
- [ ] 工具栏按钮工作

---

## 在 Cursor 中执行

```
请实现预览与导出功能。

任务:
1. 创建 src/core/components/Preview.tsx:
   - 预览模式组件
   - 隐藏左右面板
   - 显示设备模拟框
   - 支持手机/平板/桌面尺寸

2. 创建 src/core/services/ExportService.ts:
   - exportToJSON(schema): 下载 JSON 文件
   - copyToClipboard(schema): 复制到剪贴板
   - generateShareLink(schema): 生成分享链接

3. 创建 src/core/services/ImportService.ts:
   - importFromFile(file): 从文件导入
   - importFromJSON(json): 从 JSON 字符串导入
   - validateSchema(schema): 验证有效性

4. 创建工具栏:
   - src/core/components/Toolbar.tsx
   - 预览按钮
   - 导出按钮
   - 导入按钮

5. 集成到编辑器:
   - 切换预览模式
   - 处理导入导出

验证:
- 预览按钮隐藏编辑 UI
- 导出下载 JSON 文件
- 导入正确加载 Schema
- 工具栏功能正常
```

---

*由 GSD 生成*
