# 2-1-PLAN.md

## 计划 2-1: EditorView 与竖向Tab左侧栏实现

### 前置依赖
- 计划 1-3 完成（插槽化架构基础）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `apps/web_builder/src/core/components/EditorView.tsx` | 编辑器主视图 |
| 创建 | `apps/web_builder/src/core/components/EditorLayout.tsx` | 布局容器 |
| 创建 | `apps/web_builder/src/core/slots/SlotRenderer.tsx` | 插槽渲染组件 |
| 修改 | `apps/web_builder/src/core/editor.ts` | 集成 EditorView |
| 创建 | `apps/web_builder/src/extensions/ui/header/components/Header.tsx` | Header 容器 |
| 创建 | `apps/web_builder/src/extensions/ui/left-panel/components/LeftPanel.tsx` | **竖向Tab左侧栏** |
| 创建 | `apps/web_builder/src/extensions/ui/left-panel/components/TabButton.tsx` | Tab 按钮组件 |
| 创建 | `apps/web_builder/src/extensions/ui/left-panel/store.ts` | 左侧栏状态管理 |
| 创建 | `apps/web_builder/src/extensions/ui/right-panel/components/RightPanel.tsx` | RightPanel 容器 |
| 创建 | `apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx` | CenterCanvas 容器 |
| 修改 | `apps/web_builder/src/extensions/ui/header/index.ts` | Header 扩展 |
| 修改 | `apps/web_builder/src/extensions/ui/left-panel/index.ts` | **LeftPanel 扩展（定义 tabs 插槽）** |
| 修改 | `apps/web_builder/src/extensions/ui/right-panel/index.ts` | RightPanel 扩展 |
| 修改 | `apps/web_builder/src/extensions/ui/center-canvas/index.ts` | CenterCanvas 扩展 |

### 实现步骤

1. **实现 SlotRenderer 组件**
   - 接收 slotName, direction 属性
   - 从 SlotRegistry 获取内容列表
   - 按 order 排序渲染
   - 支持竖向/横向布局

2. **实现 EditorView 组件**
   - 使用 Semi Design Layout
   - 渲染 header, left-panel, center, right-panel

3. **实现 LeftPanel（竖向Tab设计）**
   - 左侧 48px 竖向 tab 栏
   - 右侧内容区（根据 activeTab 显示）
   - 底部区域
   - 使用 zustand 管理 activeTab 状态

4. **实现 TabButton 组件**
   - 竖向按钮样式
   - 图标 + 文字
   - active 状态样式
   - 点击切换 tab

5. **实现其他 UI 容器**
   - Header, RightPanel, CenterCanvas

### 核心代码结构

