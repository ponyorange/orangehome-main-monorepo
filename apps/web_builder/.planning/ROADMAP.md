# ROADMAP.md

## 里程碑 1: v1.0 MVP - 插槽化编辑器核心（含竖向Tab左侧栏）

> 目标：一个基于插槽化架构的可视化编辑器，支持竖向Tab左侧栏，所有 UI 通过插槽扩展

| 阶段 | 描述 | 状态 | 关联需求 | 预估工期 |
|-----|------|------|---------|---------|
| 1 | **项目初始化** | ⏳ 待开始 | R1 | 2天 |
| 2 | **插槽化架构基础** | ⏳ 待开始 | R2, R9 | 2天 |
| 3 | **Schema 系统** | ⏳ 待开始 | R3 | 2天 |
| 4 | **画布与渲染** | ⏳ 待开始 | R4, R12 | 3天 |
| 5 | **选择与拖拽** | ⏳ 待开始 | R5 | 3天 |
| 6 | **组件操作** | ⏳ 待开始 | R6, R7, R10 | 3天 |
| 7 | **属性面板** | ⏳ 待开始 | R8 | 2天 |
| 8 | **图层管理** | ⏳ 待开始 | R11 | 2天 |
| 9 | **撤销重做** | ⏳ 待开始 | R13 | 2天 |
| 10 | **预览导出** | ⏳ 待开始 | R14 | 2天 |

**里程碑交付物**:
- ✅ 基于插槽化架构的编辑器
- ✅ **竖向Tab左侧栏**（组件/图层通过 tab 切换）
- ✅ Tab 可扩展（通过 left-panel:tabs 插槽）
- ✅ 功能独立为 Extension
- ✅ 基础组件拖拽搭建

---

## 架构说明

### 插槽系统 (Slot System)

编辑器 UI 完全通过插槽构建：

```
header
├── header:left          # Logo 扩展注册
├── header:center        # Toolbar 扩展注册
└── header:right         # Actions 扩展注册

left-panel               # 左侧面板容器
├── left-panel:tabs      # ⭐ 竖向tab区域（可扩展）
│   ├── component-tab    # ComponentTab 扩展注册
│   └── layer-tab        # LayerTab 扩展注册
├── left-panel:content   # 主内容区（显示当前选中tab的内容）
└── left-panel:bottom    # 底部操作

center
├── center:ruler:top
├── center:ruler:left
└── center:canvas

right-panel
├── right-panel:content  # PropertiesPanel 扩展注册
└── right-panel:bottom

float
├── float:modal
└── float:context-menu
```

### 竖向Tab左侧栏设计

```
LeftPanel（左侧面板）
┌───────────────────────────────────┐
│ Tabs │     Content Area           │
│ 竖向  │                            │
├──────┤                            │
│ [⚙️] │   ┌─────────────────────┐  │
│ 组件  │   │                     │  │
│      │   │  ComponentPanel     │  │
├──────┤   │  (搜索框、分类Tabs)  │  │
│ [📐] │   │                     │  │
│ 图层  │   └─────────────────────┘  │
│      │                            │
└──────┴────────────────────────────┘
 48px  │       自适应宽度            │
```

**Tab 扩展方式**：

```typescript
class ComponentTabExtension implements IExtension {
  init(context: IExtensionContext) {
    // 1. 注册 tab 按钮
    context.registerSlot('left-panel:tabs', {
      id: 'component-tab',
      component: TabButton,
      config: { tabId: 'component', title: '组件', icon: IconComponent },
    });
    
    // 2. 监听 tab 激活，注册内容
    context.on('left-panel:tab:activate', (tabId) => {
      if (tabId === 'component') {
        context.registerSlot('left-panel:content', {
          id: 'component-panel-content',
          component: ComponentPanel,
        });
      }
    });
  }
}
```

### Extension 系统

所有功能都是独立的 Extension：

| 扩展 | 类型 | 注册位置 |
|-----|------|---------|
| header | UI容器 | - |
| left-panel | UI容器 | 定义 left-panel:tabs 插槽 |
| logo | 功能 | header:left |
| toolbar | 功能 | header:center |
| **component-tab** | **功能** | **left-panel:tabs** |
| **layer-tab** | **功能** | **left-panel:tabs** |
| properties-panel | 功能 | right-panel:content |

---

## 阶段详细规划

### 阶段 1: 项目初始化
- `1-1`: Rush monorepo + Vite + React + TS 项目初始化
- `1-2`: Inversify 依赖注入配置
- `1-3`: 插槽化架构基础（SlotRegistry, ExtensionLoader, EventBus）

### 阶段 2: 插槽化架构（含竖向Tab）
- `2-1`: EditorView + **竖向Tab LeftPanel** + 基础 UI 布局
- `2-2`: 功能扩展注册（**ComponentTab, LayerTab** 往 left-panel:tabs 注册）

### 阶段 3-10: 功能实现
- 阶段 3: Schema 系统
- 阶段 4: 画布与渲染
- 阶段 5: 选择与拖拽
- 阶段 6: 组件操作
- 阶段 7: 属性面板
- 阶段 8: 图层管理
- 阶段 9: 撤销重做
- 阶段 10: 预览导出

---

## 图例

| 符号 | 含义 |
|-----|------|
| ⏳ | 待开始 |
| 🔄 | 进行中 |
| ✅ | 已完成 |
| ⏸️ | 暂停 |
| 🐛 | 有阻塞问题 |

---

## 当前位置

**当前里程碑**: 里程碑 1: v1.0 MVP

**当前阶段**: 阶段 1 - 项目初始化

**下一步**: 执行 1-1 PLAN

---

*最后更新: 2026-03-12*
*竖向Tab左侧栏版本*
