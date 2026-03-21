# 2-2-PLAN.md

## 计划 2-2: 功能扩展注册（往竖向Tab左侧栏注册）

### 前置依赖
- 计划 2-1 完成（EditorView 与竖向Tab左侧栏）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `apps/web_builder/src/extensions/features/logo/components/Logo.tsx` | Logo 组件 |
| 修改 | `apps/web_builder/src/extensions/features/logo/index.ts` | Logo 扩展 |
| 创建 | `apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx` | 工具栏组件 |
| 修改 | `apps/web_builder/src/extensions/features/toolbar/index.ts` | Toolbar 扩展 |
| 创建 | `apps/web_builder/src/extensions/features/actions/components/Actions.tsx` | 操作按钮组件 |
| 修改 | `apps/web_builder/src/extensions/features/actions/index.ts` | Actions 扩展 |
| 创建 | `apps/web_builder/src/extensions/features/component-tab/components/ComponentTab.tsx` | 组件面板 Tab |
| 创建 | `apps/web_builder/src/extensions/features/component-tab/components/ComponentPanel.tsx` | 组件面板内容 |
| 修改 | `apps/web_builder/src/extensions/features/component-tab/index.ts` | **ComponentTab 扩展** |
| 创建 | `apps/web_builder/src/extensions/features/layer-tab/components/LayerTab.tsx` | 图层树 Tab |
| 创建 | `apps/web_builder/src/extensions/features/layer-tab/components/LayerTree.tsx` | 图层树内容 |
| 修改 | `apps/web_builder/src/extensions/features/layer-tab/index.ts` | **LayerTab 扩展** |
| 创建 | `apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx` | 属性面板 |
| 修改 | `apps/web_builder/src/extensions/features/properties-panel/index.ts` | PropertiesPanel 扩展 |
| 修改 | `apps/web_builder/src/core/editor.ts` | 配置默认扩展列表 |

### 实现步骤

1. **实现 Logo 扩展**
   - 注册到 header:left 插槽

2. **实现 Toolbar 扩展**
   - 工具栏按钮组
   - 注册到 header:center 插槽

3. **实现 Actions 扩展**
   - 操作按钮
   - 注册到 header:right 插槽

4. **实现 ComponentTab 扩展** ⭐
   - 注册 tab 按钮到 left-panel:tabs
   - 监听 tab 激活事件，注册内容到 left-panel:content
   - 组件面板内容（占位）

5. **实现 LayerTab 扩展** ⭐
   - 注册 tab 按钮到 left-panel:tabs
   - 监听 tab 激活事件
   - 图层树内容（占位）

6. **实现 PropertiesPanel 扩展**
   - 注册到 right-panel:content

7. **配置默认扩展列表**
   - 按正确顺序加载

### 核心代码结构

