# ARCHITECTURE.md

## Orange Editor 架构设计（插槽化版本）

### 核心原则

1. **轻内核** - Core 只提供基础设施，不实现具体功能
2. **插槽化 UI** - 所有 UI 区域通过插槽注册，可替换、可扩展
3. **Extension 驱动** - 每个功能都是独立的 Extension
4. **嵌套扩展** - UI 模块内部也有插槽，支持二次扩展

---

## 架构层次

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer (Slots)                          │
│  ┌─────────┬─────────────────────────────┬─────────────┐        │
│  │ Header  │                             │   Header    │        │
│  │  Slot   │         Center Slot         │    Slot     │        │
│  │(Left)   │       (Canvas Area)         │   (Right)   │        │
│  ├─────────┤                             ├─────────────┤        │
│  │         │                             │             │        │
│  │ Left    │                             │   Right     │        │
│  │ Panel   │                             │   Panel     │        │
│  │ Slot    │                             │   Slot      │        │
│  │ ┌─────┐ │                             │             │        │
│  │ │Tabs │ │                             │             │        │
│  │ │ ⭐  │ │                             │             │        │
│  │ │竖向 │ │                             │             │        │
│  │ └─────┘ │                             │             │        │
│  ├─────────┴─────────────────────────────┴─────────────┤        │
│  │                    Float Panel Slot                  │        │
│  │              (Modal, Tooltip, ContextMenu)           │        │
│  └──────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Slot Registry (Core)                          │
│  - 管理所有 UI 插槽注册                                          │
│  - 处理插槽渲染顺序和依赖                                        │
│  - 支持插槽嵌套 (Slot within Slot)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Extension System                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Header    │ │ Component   │ │ Properties  │ │   Layer   │ │
│  │  Extension  │ │   Tab       │ │   Panel     │ │   Tab     │ │
│  │             │ │  Extension  │ │  Extension  │ │ Extension │ │
│  │ - Logo      │ │             │ │             │ │           │ │
│  │ - Toolbar   │ │ - Tab       │ │ - Property  │ │ - Tab     │ │
│  │ - Actions   │ │   Button    │ │   Form      │ │ - Tree    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Canvas    │ │   Select    │ │    Move     │ │   Undo    │ │
│  │  Extension  │ │  & Drag     │ │  & Resize   │ │   Redo    │ │
│  │             │ │  Extension  │ │  Extension  │ │ Extension │ │
│  │ - Canvas    │ │             │ │             │ │           │ │
│  │ - Ruler     │ │ - Hover     │ │ - Move      │ │ - History │ │
│  │ - Grid      │ │ - Select    │ │ - Resize    │ │ - Undo    │ │
│  │ - Renderer  │ │ - Drag      │ │ - Align     │ │ - Redo    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Core (轻内核)                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Editor    │ │    Slot     │ │  Extension  │ │   Event   │ │
│  │   (主类)    │ │  Registry   │ │   Loader    │ │   Bus     │ │
│  │             │ │             │ │             │ │           │ │
│  │ - 生命周期  │ │ - 注册插槽  │ │ - 加载扩展  │ │ - 发布    │ │
│  │ - 配置管理  │ │ - 渲染插槽  │ │ - 管理依赖  │ │ - 订阅    │ │
│  │ - 容器管理  │ │ - 嵌套插槽  │ │ - 生命周期  │ │ - 广播    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 插槽系统 (Slot System)

### 核心插槽定义

```typescript
// 核心插槽 - 由 Core 定义
enum CoreSlots {
  HEADER = 'header',           // 顶部栏
  HEADER_LEFT = 'header:left', // 顶部栏左侧
  HEADER_CENTER = 'header:center', // 顶部栏中间
  HEADER_RIGHT = 'header:right',   // 顶部栏右侧
  
  LEFT_PANEL = 'left-panel',   // 左侧面板（含竖向tab）
  LEFT_PANEL_TABS = 'left-panel:tabs',     // ⭐ 竖向tabs区域
  LEFT_PANEL_CONTENT = 'left-panel:content', // 主内容区
  LEFT_PANEL_BOTTOM = 'left-panel:bottom',   // 底部操作区
  
  CENTER = 'center',           // 中间区域
  CENTER_CANVAS = 'center:canvas',   // 画布
  CENTER_RULER_TOP = 'center:ruler:top',   // 顶部标尺
  CENTER_RULER_LEFT = 'center:ruler:left', // 左侧标尺
  
  RIGHT_PANEL = 'right-panel', // 右侧面板
  RIGHT_PANEL_TOP = 'right-panel:top',
  RIGHT_PANEL_CONTENT = 'right-panel:content',
  RIGHT_PANEL_BOTTOM = 'right-panel:bottom',
  
  FLOAT = 'float',             // 浮动层
  FLOAT_MODAL = 'float:modal', // 弹窗
  FLOAT_CONTEXT_MENU = 'float:context-menu', // 右键菜单
  FLOAT_TOOLTIP = 'float:tooltip', // 提示
}
```

