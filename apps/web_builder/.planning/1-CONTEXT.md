# 1-CONTEXT.md

## 阶段 1: 项目初始化（Rush Monorepo + 竖向Tab左侧栏）

### 目标
在 Rush 管理的 monorepo 中初始化 Orange Editor 项目，目录位于 `apps/web_builder`，采用**竖向Tab左侧栏**设计，包括：
- Rush + pnpm 环境配置
- **插槽化架构**（SlotRegistry, ExtensionLoader, EventBus）
- **竖向Tab左侧栏设计** - left-panel:tabs 可扩展插槽
- 目录结构初始化、基础类型定义、构建配置

### 项目位置

```
monorepo-root/
├── rush.json
├── apps/
│   └── web_builder/          # ⭐ Orange Editor 项目
│       ├── package.json
│       └── src/
└── ...
```

### 目录结构（apps/web_builder/src/）

```
apps/web_builder/
├── src/
│   ├── core/                 # 编辑器核心（轻内核）
│   │   ├── editor.ts
│   │   ├── container/
│   │   ├── slots/           # 插槽系统
│   │   ├── extensions/      # 扩展系统
│   │   ├── events/
│   │   └── types/
│   │
│   ├── extensions/
│   │   ├── core/            # 核心扩展
│   │   ├── ui/              # UI 扩展
│   │   │   ├── header/
│   │   │   ├── left-panel/  # ⭐ 左侧栏（含竖向tab）
│   │   │   ├── right-panel/
│   │   │   └── center-canvas/
│   │   ├── features/        # 功能扩展
│   │   │   ├── component-tab/   # ⭐ 组件面板（作为tab注册）
│   │   │   ├── layer-tab/       # ⭐ 图层树（作为tab注册）
│   │   │   ├── properties-panel/
│   │   │   ├── toolbar/
│   │   │   └── ...
│   │   └── editing/         # 编辑功能扩展
│   │
│   └── ...
```

### 核心插槽定义（含竖向Tab左侧栏）

```
header
├── header:left
├── header:center
└── header:right

left-panel                    # 左侧面板容器
├── left-panel:tabs          # ⭐ 竖向tab区域（可扩展）
│   └── tabs 通过插槽注册：
│       - id: "component", title: "组件", icon: "Component"
│       - id: "layer", title: "图层", icon: "Layers"
├── left-panel:content       # 主内容区（显示当前选中tab的内容）
└── left-panel:bottom        # 底部操作区

center
├── center:ruler:top
├── center:ruler:left
└── center:canvas

right-panel
├── right-panel:content
└── right-panel:bottom

float
├── float:modal
└── float:context-menu
```

### 竖向Tab左侧栏设计

**UI 结构**：
```
┌────────────────────────────────────────┐
│  LeftPanel（左侧面板）                  │
│  ┌────────┬────────────────────────┐  │
│  │ Tabs   │     Content            │  │
│  │竖向    │     （动态内容）        │  │
│  ├────────┤                        │  │
│  │ [🔧]   │  ┌──────────────────┐  │  │
│  │ 组件   │  │ ComponentPanel   │  │  │
│  │        │  │                  │  │  │
│  ├────────┤  │ 组件列表...       │  │  │
│  │ [📐]   │  │                  │  │  │
│  │ 图层   │  └──────────────────┘  │  │
│  │        │                        │  │
│  ├────────┼────────────────────────┤  │
│  │ 可扩展 │     Bottom Area        │  │
│  └────────┴────────────────────────┘  │
└────────────────────────────────────────┘
```

**Tab 插槽注册方式**：

```typescript
// ComponentTabExtension 注册"组件"tab
class ComponentTabExtension implements IExtension {
  init(context: IExtensionContext) {
    // 1. 注册 tab 到 left-panel:tabs
    context.registerSlot('left-panel:tabs', {
      id: 'component-tab',
      component: TabItem,  // 渲染 tab 按钮
      config: {
        tabId: 'component',
        title: '组件',
        icon: 'IconComponent',
        order: 10,
      },
    });
    
    // 2. 注册内容到 left-panel:tab:content（通过激活时动态注册）
    // 或者使用事件监听 tab 切换
  }
}

// LayerTabExtension 注册"图层"tab
class LayerTabExtension implements IExtension {
  init(context: IExtensionContext) {
    context.registerSlot('left-panel:tabs', {
      id: 'layer-tab',
      component: TabItem,
      config: {
        tabId: 'layer',
        title: '图层',
        icon: 'IconLayers',
        order: 20,
      },
    });
  }
}
```

**LeftPanel 内部状态管理**：
- 当前激活的 tab id（存储在 store 中）
- Tab 切换时显示对应内容
- 每个 tab 的内容可以是一个子插槽，或者动态渲染

**改进的插槽设计**：

```typescript
// LeftPanel 内部插槽
left-panel
├── left-panel:tabs          # Tab 按钮列表（竖向）
├── left-panel:tab-content   # Tab 内容容器
│   └── 内部根据 activeTab 渲染：
│       - component-tab-content
│       - layer-tab-content
└── left-panel:bottom

// 或者每个 tab 有自己的内容插槽
left-panel
├── left-panel:tabs
├── left-panel:tab:component:content   # 组件面板内容
├── left-panel:tab:layer:content       # 图层树内容
└── left-panel:bottom
```

### 技术选型

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| Inversify | 6.0.1 | 依赖注入 |
| Zustand | 4.x | 状态管理（含当前激活 tab）|
| Semi Design | 2.40+ | UI 组件库 |
| Modern.js | 2.40+ | 构建工具 |
| Vite | 5.x | 开发服务器 |

### 状态设计（Store）

```typescript
interface EditorState {
  // ... 其他状态
  
  // 左侧面板状态
  leftPanel: {
    activeTab: string;        // 当前激活的 tab id，如 'component' | 'layer'
    collapsed: boolean;       // 是否收起
    width: number;           // 面板宽度
  };
  
  // 注册的 tabs
  tabs: {
    [tabId: string]: {
      id: string;
      title: string;
      icon: string;
      order: number;
      content?: React.ComponentType;
    };
  };
}
```

### Rush + pnpm 配置

（同上，略...）

### 约束条件

1. **TypeScript 严格模式** - `strict: true`
2. **ES2022 目标**
3. **CSS 注入**
4. **Tree Shaking**
5. **Tab 可扩展** - 新功能可以通过插槽添加 tab

### 假设

1. Rush monorepo 已初始化
2. pnpm 是包管理器
3. 竖向 tab 宽度约 48px
4. 默认激活"组件"tab

---

## 阶段产出

- ✅ Rush monorepo 中可运行的项目
- ✅ **竖向Tab左侧栏**架构
- ✅ Tab 可扩展（通过 left-panel:tabs 插槽）
- ✅ SlotRegistry 基础实现
- ✅ ExtensionLoader 基础实现
- ✅ EventBus 基础实现

---

*由 GSD 生成 - Rush Monorepo + 竖向Tab版本*
