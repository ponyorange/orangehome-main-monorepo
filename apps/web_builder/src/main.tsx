import 'reflect-metadata';
import ReactDOM from 'react-dom/client';
import { createElement } from 'react';
import { OrangeEditor } from './core/editor';
import { setDefaultContainer } from './core/container';
import { initTheme } from './core/theme';
import { EditorBootstrap } from './core/components/EditorBootstrap';

// 初始化主题系统（从localStorage恢复或应用默认主题）
initTheme();

// 创建编辑器实例
const container = document.getElementById('root')!;
const editor = OrangeEditor.getInstance({ container });

// 将编辑器容器设置为默认容器，供 SlotRenderer 使用
setDefaultContainer(editor.container);

// 挂载编辑器
editor.mount()
  .then((View) => {
    if (View) {
      ReactDOM.createRoot(container).render(
        createElement(EditorBootstrap, null, createElement(View))
      );
    } else {
      console.error('[Main] Editor mount returned null view');
      container.innerHTML = '<div style="padding: 20px; color: red;">编辑器视图加载失败</div>';
    }
  })
  .catch((error) => {
    console.error('[Main] Editor mount failed:', error);
    container.innerHTML = `<div style="padding: 20px; color: red;">编辑器挂载失败: ${error.message}</div>`;
  });
