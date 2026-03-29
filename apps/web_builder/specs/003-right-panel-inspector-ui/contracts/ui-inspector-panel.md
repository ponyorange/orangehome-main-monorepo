# UI Contract: 右侧 Inspector 面板（003）

**Version**: 1.0  
**Reference**: `refer_ui/component-inspector-panel1.0.html`  
**Consumer**: `PropertiesPanel` 及子组件（`apps/web_builder`）

## 1. 区域树（DOM 语义）

```
aside（现有右栏容器，不变更责任边界）
└─ InspectorRoot [aria-label="组件配置"]
   ├─ InspectorHeader（固定高度，不随下方滚动）
   │  ├─ 左侧竖条装饰（视觉锚点）
   │  ├─ Title（h1 级别视觉，组件显示名）
   │  └─ Subtitle（一句说明，可静态文案或含 type）
   ├─ InspectorSegmented（role="tablist", aria-label="面板分区"）
   │  ├─ Tab「配置」→ controls panel-config
   │  └─ Tab「信息」→ controls panel-info
   └─ InspectorBody（overflow-y: auto；唯一主滚动区）
      ├─ TabPanel「配置」
      │  ├─ Section「属性配置」
      │  └─ Section「样式配置」
      └─ TabPanel「信息」
         ├─ Row: 组件 ID
         ├─ Row: 组件 Type（徽章）
         ├─ Block: 组件 Schema（只读 pre / code）
         └─ [Optional] Action: 打开 Schema 编辑 Modal
```

## 2. 交互契约

| ID | 规则 |
|----|------|
| IC-01 | 点击「配置」/「信息」仅切换 `tabpanel` 可见性，不丢失未提交的 Modal 内编辑（若 Modal 打开则保持）。 |
| IC-02 | 选中变化时：`activeTab` 保持用户当前 Tab，但**内容**必须立即刷新为新节点数据。 |
| IC-03 | `selectedNode === null`：显示全屏空态，不展示分段（或展示禁用态分段，产品择一；默认与现行为一致：简单空态）。 |
| IC-04 | 配置区内所有变更必须通过既有 `onUpdateProps` / `onUpdateStyle` / Schema Modal 回调，不新增 store API。 |

## 3. 视觉契约（验收对照参考 HTML）

| 元素 | 必须满足 |
|------|----------|
| 外框 | 圆角面板、细边框、柔和外阴影（与编辑器右栏内卡片协调即可） |
| Header | 渐变底 + 左侧竖向强调色条 |
| 分段 | 胶囊轨道、选中项白底+浅阴影、未选中透明底 |
| Section 标题 | 小字号、大写或宽字距、左侧短竖条装饰 |
| 表单项 | 双列栅格：标签右对齐 ≈88px 量级，控件列自适应 |
| 颜色 | 色块 28×28 量级 + 文本输入同一行 |
| 滚动条 | 细轨道、拇指与主题色协调（可用 webkit 伪元素） |

## 4. 与包导出

本合约为**内部** UI 契约；不要求写入 `package.json` exports。若未来将 `PropertiesPanel` 作为公共 API 导出，需同步主版本策略（constitution V）。