### 插槽注册 API

```typescript
// Extension 注册插槽内容
class MyExtension implements Extension {
  init(context: ExtensionContext) {
    // 注册到主插槽
    context.registerSlot(CoreSlots.LEFT_PANEL_CONTENT, {
      id: 'layer-tree',
      component: LayerTreeComponent,
      order: 10,  // 排序
      weight: 1,  // 权重（flex 比例）
    });
    
    // 注册到子插槽
    context.registerSlot(CoreSlots.HEADER_LEFT, {
      id: 'logo',
      component: LogoComponent,
      order: 1,
    });
  }
}
```

### 插槽嵌套

```typescript
// 一个 Extension 可以定义自己的插槽
class ComponentPanelExtension implements Extension {
  init(context: ExtensionContext) {
    // 定义子插槽
    context.defineSlot('component-panel:search');
    context.defineSlot('component-panel:categories');
    context.defineSlot('component-panel:list');
    
    // 注册到左侧面板
    context.registerSlot(CoreSlots.LEFT_PANEL_CONTENT, {
      id: 'component-panel',
      component: ComponentPanel,  // 这个组件内部使用上述子插槽
      order: 5,
    });
  }
}

// 其他 Extension 可以往子插槽注册
class CustomComponentExtension implements Extension {
  init(context: ExtensionContext) {
    context.registerSlot('component-panel:list', {
      id: 'my-custom-components',
      component: MyComponentList,
      order: 100,
    });
  }
}
```

---

## Extension 体系

### Extension 分类

| 类型 | 说明 | 示例 |
|-----|------|------|
| **UI Extension** | 提供 UI 组件 | HeaderExtension, ComponentPanelExtension |
| **Feature Extension** | 提供功能逻辑 | SelectExtension, MoveExtension |
| **Service Extension** | 提供服务 | StoreExtension, HistoryExtension |
| **Integration Extension** | 集成第三方 | RemoteComponentExtension |

### Extension 生命周期

```typescript
interface Extension {
  // 扩展信息
  readonly id: string;
  readonly name: string;
  readonly version: string;
  
  // 依赖的其他扩展
  readonly dependencies?: string[];
  
  // 初始化 - 注册插槽、服务
  init(context: ExtensionContext): void | Promise<void>;
  
  // 激活 - 编辑器挂载后
  activate?(context: ExtensionContext): void | Promise<void>;
  
  // 停用 - 编辑器卸载前
  deactivate?(context: ExtensionContext): void | Promise<void>;
  
  // 销毁
  dispose?(): void;
}
```

### ExtensionContext API

```typescript
interface ExtensionContext {
  // 插槽操作
  defineSlot(name: string): void;
  registerSlot(slotName: string, content: SlotContent): void;
  unregisterSlot(slotName: string, contentId: string): void;
  getSlotContents(slotName: string): SlotContent[];
  
  // 服务操作
  registerService<T>(id: string, service: T): void;
  getService<T>(id: string): T;
  
  // 事件操作
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
  
  // 配置
  getConfig<T>(key: string): T;
  setConfig(key: string, value: any): void;
  
  // 编辑器实例
  editor: OrangeEditor;
}
```

---

## 内置 Extension 列表

### 必需 Extension（Core 依赖）

| Extension | 职责 | 提供插槽 |
|-----------|------|---------|
| `slot-registry` | 插槽系统核心 | - |
| `event-bus` | 事件总线 | - |
| `store` | 状态管理 | - |

### UI Extension