```tsx
// apps/web_builder/src/extensions/features/component-tab/components/ComponentTab.tsx
import React from 'react';
import { TabButton } from '../../../ui/left-panel';
import { IconComponent } from '@douyinfe/semi-icons';

export const ComponentTab: React.FC = () => {
  return (
    <TabButton
      tabId="component"
      title="组件"
      icon={IconComponent}
    />
  );
};

// apps/web_builder/src/extensions/features/component-tab/components/ComponentPanel.tsx
import React from 'react';
import { Input, Tabs, Empty } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

const { TabPane } = Tabs;

export const ComponentPanel: React.FC = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索框 */}
      <div style={{ padding: '12px' }}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索组件..."
          size="small"
        />
      </div>
      
      {/* 分类 Tabs */}
      <Tabs type="button" style={{ flex: 1 }}>
        <TabPane tab="基础" itemKey="basic">
          <div style={{ padding: '12px' }}>
            <Empty description="组件列表占位" />
          </div>
        </TabPane>
        <TabPane tab="业务" itemKey="business">
          <div style={{ padding: '12px' }}>
            <Empty description="业务组件占位" />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

// apps/web_builder/src/extensions/features/component-tab/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { ComponentTab } from './components/ComponentTab';
import { ComponentPanel } from './components/ComponentPanel';

export class ComponentTabExtension implements IExtension {
  id = 'component-tab';
  name = 'Component Tab';
  version = '1.0.0';
  dependencies = ['left-panel']; // 依赖 left-panel 先加载
  
  private contentRegistered = false;
  
  init(context: IExtensionContext): void {
    // 1. 注册 tab 按钮到 left-panel:tabs
    context.registerSlot('left-panel:tabs', {
      id: 'component-tab',
      component: ComponentTab,
      order: 10,
    });
    
    // 2. 监听 tab 切换事件，动态注册内容
    context.on('left-panel:tab:change', (tabId: string) => {
      if (tabId === 'component') {
        this.registerContent(context);
      }
    });
    
    // 3. 如果是默认激活的 tab，立即注册内容
    const store = context.getService('store');
    if (store?.getState()?.ui?.leftPanel?.activeTab === 'component') {
      this.registerContent(context);
    }
  }
  
  private registerContent(context: IExtensionContext): void {
    if (this.contentRegistered) return;
    
    context.registerSlot('left-panel:content', {
      id: 'component-panel-content',
      component: ComponentPanel,
      order: 1,
    });
    
    this.contentRegistered = true;
  }
}

export * from './components/ComponentTab';
export * from './components/ComponentPanel';

export default new ContainerModule((bind) => {
  bind(IExtension).to(ComponentTabExtension);
});

// apps/web_builder/src/extensions/features/layer-tab/components/LayerTab.tsx
import React from 'react';
import { TabButton } from '../../../ui/left-panel';
import { IconLayers } from '@douyinfe/semi-icons';

export const LayerTab: React.FC = () => {
  return (
    <TabButton
      tabId="layer"
      title="图层"
      icon={IconLayers}
    />
  );
};

// apps/web_builder/src/extensions/features/layer-tab/components/LayerTree.tsx
import React from 'react';
import { Empty } from '@douyinfe/semi-ui';

export const LayerTree: React.FC = () => {
  return (
    <div style={{ padding: '12px' }}>
      <Empty description="图层树占位" />
    </div>
  );
};

// apps/web_builder/src/extensions/features/layer-tab/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { LayerTab } from './components/LayerTab';
import { LayerTree } from './components/LayerTree';

export class LayerTabExtension implements IExtension {
  id = 'layer-tab';
  name = 'Layer Tab';
  version = '1.0.0';
  dependencies = ['left-panel'];
  
  private contentRegistered = false;
  
  init(context: IExtensionContext): void {
    // 注册 tab 按钮
    context.registerSlot('left-panel:tabs', {
      id: 'layer-tab',
      component: LayerTab,
      order: 20,
    });
    
    // 监听 tab 切换
    context.on('left-panel:tab:change', (tabId: string) => {
      if (tabId === 'layer') {
        this.registerContent(context);
      }
    });
  }
  
  private registerContent(context: IExtensionContext): void {
    if (this.contentRegistered) return;
    
    context.registerSlot('left-panel:content', {
      id: 'layer-tree-content',
      component: LayerTree,
      order: 1,
    });
    
    this.contentRegistered = true;
  }
}

export * from './components/LayerTab';
export * from './components/LayerTree';

export default new ContainerModule((bind) => {
  bind(IExtension).to(LayerTabExtension);
});

// apps/web_builder/src/extensions/features/logo/components/Logo.tsx
import React from 'react';
import { Typography } from '@douyinfe/semi-ui';

export const Logo: React.FC = () => {
  return (
    <Typography.Title heading={5} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
      🍊 Orange Editor
    </Typography.Title>
  );
};

// apps/web_builder/src/extensions/features/logo/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Logo } from './components/Logo';

export class LogoExtension implements IExtension {
  id = 'logo';
  name = 'Logo';
  version = '1.0.0';
  
  init(context: IExtensionContext): void {
    context.registerSlot('header:left', {
      id: 'logo',
      component: Logo,
      order: 1,
    });
  }
}

export default new ContainerModule((bind) => {
  bind(IExtension).to(LogoExtension);
});

// apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx
import React from 'react';
import { Button, Space } from '@douyinfe/semi-ui';
import { IconUndo, IconRedo, IconEyeOpened, IconSave } from '@douyinfe/semi-icons';

export const Toolbar: React.FC = () => {
  return (
    <Space>
      <Button icon={<IconUndo />} type="tertiary" size="small">撤销</Button>
      <Button icon={<IconRedo />} type="tertiary" size="small">重做</Button>
      <Button icon={<IconEyeOpened />} type="primary" size="small">预览</Button>
      <Button icon={<IconSave />} type="secondary" size="small">保存</Button>
    </Space>
  );
};

// apps/web_builder/src/extensions/features/toolbar/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { Toolbar } from './components/Toolbar';

export class ToolbarExtension implements IExtension {
  id = 'toolbar';
  name = 'Toolbar';
  version = '1.0.0';
  
  init(context: IExtensionContext): void {
    context.registerSlot('header:center', {
      id: 'toolbar',
      component: Toolbar,
      order: 1,
    });
  }
}

export default new ContainerModule((bind) => {
  bind(IExtension).to(ToolbarExtension);
});

// apps/web_builder/src/extensions/features/actions/components/Actions.tsx
import React from 'react';
import { Button, Space } from '@douyinfe/semi-ui';
import { IconImport, IconExport, IconSetting } from '@douyinfe/semi-icons';

export const Actions: React.FC = () => {
  return (
    <Space>
      <Button icon={<IconImport />} type="tertiary" size="small">导入</Button>
      <Button icon={<IconExport />} type="tertiary" size="small">导出</Button>
      <Button icon={<IconSetting />} type="tertiary" size="small">设置</Button>
    </Space>
  );
};

// apps/web_builder/src/extensions/features/actions/index.ts - 类似 Toolbar

// apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx
import React from 'react';
import { Empty, Typography } from '@douyinfe/semi-ui';

export const PropertiesPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid var(--semi-color-border)' }}>
        <Typography.Title heading={6} style={{ margin: 0 }}>属性配置</Typography.Title>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        <Empty description="请选择组件" />
      </div>
    </div>
  );
};

// apps/web_builder/src/extensions/features/properties-panel/index.ts
import { ContainerModule } from 'inversify';
import { IExtension, IExtensionContext } from '../../../core/extensions/types';
import { PropertiesPanel } from './components/PropertiesPanel';

export class PropertiesPanelExtension implements IExtension {
  id = 'properties-panel';
  name = 'Properties Panel';
  version = '1.0.0';
  
  init(context: IExtensionContext): void {
    context.registerSlot('right-panel:content', {
      id: 'properties-panel',
      component: PropertiesPanel,
      order: 10,
      weight: 1,
    });
  }
}

export default new ContainerModule((bind) => {
  bind(IExtension).to(PropertiesPanelExtension);
});

// apps/web_builder/src/core/editor.ts - 配置默认扩展
import { HeaderExtension } from '../extensions/ui/header';
import { LeftPanelExtension } from '../extensions/ui/left-panel';
import { RightPanelExtension } from '../extensions/ui/right-panel';
import { CenterCanvasExtension } from '../extensions/ui/center-canvas';
import { LogoExtension } from '../extensions/features/logo';
import { ToolbarExtension } from '../extensions/features/toolbar';
import { ActionsExtension } from '../extensions/features/actions';
import { ComponentTabExtension } from '../extensions/features/component-tab';
import { LayerTabExtension } from '../extensions/features/layer-tab';
import { PropertiesPanelExtension } from '../extensions/features/properties-panel';

// 默认扩展列表（按加载顺序）
const DEFAULT_EXTENSIONS = [
  // UI 容器（先加载，定义插槽）
  HeaderExtension,
  LeftPanelExtension,
  RightPanelExtension,
  CenterCanvasExtension,
  
  // Header 内容
  LogoExtension,
  ToolbarExtension,
  ActionsExtension,
  
  // 左侧栏 Tabs（依赖 left-panel）
  ComponentTabExtension,
  LayerTabExtension,
  
  // 右侧面板
  PropertiesPanelExtension,
];

export class OrangeEditor {
  // ...
  
  private getExtensions(): IExtension[] {
    return [
      ...DEFAULT_EXTENSIONS,
      ...(this._options.extensions || []),
    ];
  }
}
```