```tsx
// apps/web_builder/src/core/slots/SlotRenderer.tsx
import React from 'react';
import { useContainer } from 'inversify-react';
import { SlotRegistry } from './SlotRegistry';

interface SlotRendererProps {
  slotName: string;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'horizontal' | 'vertical'; // ⭐ 支持竖向布局
}

export const SlotRenderer: React.FC<SlotRendererProps> = ({
  slotName,
  className,
  style,
  direction = 'horizontal',
}) => {
  const container = useContainer();
  const slotRegistry = container.get(SlotRegistry);
  const contents = slotRegistry.getContents(slotName);
  
  if (contents.length === 0) {
    return null;
  }
  
  const isVertical = direction === 'vertical';
  
  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        flexDirection: isVertical ? 'column' : 'row',
        ...style 
      }}
    >
      {contents.map((content) => {
        const Component = content.component;
        return (
          <div
            key={content.id}
            style={{ 
              flex: isVertical ? '0 0 auto' : (content.weight || 1),
            }}
            data-slot-content={content.id}
          >
            <Component {...content.config} />
          </div>
        );
      })}
    </div>
  );
};

// apps/web_builder/src/extensions/ui/left-panel/store.ts
import { create } from 'zustand';

interface LeftPanelState {
  activeTab: string;
  collapsed: boolean;
  setActiveTab: (tab: string) => void;
  toggleCollapsed: () => void;
}

export const useLeftPanelStore = create<LeftPanelState>((set) => ({
  activeTab: 'component', // 默认激活组件tab
  collapsed: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));

// apps/web_builder/src/extensions/ui/left-panel/components/TabButton.tsx
import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useLeftPanelStore } from '../store';

interface TabButtonProps {
  tabId: string;
  title: string;
  icon: React.ComponentType;
}

export const TabButton: React.FC<TabButtonProps> = ({
  tabId,
  title,
  icon: Icon,
}) => {
  const { activeTab, setActiveTab } = useLeftPanelStore();
  const isActive = activeTab === tabId;
  
  return (
    <Button
      type={isActive ? 'primary' : 'tertiary'}
      theme={isActive ? 'light' : 'borderless'}
      style={{
        width: '48px',
        height: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        borderRadius: 0,
        borderLeft: isActive ? '2px solid var(--semi-color-primary)' : '2px solid transparent',
      }}
      onClick={() => setActiveTab(tabId)}
    >
      <Icon />
      <span style={{ fontSize: '12px' }}>{title}</span>
    </Button>
  );
};

// apps/web_builder/src/extensions/ui/left-panel/components/LeftPanel.tsx
import React from 'react';
import { Layout } from '@douyinfe/semi-ui';
import { SlotRenderer } from '../../../../core/slots/SlotRenderer';
import { useLeftPanelStore } from '../store';

export const LeftPanel: React.FC = () => {
  const { activeTab, collapsed } = useLeftPanelStore();
  
  if (collapsed) {
    return (
      <div 
        style={{ 
          width: '48px', 
          height: '100%', 
          borderRight: '1px solid var(--semi-color-border)',
          background: 'var(--semi-color-bg-1)',
        }}
      >
        {/* 只显示 Tabs */}
        <SlotRenderer 
          slotName="left-panel:tabs" 
          direction="vertical"
          style={{ height: '100%' }}
        />
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 左侧竖向 Tabs - 48px 宽 */}
      <div 
        style={{ 
          width: '48px', 
          height: '100%', 
          borderRight: '1px solid var(--semi-color-border)',
          background: 'var(--semi-color-bg-1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SlotRenderer 
          slotName="left-panel:tabs" 
          direction="vertical"
        />
      </div>
      
      {/* 右侧内容区 - 根据 activeTab 显示 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部区域 */}
        <div style={{ padding: '12px', borderBottom: '1px solid var(--semi-color-border)' }}>
          <SlotRenderer slotName="left-panel:top" />
        </div>
        
        {/* 主内容区 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <TabContent activeTab={activeTab} />
        </div>
        
        {/* 底部区域 */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--semi-color-border)' }}>
          <SlotRenderer slotName="left-panel:bottom" />
        </div>
      </div>
    </div>
  );
};

// Tab 内容组件
const TabContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // 根据 activeTab 渲染不同内容
  // 这里可以通过插槽或者动态渲染
  return (
    <div style={{ padding: '12px' }}>
      <SlotRenderer slotName="left-panel:content" />
    </div>
  );
};

// apps/web_builder/src/extensions/ui/left-panel/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { LeftPanel } from './components/LeftPanel';

export class LeftPanelExtension implements IExtension {
  id = 'left-panel';
  name = 'Left Panel UI';
  version = '1.0.0';
  
  init(context: IExtensionContext): void {
    // 定义子插槽
    context.defineSlot('left-panel:tabs');      // ⭐ 竖向 tabs
    context.defineSlot('left-panel:top');
    context.defineSlot('left-panel:content');
    context.defineSlot('left-panel:bottom');
    
    // 注册 LeftPanel 容器到 left-panel 插槽
    context.registerSlot('left-panel', {
      id: 'left-panel-container',
      component: LeftPanel,
      order: 1,
      weight: 1,
    });
  }
}

export * from './components/LeftPanel';
export * from './components/TabButton';
export * from './store';

export default new ContainerModule((bind) => {
  bind(IExtension).to(LeftPanelExtension);
});

// apps/web_builder/src/core/components/EditorView.tsx
import React from 'react';
import { Layout } from '@douyinfe/semi-ui';
import { SlotRenderer } from '../slots/SlotRenderer';

const { Header: SemiHeader, Sider, Content } = Layout;

export const EditorView: React.FC = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      {/* Header */}
      <SemiHeader style={{ 
        background: 'var(--semi-color-bg-1)', 
        borderBottom: '1px solid var(--semi-color-border)',
        height: '56px',
        lineHeight: '56px',
        padding: 0,
      }}>
        <SlotRenderer 
          slotName="header" 
          style={{ height: '100%', alignItems: 'center' }} 
        />
      </SemiHeader>
      
      <Layout>
        {/* Left Panel - 竖向Tab设计 */}
        <Sider 
          width={280} 
          style={{ 
            background: 'var(--semi-color-bg-1)', 
            borderRight: '1px solid var(--semi-color-border)',
          }}
        >
          <SlotRenderer 
            slotName="left-panel" 
            style={{ height: '100%' }} 
          />
        </Sider>
        
        {/* Center Canvas */}
        <Content style={{ 
          background: 'var(--semi-color-bg-0)', 
          position: 'relative',
          overflow: 'hidden',
        }}>
          <SlotRenderer slotName="center" style={{ height: '100%' }} />
        </Content>
        
        {/* Right Panel */}
        <Sider 
          width={300} 
          style={{ 
            background: 'var(--semi-color-bg-1)', 
            borderLeft: '1px solid var(--semi-color-border)',
          }}
        >
          <SlotRenderer 
            slotName="right-panel" 
            style={{ height: '100%', flexDirection: 'column' }} 
          />
        </Sider>
      </Layout>
    </Layout>
  );
};
```