| Extension | 注册插槽 | 内部插槽 |
|-----------|---------|---------|
| `header` | `header:left`, `header:center`, `header:right` | - |
| `left-panel` | `left-panel` | `left-panel:top`, `left-panel:content`, `left-panel:bottom` |
| `right-panel` | `right-panel` | `right-panel:top`, `right-panel:content`, `right-panel:bottom` |
| `center-canvas` | `center` | `center:ruler:top`, `center:ruler:left`, `center:canvas` |
| `float-layer` | `float` | `float:modal`, `float:context-menu`, `float:tooltip` |

### 功能 Extension

| Extension | 注册插槽 | 功能 |
|-----------|---------|------|
| `component-tab` | `left-panel:tabs` | **组件面板 tab** |
| `layer-tab` | `left-panel:tabs` | **图层树 tab** |
| `properties-panel` | `right-panel:content` | 属性面板 |
| `toolbar` | `header:center` | 工具栏 |
| `logo` | `header:left` | Logo |
| `actions` | `header:right` | 操作按钮 |

### 核心功能 Extension

| Extension | 职责 |
|-----------|------|
| `canvas` | 画布渲染、缩放 |
| `ruler` | 标尺显示 |
| `select` | 组件选择 |
| `drag` | 组件拖拽 |
| `move` | 组件移动 |
| `resize` | 调整大小 |
| `history` | 撤销重做 |
| `schema-renderer` | Schema 渲染 |
| `keyboard` | 快捷键 |

---

## 使用示例

### 自定义 Header

```typescript
class CustomHeaderExtension implements Extension {
  id = 'custom-header';
  name = 'Custom Header';
  version = '1.0.0';
  
  init(context: ExtensionContext) {
    // 覆盖默认 header
    context.registerSlot(CoreSlots.HEADER, {
      id: 'custom-header',
      component: MyCustomHeader,
      order: 1,
      replace: 'header', // 替换默认 header
    });
  }
}
```

### 添加新的左侧 Tab

```typescript
class CustomTabExtension implements Extension {
  dependencies = ['left-panel']; // 依赖 left-panel 容器
  
  init(context: ExtensionContext) {
    // 1. 注册 tab 按钮到 left-panel:tabs
    context.registerSlot('left-panel:tabs', {
      id: 'custom-tab',
      component: TabButton,
      order: 30,
      config: {
        tabId: 'custom',
        title: '自定义',
        icon: 'custom-icon',
      }
    });
    
    // 2. 监听 tab 切换，动态注册内容
    context.on('left-panel:tab:change', (tabId: string) => {
      if (tabId === 'custom') {
        context.registerSlot('left-panel:content', {
          id: 'custom-content',
          component: CustomPanelContent,
        });
      }
    });
  }
}
```

### 扩展现有 Extension

```typescript
// 扩展 ComponentPanel，添加自定义分类
class ExtendComponentPanelExtension implements Extension {
  dependencies = ['component-panel']; // 依赖基础扩展
  
  init(context: ExtensionContext) {
    // 往 component-panel 的子插槽添加内容
    context.registerSlot('component-panel:categories', {
      id: 'my-category',
      component: MyCategoryComponent,
      order: 50,
    });
  }
}
```

---

## 扩展加载顺序

```typescript
const EXTENSION_LOAD_ORDER = [
  // 1. 基础设施
  'slot-registry',
  'event-bus',
  'store',
  
  // 2. UI 框架（容器）
  'header',
  'left-panel',    // 定义 left-panel:tabs 插槽
  'right-panel',
  'center-canvas',
  'float-layer',
  
  // 3. Header 功能
  'logo',
  'toolbar',
  'actions',
  
  // 4. ⭐ 左侧栏 Tabs（依赖 left-panel）
  'component-tab',  // 注册到 left-panel:tabs
  'layer-tab',      // 注册到 left-panel:tabs
  
  // 5. 右侧面板
  'properties-panel',
  
  // 6. 核心编辑功能
  'canvas',
  'ruler',
  'schema-renderer',
  'select',
  'drag',
  'move',
  'resize',
  'history',
  'keyboard',
  
  // 7. 用户自定义
  ...userExtensions,
];
```

---

## 总结

这个架构的核心优势：

1. **极轻内核** - Core 只提供插槽、事件、扩展加载
2. **完全可替换** - 任何 UI 都可以被替换，不强制默认实现
3. **渐进增强** - 按需加载 Extension，不需要的功能可以不加载
4. **二次扩展** - Extension 可以定义自己的插槽，支持无限嵌套
5. **生态友好** - 第三方可以发布自己的 Extension，无缝集成

---

*架构设计文档 - v1.0*
