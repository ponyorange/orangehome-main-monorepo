# Implementation Plan: 右侧配置面板（Inspector 参考稿）

**Branch**: `003-right-panel-inspector-ui` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-right-panel-inspector-ui/spec.md`

## Summary

将编辑器右侧 **属性/样式/Schema** 三 Tab 重构为参考稿 **「配置」|「信息」** 二段式：「配置」内垂直分组 **属性配置** + **样式配置**；「信息」内展示 **ID、Type 徽章、只读 Schema 预览**，并将原 Tab 内 **可编辑 Schema** 降级为次要入口（如 Modal）。**数据通路不变**（`schemaStore`、`schemaOperator`、`PropertyForm` / `StyleForm` / `MonacoSchemaEditor` 逻辑复用），**插槽不变**（`PropertiesPanelExtension` → `right-panel:content`）。视觉与 IA 以 `refer_ui/component-inspector-panel1.0.html` 为验收基准，主题映射到现有 `var(--theme-*)` + Inspector 局部变量。

## Technical Context

**Language/Version**: TypeScript 5.x、React 18  
**Primary Dependencies**: `@douyinfe/semi-ui`、Zustand、`inversify`（现有栈）  
**Storage**: N/A（文档状态仍在 `schemaStore` / `ISchema`）  
**Testing**: Vitest（`rushx test`）；本特性以手工对照参考 HTML + 回归撤销/选中等为主，按需补组件级测试  
**Target Platform**: 现代浏览器中的编辑器 SPA / 嵌入 `web_builder` 的消费方  
**Project Type**: Rush monorepo 包 `@orangehome/web_builder`（库 + Vite 本地应用）  
**Performance Goals**: 面板内 Tab 切换与滚动主观流畅；大 JSON 预览避免主线程长阻塞（必要时 `useMemo` 格式化）  
**Constraints**: 不新增文档第二真相；不绕过 `schemaOperator`；不新增未注册扩展的顶层面板挂载  
**Scale/Scope**: 单面板重构；约 1 个主文件（`PropertiesPanel`）+ 若干展示子组件 + 可选 `*.module.css` / CSS 变量

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| Extensions + SlotRegistry | ✅ | 继续仅通过 `PropertiesPanelExtension` 注册 `right-panel:content` |
| Schema 真相 | ✅ | `setSchema` / `updateProps` / `updateInlineStyle` / `normalizeSchemaNode` 路径保留 |
| DI | ✅ | 不新增全局单例服务 |
| State / API | ✅ | 仍用 `selectionStore`、`schemaStore`、`materialBundleStore`；无新 BFF 需求 |
| Public API | ✅ | 不修改 `package.json` exports；`PropertiesPanel` 保持内部扩展组件 |
| Quality | ✅ | 合并前 `rushx type-check`、`rushx lint`；有测试则 `rushx test` |

**Post-Phase-1 re-check**: 设计仍满足上表；无 Complexity Tracking 项。

## Project Structure

### Documentation (this feature)

```text
specs/003-right-panel-inspector-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-inspector-panel.md
└── tasks.md                    # 由 /speckit.tasks 生成
```

### Source Code (`apps/web_builder`)

```text
src/extensions/features/properties-panel/
├── index.ts                          # 不变：registerSlot right-panel:content
├── components/
│   ├── PropertiesPanel.tsx           # 主改版：壳层 + 分段 + 配置/信息布局
│   ├── PropertyForm.tsx              # 外层包 Inspector 栅格壳（或内联 label 改造，择一）
│   ├── StyleForm.tsx
│   ├── EditorConfigPropsForm.tsx
│   ├── MonacoSchemaEditor.tsx        # 复用于 Modal
│   └── inspector/                    # 新建（建议）
│       ├── InspectorShell.tsx        # 外框、header、body 滚动
│       ├── InspectorSegmentedTabs.tsx
│       ├── InspectorSection.tsx
│       ├── InspectorFormGrid.tsx
│       └── inspector.module.css      # 可选：参考稿样式与 scrollbar
└── configs/                          # 既有
```

**Structure Decision**: 逻辑集中在 `properties-panel` 特性目录；不修改 `core/editor.ts` 扩展列表顺序；若调整右栏 `aside` 宽度，仅在 `EditorView.tsx` 单列 diff 并在 tasks 中单列任务说明。

## Phase 0: Research

**Output**: [research.md](./research.md)（已完成）

要点：信息区 Schema **只读** + Modal 保留编辑；自定义分段而非 Semi Tabs；表单保留绑定仅换壳；300px vs 350px 右栏宽度单独评估；主题语义映射；a11y `role=tablist`。

## Phase 1: Design & Contracts

**Outputs**:

- [data-model.md](./data-model.md) — InspectorTab、ConfigSection、InfoSnapshot、不变量  
- [contracts/ui-inspector-panel.md](./contracts/ui-inspector-panel.md) — 区域树、交互与视觉契约  
- [quickstart.md](./quickstart.md) — 本地运行与验收步骤  

**Agent context**: 运行 `update-agent-context.sh cursor-agent`（见下方命令）。

## Phase 2（预览，非本命令产出）

由 **`/speckit.tasks`** 生成 `tasks.md`，建议任务拆分顺序：

1. 新建 `inspector/*` 壳组件与样式变量（无业务逻辑）。  
2. 重构 `PropertiesPanel`：头部 + 分段 + 空态。  
3. 「配置」Tab：嵌入 `PropertyForm` / `EditorConfigPropsForm` + `StyleForm` + Section 标题与栅格。  
4. 「信息」Tab：ID/Type/只读 pre + Modal 编辑 Schema。  
5. a11y 与键盘走查、主题四款烟测。  
6. 可选：`EditorView` 右侧宽度 300→320/350 与布局回归。

## Complexity Tracking

> 无宪法违背项，本表留空。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
