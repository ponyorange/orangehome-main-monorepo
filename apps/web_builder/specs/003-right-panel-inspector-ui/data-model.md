# Data Model: 003-right-panel-inspector-ui

本特性**不引入**新的持久化实体；以下为 **UI 与状态视图** 用的逻辑模型，便于实现与测试对齐。

## 1. InspectorContext（派生自现有 store）

| 字段 | 类型（概念） | 来源 | 说明 |
|------|----------------|------|------|
| `selectedId` | string \| null | `selectionStore` + `schemaStore` | 与当前 `PropertiesPanel` 一致：单选、根回退规则不变 |
| `selectedNode` | ISchema \| null | `findById(schema, selectedId)` | 无合法选中时为 null，驱动空态 |
| `isRoot` | boolean | `selectedId === schema.id` | 影响标题文案（如「根容器」） |
| `headerTitle` | string | `isRoot ? '根容器' : selectedNode.name` | 与现逻辑一致 |
| `typeLabel` | string | `selectedNode.type` | 用于徽章/副标题 |
| `materialEditorProps` | 配置项列表 \| undefined | `materialBundleStore` | 与现 `EditorConfigPropsForm` 一致 |

## 2. InspectorTab

| 值 | 用户可见文案 | 内容 |
|----|----------------|------|
| `config` | 配置 | 属性配置 + 样式配置（垂直堆叠分组） |
| `info` | 信息 | ID、Type 徽章、只读 Schema 预览；（可选）编辑 Schema 入口 |

默认 `activeTab = 'config'`。

## 3. ConfigSection（配置分区内分组）

| `sectionId` | 展示标题 | 内容组件 |
|-------------|----------|----------|
| `props` | 属性配置 | `PropertyForm` / `EditorConfigPropsForm` / `Empty` |
| `style` | 样式配置 | `StyleForm` |

规则：

- 若某分组无任何可渲染字段，显示「不适用」或隐藏该分组（与规格 Edge Cases 一致）。
- 不改变 `onUpdateProps` / `onUpdateStyle` 的语义。

## 4. InfoSnapshot（信息分区只读视图）

| 字段 | 说明 |
|------|------|
| `nodeId` | `selectedNode.id` |
| `typeId` | `selectedNode.type`（徽章文案） |
| `schemaPreviewText` | `JSON.stringify(selectedNode, null, 2)` 或与现 `schemaText` 同步逻辑一致 |

编辑 Schema Modal 打开时，`schemaText` / `schemaError` 状态与当前 `PropertiesPanel` 中 Monaco 流保持一致；关闭 Modal 后刷新 `schemaPreviewText`。

## 5. 校验与不变量

- **INV-001**: 任意 `setSchema` 路径仍只来自 `schemaOperator` / 现有 `handleSchemaChange`，不新增平行写入口。
- **INV-002**: `selectedNode` 与 `schemaPreviewText` 在同一渲染周期内指向同一节点 id。
- **INV-003**: Tab 切换不触发 schema 写入。