### 验证方法

```bash
cd apps/web_builder
rushx type-check
rushx dev
```

### 验收标准

- [ ] Logo 显示在 Header 左侧
- [ ] Toolbar 显示在 Header 中间
- [ ] Actions 显示在 Header 右侧
- [ ] **LeftPanel 显示竖向 Tabs**（组件、图层）
- [ ] 点击 Tab 可以切换 active 状态
- [ ] ComponentTab 注册到 left-panel:tabs
- [ ] LayerTab 注册到 left-panel:tabs
- [ ] 默认显示组件面板内容
- [ ] PropertiesPanel 显示在右侧面板
- [ ] 无 TypeScript 错误
- [ ] 浏览器中能看到完整的竖向Tab编辑器界面

---

## 在 Cursor 中执行

```
请实现功能扩展，往竖向Tab左侧栏注册内容。

前置: EditorView 和竖向Tab左侧栏已完成。

路径: apps/web_builder/src/extensions/features/

任务:

1. 实现 Logo 扩展:
   apps/web_builder/src/extensions/features/logo/components/Logo.tsx:
   - 显示 🍊 Orange Editor
   - 使用 Semi Typography.Title
   
   apps/web_builder/src/extensions/features/logo/index.ts:
   - LogoExtension 类
   - init() 注册 Logo 到 header:left 插槽

2. 实现 Toolbar 扩展:
   apps/web_builder/src/extensions/features/toolbar/components/Toolbar.tsx:
   - 按钮：撤销、重做、预览、保存
   - 使用 Semi Button, Space
   - 使用 Semi Icons: IconUndo, IconRedo, IconEyeOpened, IconSave
   
   apps/web_builder/src/extensions/features/toolbar/index.ts:
   - 注册到 header:center 插槽

3. 实现 Actions 扩展:
   apps/web_builder/src/extensions/features/actions/components/Actions.tsx:
   - 按钮：导入、导出、设置
   - 使用 Semi Icons: IconImport, IconExport, IconSetting
   
   apps/web_builder/src/extensions/features/actions/index.ts:
   - 注册到 header:right 插槽

4. 实现 ComponentTab 扩展: ⭐
   apps/web_builder/src/extensions/features/component-tab/components/ComponentTab.tsx:
   - 使用 TabButton 组件
   - tabId="component", title="组件", icon=IconComponent
   
   apps/web_builder/src/extensions/features/component-tab/components/ComponentPanel.tsx:
   - 搜索输入框
   - Tabs 切换（基础、业务）
   - Empty 占位显示
   
   apps/web_builder/src/extensions/features/component-tab/index.ts:
   - ComponentTabExtension 类
   - dependencies = ['left-panel']
   - init():
     1. 注册 ComponentTab 到 left-panel:tabs
     2. 监听 'left-panel:tab:change' 事件
     3. tabId === 'component' 时注册 ComponentPanel 到 left-panel:content
     4. 如果是默认激活 tab，立即注册内容

5. 实现 LayerTab 扩展: ⭐
   apps/web_builder/src/extensions/features/layer-tab/components/LayerTab.tsx:
   - 使用 TabButton
   - tabId="layer", title="图层", icon=IconLayers
   
   apps/web_builder/src/extensions/features/layer-tab/components/LayerTree.tsx:
   - 图层树占位（Empty 组件）
   
   apps/web_builder/src/extensions/features/layer-tab/index.ts:
   - LayerTabExtension 类
   - dependencies = ['left-panel']
   - 类似 ComponentTab，监听 tab 切换事件

6. 实现 PropertiesPanel 扩展:
   apps/web_builder/src/extensions/features/properties-panel/components/PropertiesPanel.tsx:
   - 标题：属性配置
   - 内容区显示 Empty（请选择组件）
   
   apps/web_builder/src/extensions/features/properties-panel/index.ts:
   - 注册到 right-panel:content 插槽

7. 配置默认扩展:
   apps/web_builder/src/core/editor.ts:
   - 导入所有扩展
   - DEFAULT_EXTENSIONS 数组（注意顺序：UI容器 -> Header内容 -> Tabs -> 右侧面板）
   - getExtensions() 合并默认和用户扩展

8. 更新事件系统（可选）:
   - 在 LeftPanel 的 setActiveTab 中 emit 'left-panel:tab:change' 事件
   - 让 ComponentTab/LayerTab 能监听到切换

验证:
1. rushx type-check (无错误)
2. rushx dev (启动)
3. 浏览器访问
4. 应看到完整界面：
   - Header: 🍊 Orange Editor | 撤销 重做 预览 保存 | 导入 导出 设置
   - LeftPanel: 
     - 左侧竖向Tabs：[⚙️ 组件] [📐 图层]
     - 右侧内容：默认显示组件面板（搜索框、Tabs、Empty）
   - Center: 画布区域
   - RightPanel: 属性配置（Empty）

确保竖向Tab能切换，ComponentTab 和 LayerTab 正确注册到 left-panel:tabs。
```

---

*由 GSD 生成 - 竖向Tab左侧栏版本*
