# Quickstart: 003-right-panel-inspector-ui

## 目标

在本地跑起编辑器，对照 `refer_ui/component-inspector-panel1.0.html` 验收右侧面板 IA 与视觉。

## 前置

- Rush monorepo，Node ≥ 18  
- 路径：`apps/web_builder`

## 命令

```bash
cd apps/web_builder
rush install   # 若尚未安装依赖
rushx dev      # 默认 Vite 端口见 vite.config / vite.app.config
```

浏览器打开应用（含 `pageId` 的编辑页，与现有联调方式一致）。

## 手工验收（最小集）

1. 选中画布任一组件 → 右侧出现 **Inspector** 头部标题 + **配置 | 信息** 分段。  
2. **配置**：可见 **属性配置**、**样式配置** 两段；修改一项样式 → 画布同步，撤销可用。  
3. **信息**：可见 **组件 ID**、**Type** 徽章、**只读** Schema 文本区。  
4. （若已实现）**编辑 Schema** → Modal 内编辑与保存逻辑与改版前一致。  
5. 键盘：Tab 可聚焦分段与表单；屏幕阅读器可读出当前 Tab。

## 质量门禁

```bash
cd apps/web_builder
rushx type-check
rushx lint
rushx test      # 若有相关用例
```

## 关键文件（实现入口）

- `src/extensions/features/properties-panel/components/PropertiesPanel.tsx` — 主装配  
- `src/extensions/features/properties-panel/components/PropertyForm.tsx` / `StyleForm.tsx` — 数据绑定保留，外层包壳  
- `src/extensions/features/properties-panel/index.ts` — 插槽 `right-panel:content` 注册不变  

## 文档索引

| 文档 | 用途 |
|------|------|
| [spec.md](./spec.md) | 需求与成功标准 |
| [plan.md](./plan.md) | 技术计划与结构 |
| [research.md](./research.md) | 设计决策 |
| [data-model.md](./data-model.md) | 逻辑实体与不变量 |
| [contracts/ui-inspector-panel.md](./contracts/ui-inspector-panel.md) | UI 结构契约 |
