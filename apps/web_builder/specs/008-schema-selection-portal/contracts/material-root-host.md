# Contract: 物料根节点作为编辑器宿主（叶节点）

**范围**：`apps/web_builder` 画布上由 `RemoteSchemaNode` 渲染的 **叶节点** 远程组件。  
**目标**：在 **无额外编辑器包裹 `div`** 的前提下，仍能 **选中、拖拽、缩放测量、右键菜单**。

## 必须（SHOULD 尽力，见兜底）

1. **根 DOM 可识别**  
   - 组件最终应对 **单个根 DOM 元素** 渲染主可视内容（与常见 React 组件一致）。  
   - 根节点应能接收并落到 DOM 上的 props：`data-schema-id`（值等于 `ISchema.id`），以便自动化与调试与规格 SC-001 走查一致。

2. **`forwardRef`（强烈推荐）**  
   - 物料应对 **外层 DOM 根** 使用 `React.forwardRef`，使编辑器能将 `ref` 指向该根，用于 `ResizeObserver` 与坐标测量。  
   - 若物料为函数组件且未 forwardRef，编辑器可能启用 **单层兜底宿主**（见实现计划），该情况应在物料 README 或发布说明中标注为「非最佳」。

## 禁止

- **不得** 依赖编辑器在组件外再包两层 `div` 才能正常选中（本特性完成后由画布侧保证）。

## 验证

- 在编辑器中插入该物料叶节点，开发者工具中可见根节点带 `data-schema-id`。  
- 选中后 `SelectionBox` 外沿与组件主可视区域对齐（规格 SC-002）。

## 版本与兼容

- 本契约为 **编辑器行为合同**；不随 `@orangehome/web_builder` semver 自动版本化，变更应在 PR 说明与物料迁移指南中注明。
