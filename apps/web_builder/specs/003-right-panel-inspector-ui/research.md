# Research: 003-right-panel-inspector-ui

## R1 — 信息分区中 Schema 的可编辑性

- **Decision**: 「信息」分区主区域展示**只读**、可滚动的格式化 JSON（`<pre>` 或只读 Monaco）。原「Schema」Tab 中的**可编辑**能力以**次要入口**保留：例如「信息」区底部按钮「编辑 Schema」打开 `Modal` 内嵌现有 `MonacoSchemaEditor`，行为与当前 `handleSchemaChange` 一致。
- **Rationale**: 规格 FR-004 强调「预览」与只读标识区；完全移除编辑会破坏高级用户与现有验收习惯；Modal 隔离编辑与预览，IA 仍与参考稿「配置 / 信息」一致。
- **Alternatives considered**:
  - 仅在「信息」放可编辑 Monaco：与「预览」语义冲突，且长文本挤占 ID/Type 区。
  - 完全删除可编辑：零实现成本但回滚成本高、违背「不引入第二套真相」下的操作连续性。

## R2 — 顶部分段控件实现方式

- **Decision**: 使用自定义「胶囊轨道 + 两枚 `button`/`div role=tab`」实现参考稿分段外观；必要时用 Semi `Button` `theme="borderless"` 组合，**不**使用 Semi `Tabs` 的 line/card 形态作为主分段，以便像素级对齐 `refer_ui/component-inspector-panel1.0.html`。
- **Rationale**: 参考稿为强视觉分段；现有 `PropertiesPanel` 使用 `Tabs`+`TabPane`，与参考稿 segmented 不一致。
- **Alternatives considered**:
  - 继续 Semi `Tabs` + 深度样式覆盖：维护成本高、升级易碎。
  - 第三方 segmented：增加依赖，违背 constitution 默认栈。

## R3 — 表单布局与现有 PropertyForm / StyleForm

- **Decision**: **保留** `PropertyForm`、`StyleForm`、`EditorConfigPropsForm` 的数据与回调契约；新增轻量**布局壳**（如 `InspectorFormGrid`、`InspectorSection`）包裹每组字段：两列栅格（标签列固定宽度右对齐、控件列 `min-width: 0`），颜色字段统一走「色块 + 文本」行组件。
- **Rationale**: 规格要求呈现层对齐参考稿，但 FR-005 要求不改写数据通路；内联改造子表单项比重写绑定更安全。
- **Alternatives considered**:
  - 重写全部表单项：范围过大、易引入回归。
  - 仅外层换皮、内层仍为纵向表单：无法满足 FR-003 栅格与颜色行。

## R4 — 右栏宽度与 `RightPanel` 容器

- **Decision**: 面板目标宽度仍以 `EditorView` 右侧 `aside`（约 300px）为准；Inspector **内部**最大内容宽参考 350px 气质（内边距、圆角、阴影在 `PropertiesPanel` 根节点或内层 card 实现），若需与 FR-001 完全一致，在实现任务中评估是否调整 `EditorView` 右侧 `aside` 宽度（单独 task，避免本计划越权改全局布局而未评审）。
- **Rationale**: 规格允许「约 350px、可微调」；当前布局为 300px。
- **Alternatives considered**:
  - 强行 350px：需改 `EditorView`，触发横向排版回归测试。

## R5 — 主题变量与参考稿橙色系

- **Decision**: 新样式优先映射到现有 `var(--theme-*)`（`themeStore`）；参考稿专有橙渐变仅在 Inspector 局部用额外 CSS 变量（如 `--inspector-accent`）定义，并在四款主题下各给出**语义等价**色，避免硬编码单主题。
- **Rationale**: 规格 Edge Cases 已说明暗色主题为语义映射。
- **Alternatives considered**:
  - 全局换橙：超出本特性范围。

## R6 — 可访问性

- **Decision**: 顶部分段使用 `role="tablist"` / `role="tab"` / `role="tabpanel"` 与 `aria-selected`、`aria-controls`、`id` 关联；表单 `label` `htmlFor` 与现有控件 id 对齐或在壳层用 `aria-labelledby` 指向分组标题。
- **Rationale**: 满足 FR-007 与 User Story 3。
