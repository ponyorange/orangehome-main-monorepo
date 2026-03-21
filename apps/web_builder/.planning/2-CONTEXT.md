# 2-CONTEXT.md

## 阶段 2: 编辑器核心与插槽渲染（竖向Tab左侧栏）

### 目标
实现 OrangeEditor 核心类和插槽渲染系统，包含**竖向Tab左侧栏**设计：
- 单例模式管理
- 生命周期管理
- **核心插槽定义**（含 left-panel:tabs 竖向tab）
- **EditorView 组件**（使用 SlotRenderer 渲染插槽）
- **LeftPanel 组件**（竖向tab切换设计）
- 基础 UI 扩展（Header, LeftPanel, RightPanel, CenterCanvas）

### 核心插槽定义

```
header
├── header:left          # Logo
├── header:center        # 工具栏
└── header:right         # 操作按钮

left-panel               # 左侧面板容器（竖向tab设计）
├── left-panel:tabs      # ⭐ 竖向tab区域（可扩展）
│   ├── component-tab    # 组件面板tab（ComponentTabExtension 注册）
│   └── layer-tab        # 图层树tab（LayerTabExtension 注册）
├── left-panel:content   # 主内容区（显示当前选中tab的内容）
└── left-panel:bottom    # 底部操作

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

### 竖向Tab左侧栏详细设计

**LeftPanel 组件结构**：

```tsx
<LeftPanel>
  {/* 左侧竖向Tab栏 - 约 48px 宽 */}
  <TabsContainer>
    <SlotRenderer slotName="left-panel:tabs" direction="vertical" />
    {/* 渲染结果：
      <TabButton active={activeTab === 'component'}>
        <IconComponent /> 组件
      </TabButton>
      <TabButton active={activeTab === 'layer'}>
        <IconLayers /> 图层
      </TabButton>
    */}
  </TabsContainer>
  
  {/* 右侧内容区 */}
  <ContentContainer>
    {/* 根据 activeTab 渲染对应内容 */}
    {activeTab === 'component' && <ComponentPanel />}
    {activeTab === 'layer' && <LayerTree />}
  </ContentContainer>
  
  {/* 底部区域 */}
  <BottomContainer>
    <SlotRenderer slotName="left-panel:bottom" />
  </BottomContainer>
</LeftPanel>
```

**Tab 注册方式**：

```typescript
// ComponentTabExtension
class ComponentTabExtension implements IExtension {
  id = 'component-tab';
  dependencies = ['left-panel']; // 依赖 left-panel 先加载
  
  init(context: IExtensionContext): void {
    // 注册 tab 按钮到 left-panel:tabs
    context.registerSlot('left-panel:tabs', {
      id: 'component-tab',
      component: TabButton,
      order: 10,
      config: {
        tabId: 'component',
        title: '组件',
        icon: IconComponent,
      },
    });
    
    // 注册 tab 内容（可以在 activate 中动态注册）
    context.on('left-panel:tab:activate', (tabId: string) => {
      if (tabId === 'component') {
        // 动态注册内容到 left-panel:content
        context.registerSlot('left-panel:content', {
          id: 'component-panel-content',
          component: ComponentPanel,
          order: 1,
        });
      }
    });
  }
}

// LayerTabExtension
class LayerTabExtension implements IExtension {
  id = 'layer-tab';
  dependencies = ['left-panel'];
  
  init(context: IExtensionContext): void {
    context.registerSlot('left-panel:tabs', {
      id: 'layer-tab',
      component: TabButton,
      order: 20,
      config: {
        tabId: 'layer',
        title: '图层',
        icon: IconLayers,
      },
    });
  }
}
```

**Store 状态**：

```typescript
interface EditorState {
  ui: {
    leftPanel: {
      activeTab: string;      // 'component' | 'layer' | 其他扩展的tab
      collapsed: boolean;
    };
  };
}
```

### EditorView 布局

```
┌─────────────────────────────────────────────────────────────────┐
│ <Header> Slot: header                                            │
│  ┌────────┬──────────────────────┬──────────────┐              │
│  │:left   │      :center         │     :right   │              │
│  │ Logo   │     Toolbar          │   Actions    │              │
│  └────────┴──────────────────────┴──────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│ <Layout>                                                         │
│  ┌────────────┬──────────────────────────┬───────────────┐     │
│  │ LeftPanel  │                          │ RightPanel    │     │
│  │            │      Center Canvas       │               │     │
│  │┌──────────┐│     ┌──────────────────┐ │               │     │
│  ││Tabs      ││     │                  │ │  Properties   │     │
│  ││┌──┐     ││     │   Canvas Area    │ │  Panel        │     │
│  ││⚙️ │ 组件 ││     │                  │ │               │     │
│  ││📐│ 图层 ││     │                  │ │  ┌─────────┐  │     │
│  │└──┘     ││     └──────────────────┘ │  │ Property│  │     │
│  │          ││                          │  │ Form    │  │     │
│  │├──────────┤│                          │  └─────────┘  │     │
│  ││Content   ││                          │               │     │
│  ││(动态     ││                          │               │     │
│  ││ 内容)   ││                          │               │     │
│  │└──────────┘│                          │               │     │
│  └────────────┴──────────────────────────┴───────────────┘     │
└─────────────────────────────────────────────────────────────────┘
      ↑               ↑                          ↑
   48px宽        自适应宽度                   300px宽
  竖向Tabs       画布区域                     属性面板
```

### 扩展加载顺序

```typescript
const EXTENSION_LOAD_ORDER = [
  // 1. 核心系统
  'slot-system',
  'event-system',
  'store',
  
  // 2. UI 框架（容器）
  'header',
  'left-panel',         // 左侧栏容器（先加载，定义 tabs 插槽）
  'right-panel',
  'center-canvas',
  'float-layer',
  
  // 3. UI 功能（往容器插槽注册）
  'logo',               // → header:left
  'toolbar',            // → header:center
  'actions',            // → header:right
  
  // 4. 左侧栏 Tabs（往 left-panel:tabs 注册）
  'component-tab',      // → left-panel:tabs
  'layer-tab',          // → left-panel:tabs
  
  // 5. 右侧面板
  'properties-panel',   // → right-panel:content
  
  // 6. 编辑功能
  'canvas',
  'ruler',
  'select',
];
```

### 约束条件

1. **Tab 必须先注册** - left-panel 扩展要先加载，定义 tabs 插槽
2. **tab id 唯一** - 每个 tab 有唯一标识
3. **默认激活第一个 tab** - 通常是 'component'
4. **Tab 可禁用/隐藏** - 支持条件渲染

### 假设

1. 竖向 tab 宽度 48px，高度自适应
2. Tab 图标使用 Semi Design Icons
3. 点击 tab 切换时触发 'left-panel:tab:change' 事件
4. Tab 内容可以延迟加载（懒加载）

---

## 阶段产出

- ✅ OrangeEditor 类完整实现
- ✅ **竖向Tab左侧栏**设计实现
- ✅ 核心插槽定义（含 left-panel:tabs）
- ✅ EditorView 组件渲染基础布局
- ✅ Header, LeftPanel（竖向tab）, RightPanel, CenterCanvas UI 扩展
- ✅ SlotRenderer 正确渲染插槽内容

---

*由 GSD 生成 - 竖向Tab左侧栏版本*
