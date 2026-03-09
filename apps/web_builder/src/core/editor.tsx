import React from 'react';
import { Container } from 'inversify';
import EventEmitter2 from 'eventemitter2';
import { defaultContainer } from '../container';
import { EditorPerfTracker } from '../common/editor-perf-tracker/EditorPerfTracker';
import {
  EditorConfigService,
  type IEditorConfigService,
} from '../services/EditorConfigService';
import { storeExtension } from '../extensions/store';
import { canvasExtension } from '../extensions/canvas';
import { schemaExtension } from '../extensions/schema';
import { selectAndDragExtension } from '../extensions/select-and-drag';
import { StoreService } from '../extensions/store';
import { EditorMount } from './EditorMount';
import type { Extension } from '../extensions';

/** 生命周期事件 */
export const EditorLifecycleEvents = {
  WILL_MOUNT: 'editor:willMount',
  DID_MOUNT: 'editor:didMount',
  WILL_UNMOUNT: 'editor:willUnmount',
} as const;

/** 默认扩展列表（加载顺序：store -> canvas -> schema -> select-and-drag） */
const DEFAULT_EXTENSIONS: Extension[] = [
  storeExtension,
  canvasExtension,
  schemaExtension,
  selectAndDragExtension,
];

/**
 * Orange Editor 核心类
 * 单例模式，持有 DI 容器和性能追踪器
 */
export class OrangeEditor {
  private static _instance: OrangeEditor | null = null;
  private readonly _container: Container;
  private readonly _perfTracker: EditorPerfTracker;
  private readonly _eventBus: EventEmitter2;
  private _extensionsLoaded = false;

  private constructor(
    container: Container = defaultContainer,
    perfTracker?: EditorPerfTracker
  ) {
    this._container = container;
    this._perfTracker = perfTracker ?? new EditorPerfTracker();
    this._eventBus = new EventEmitter2();
  }

  /**
   * 获取单例实例
   */
  static getInstance(
    container?: Container,
    perfTracker?: EditorPerfTracker
  ): OrangeEditor {
    if (OrangeEditor._instance === null) {
      OrangeEditor._instance = new OrangeEditor(container, perfTracker);
    }
    return OrangeEditor._instance;
  }

  /** 重置单例（主要用于测试） */
  static resetInstance(): void {
    OrangeEditor._instance = null;
  }

  get container(): Container {
    return this._container;
  }

  get perfTracker(): EditorPerfTracker {
    return this._perfTracker;
  }

  get eventBus(): EventEmitter2 {
    return this._eventBus;
  }

  /** 获取配置服务（验证 DI 容器可正确解析） */
  getConfigService(): IEditorConfigService {
    return this._container.get<IEditorConfigService>(EditorConfigService);
  }

  /** 挂载前生命周期 */
  willMount(): void {
    this._eventBus.emit(EditorLifecycleEvents.WILL_MOUNT);
  }

  /** 挂载后生命周期 */
  didMount(): void {
    this._eventBus.emit(EditorLifecycleEvents.DID_MOUNT);
  }

  /** 卸载前生命周期 */
  willUnmount(): void {
    this._eventBus.emit(EditorLifecycleEvents.WILL_UNMOUNT);
  }

  /** 加载所有已注册扩展 */
  private _loadExtensions(): void {
    if (this._extensionsLoaded) return;
    for (const ext of DEFAULT_EXTENSIONS) {
      ext.init(this._container);
    }
    this._extensionsLoaded = true;
  }

  /**
   * 挂载编辑器，返回 React 根元素
   * 包含画布容器和 Zustand Provider
   */
  mount(): React.ReactElement {
    this.willMount();
    this.perfTracker.trackFirstRender();
    this._loadExtensions();
    const storeService = this._container.get(StoreService);
    this.didMount();
    return (
      <EditorMount container={this._container} storeService={storeService} />
    );
  }
}
