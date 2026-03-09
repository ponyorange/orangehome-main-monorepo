/**
 * EditorMount - 编辑器挂载组件（新版，基于插槽系统）
 * 使用 LayoutShell 作为布局容器，通过 LayoutRegistry 注册插槽
 */

import React, { useMemo } from 'react';
import { EditorStoreProvider } from './EditorStoreContext';
import { LayoutProvider, LayoutShell, LayoutRegistry, LayoutService } from '../layout';
import { OrangeDrag } from '../common/base/OrangeDrag';
import type { Container } from 'inversify';
import type { IStoreService } from '../extensions/store';

interface EditorMountProps {
  container: Container;
  storeService: IStoreService;
}

export function EditorMount({ container, storeService }: EditorMountProps) {
  const store = storeService.getStore();

  // 获取 LayoutService 实例
  const layoutService = useMemo(() => {
    try {
      return container.get(LayoutService);
    } catch (err) {
      console.error('[EditorMount] LayoutService 获取失败:', err);
      return null;
    }
  }, [container]);

  // 创建添加组件用的拖拽实例
  const addDrag = useMemo(
    () =>
      new OrangeDrag({
        distanceThreshold: 4,
        createMirror(el) {
          const rect = el.getBoundingClientRect();
          const mirror = document.createElement('div');
          mirror.className = 'orange-drag-mirror';
          mirror.textContent = (el.getAttribute('data-drag-label') as string) || '';
          mirror.style.cssText = `
            position: fixed;
            left: ${rect.left}px;
            top: ${rect.top}px;
            min-width: 60px;
            padding: 6px 12px;
            background: #ff6b00;
            color: #fff;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10000;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(255,107,0,0.4);
          `;
          return mirror;
        },
      }),
    []
  );

  if (!layoutService) {
    return (
      <div style={{ padding: 24, color: '#f56' }}>
        LayoutService 未初始化
      </div>
    );
  }

  return (
    <EditorStoreProvider store={store}>
      <LayoutProvider service={layoutService}>
        <LayoutShell />
        <LayoutRegistry addDrag={addDrag} />
      </LayoutProvider>
    </EditorStoreProvider>
  );
}

export default EditorMount;
