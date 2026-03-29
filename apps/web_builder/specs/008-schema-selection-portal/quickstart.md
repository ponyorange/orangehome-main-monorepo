# Quickstart: 008-schema-selection-portal

## 本地验证（实现完成后）

1. **安装与类型检查**（monorepo 根目录）  
   - `rush install`（若尚未）  
   - `rushx type-check` / `rushx lint`（包：`@orangehome/web_builder`）

2. **启动编辑器**  
   - 按 `apps/web_builder/README.md` 启动 Vite 开发环境（含 `VITE_BFF_API_URL`）。

3. **DOM 走查（SC-001）**  
   - 向画布拖入 **至少 3 种** 不同叶节点物料（如按钮、文本、图片）。  
   - 打开开发者工具：从组件 **主可视根** 向上至画布内容区，确认 **无** 改造前那种「双壳」`SelectableSchemaNode` 结构；根上应有 `data-schema-id`。

4. **交互回归（SC-002 / SC-003）**  
   - 对每个抽样节点：**点击选中**、**拖拽移动**、**角点缩放**、**悬停虚线**、**从组件面板拖入**。  
   - 缩放画布（若 `CenterCanvas` 支持）：确认选中框 **不系统性偏移**。

5. **容器 smoke（P3）**  
   - 内置布局容器内放两个叶节点：分别选中子节点与容器，确认属性面板与选中态正常。

## 物料开发者

- 阅读 [contracts/material-root-host.md](./contracts/material-root-host.md)，优先为根节点实现 `forwardRef` 并透传 `data-schema-id`。
