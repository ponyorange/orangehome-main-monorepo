import 'reflect-metadata';
import React from 'react';
import { Container } from 'inversify';
import { SlotRegistry } from './slots/SlotRegistry';
import { ExtensionLoader } from './extensions/ExtensionLoader';
import { EventBus } from './events/EventBus';
import { IExtension } from './extensions/types';
import type { ISchema } from '../types/base';

// 导入 UI 扩展
import { HeaderExtension } from '../extensions/ui/header';
import { LeftPanelExtension } from '../extensions/ui/left-panel';
import { RightPanelExtension } from '../extensions/ui/right-panel';
import { CenterCanvasExtension } from '../extensions/ui/center-canvas';

// 导入功能扩展
import { LogoExtension } from '../extensions/features/logo';
import { ToolbarExtension } from '../extensions/features/toolbar';
import { ActionsExtension } from '../extensions/features/actions';
import { ComponentTabExtension } from '../extensions/features/component-tab';
import { LayerTabExtension } from '../extensions/features/layer-tab';
import { PropertiesPanelExtension } from '../extensions/features/properties-panel';
import { ThemeSwitcherExtension } from '../extensions/features/theme-switcher';

// 导入 EditorView
import { EditorView } from './components/EditorView';

export interface EditorOptions {
  /** 容器元素 */
  container: HTMLElement;
  /** 自定义扩展列表 */
  extensions?: IExtension[];
  /** 初始 Schema */
  initialSchema?: ISchema;
}

/**
 * Orange Editor 核心类
 * 编辑器主类，管理插槽、扩展和生命周期
 */
export class OrangeEditor {
  private static _instances: OrangeEditor[] = [];
  private _options: EditorOptions;
  private _isMounted = false;

  /** Inversify 容器 */
  readonly container: Container;
  readonly slotRegistry: SlotRegistry;
  readonly extensionLoader: ExtensionLoader;
  readonly eventBus: EventBus;

  /**
   * 获取编辑器实例（单例模式）
   */
  static getInstance(options?: EditorOptions): OrangeEditor {
    const instance = this._instances.pop() ?? new this(options);
    this._instances.push(instance);
    return instance;
  }

  constructor(options?: EditorOptions) {
    this._options = {
      container: document.createElement('div'), // 默认容器
      ...options,
    };
    // 创建子容器
    this.container = new Container();
    // 绑定核心依赖
    this.container.bind(SlotRegistry).toSelf().inSingletonScope();
    this.container.bind(EventBus).toSelf().inSingletonScope();
    // 通过容器获取依赖实例
    this.slotRegistry = this.container.get(SlotRegistry);
    this.eventBus = this.container.get(EventBus);
    // ExtensionLoader 需要构造函数参数，手动创建
    this.extensionLoader = new ExtensionLoader(this.slotRegistry, this.eventBus);
    // 将已创建的实例绑定到容器，供扩展使用
    this.container.bind(ExtensionLoader).toConstantValue(this.extensionLoader);
    // 绑定自身
    this.container.bind(OrangeEditor).toConstantValue(this);
  }

  /**
   * 挂载编辑器
   */
  async mount(): Promise<React.FC | null> {
    if (this._isMounted) return null;

    // 1. 定义核心插槽
    this.defineCoreSlots();

    // 2. 加载扩展
    const extensions = this.getExtensions();
    await this.extensionLoader.load(extensions, this);

    // 3. 触发挂载事件
    this.eventBus.emit('editor:mount');

    // 4. 返回 EditorView 组件
    this._isMounted = true;
    return this.createEditorView();
  }

  /**
   * 卸载编辑器
   */
  unmount(): void {
    if (!this._isMounted) return;

    this.eventBus.emit('editor:unmount');
    this.extensionLoader.destroyAll();
    this._isMounted = false;
  }

  /**
   * 定义核心插槽
   */
  private defineCoreSlots(): void {
    // Header slots
    this.slotRegistry.defineSlot('header');
    this.slotRegistry.defineSlot('header:left', 'header');
    this.slotRegistry.defineSlot('header:center', 'header');
    this.slotRegistry.defineSlot('header:right', 'header');

    // Left panel slots
    this.slotRegistry.defineSlot('left-panel');
    this.slotRegistry.defineSlot('left-panel:tabs', 'left-panel');
    this.slotRegistry.defineSlot('left-panel:content', 'left-panel');
    this.slotRegistry.defineSlot('left-panel:bottom', 'left-panel');

    // Center slots
    this.slotRegistry.defineSlot('center');
    this.slotRegistry.defineSlot('center:ruler:top', 'center');
    this.slotRegistry.defineSlot('center:ruler:left', 'center');
    this.slotRegistry.defineSlot('center:canvas', 'center');

    // Right panel slots
    this.slotRegistry.defineSlot('right-panel');
    this.slotRegistry.defineSlot('right-panel:top', 'right-panel');
    this.slotRegistry.defineSlot('right-panel:content', 'right-panel');
    this.slotRegistry.defineSlot('right-panel:bottom', 'right-panel');

    // Float slots
    this.slotRegistry.defineSlot('float');
    this.slotRegistry.defineSlot('float:modal', 'float');
    this.slotRegistry.defineSlot('float:context-menu', 'float');
    this.slotRegistry.defineSlot('float:tooltip', 'float');
  }

  // 默认 UI 扩展列表（按加载顺序）
  private defaultExtensions: IExtension[] = [
    // 1. UI 容器（先加载，定义插槽）
    new HeaderExtension(),
    new LeftPanelExtension(),
    new RightPanelExtension(),
    new CenterCanvasExtension(),

    // 2. Header 内容
    new LogoExtension(),
    new ToolbarExtension(),
    new ActionsExtension(),
    new ThemeSwitcherExtension(),

    // 3. 左侧栏 Tabs（依赖 left-panel）
    new ComponentTabExtension(),
    new LayerTabExtension(),

    // 4. 右侧面板
    new PropertiesPanelExtension(),
  ];

  /**
   * 获取扩展列表
   */
  private getExtensions(): IExtension[] {
    return [
      ...this.defaultExtensions,
      ...(this._options.extensions || []),
    ];
  }

  /**
   * 创建编辑器视图组件
   */
  private createEditorView(): React.FC {
    return EditorView;
  }
}