### 验证方法

```bash
cd apps/web_builder
rushx type-check
rush build -t @orangehome/web_builder
rushx dev
```

### 验收标准

- [ ] SlotRenderer 支持 direction 属性（horizontal/vertical）
- [ ] LeftPanel 显示竖向 tab 栏（48px 宽）
- [ ] LeftPanel 有独立的状态管理（zustand）
- [ ] TabButton 显示图标和文字，有 active 状态
- [ ] 点击 tab 可以切换（状态变化）
- [ ] Header, RightPanel, CenterCanvas 正常渲染
- [ ] EditorView 显示完整的三栏布局
- [ ] 无 TypeScript 错误
- [ ] 浏览器中能看到竖向 tab 设计

---

## 在 Cursor 中执行

```
请实现 EditorView 和竖向Tab左侧栏。

前置: 插槽化架构基础已完成。

路径: apps/web_builder/src/

任务:

1. 实现 SlotRenderer 组件:
   apps/web_builder/src/core/slots/SlotRenderer.tsx:
   - 接收 slotName, className, style, direction 属性
   - direction: 'horizontal' | 'vertical'，默认 horizontal
   - 使用 useContainer 获取 SlotRegistry
   - 根据 direction 设置 flexDirection
   - 渲染每个 content.component，传入 config

2. 实现左侧栏状态管理:
   apps/web_builder/src/extensions/ui/left-panel/store.ts:
   - 使用 zustand 创建 store
   - 状态: activeTab (默认 'component'), collapsed (默认 false)
   - 方法: setActiveTab(tab), toggleCollapsed()

3. 实现 TabButton 组件:
   apps/web_builder/src/extensions/ui/left-panel/components/TabButton.tsx:
   - 接收 tabId, title, icon 属性
   - 使用 useLeftPanelStore 获取 activeTab 和 setActiveTab
   - 使用 Semi Button 组件
   - 竖向样式：width: 48px, height: 64px, flexDirection: column
   - active 状态：type='primary', borderLeft 高亮
   - 非 active：type='tertiary', theme='borderless'
   - 显示图标和文字（fontSize: 12px）

4. 实现 LeftPanel 组件:
   apps/web_builder/src/extensions/ui/left-panel/components/LeftPanel.tsx:
   - 使用 useLeftPanelStore 获取 activeTab, collapsed
   - collapsed 为 true 时只显示 48px 宽的 tabs
   - 正常状态：左侧 48px tabs + 右侧内容区
   - 使用 SlotRenderer 渲染 left-panel:tabs（direction='vertical'）
   - 右侧分三部分：top（slot）、content（动态）、bottom（slot）
   - 样式使用 Semi Design CSS 变量

5. 实现 LeftPanelExtension:
   apps/web_builder/src/extensions/ui/left-panel/index.ts:
   - LeftPanelExtension 类
   - init() 中定义子插槽：left-panel:tabs, left-panel:top, left-panel:content, left-panel:bottom
   - 注册 LeftPanel 到 left-panel 插槽
   - 导出 store, LeftPanel, TabButton

6. 实现 EditorView 组件:
   apps/web_builder/src/core/components/EditorView.tsx:
   - 使用 Semi Design Layout 组件
   - Header：高度 56px，渲染 header 插槽
   - LeftPanel Sider：宽度 280px，渲染 left-panel 插槽
   - Center Content：自适应，背景色 bg-0，渲染 center 插槽
   - RightPanel Sider：宽度 300px，渲染 right-panel 插槽
   - 使用 Semi CSS 变量设置边框和背景色

7. 实现其他 UI 容器（占位）：
   - Header: apps/web_builder/src/extensions/ui/header/components/Header.tsx
     - 三栏布局：left, center, right
   - RightPanel: apps/web_builder/src/extensions/ui/right-panel/components/RightPanel.tsx
     - 垂直布局：top, content, bottom
   - CenterCanvas: apps/web_builder/src/extensions/ui/center-canvas/components/CenterCanvas.tsx
     - 包含标尺和画布区域

8. 更新 EditorView 导出:
   apps/web_builder/src/core/editor.ts 的 mount() 返回 EditorView

9. 更新 index.ts 导出:
   apps/web_builder/src/index.ts 导出 EditorView

验证:
1. rushx type-check (无错误)
2. rushx dev (启动开发服务器)
3. 浏览器访问 http://localhost:5173
4. 应看到：
   - 顶部栏（56px 高）
   - 左侧栏（280px 宽，左侧 48px 是 tabs 区域）
   - 中间画布区（自适应）
   - 右侧栏（300px 宽）

确保竖向 tab 设计正确，SlotRenderer 支持 direction 属性。
```

---

*由 GSD 生成 - 竖向Tab左侧栏版本*
