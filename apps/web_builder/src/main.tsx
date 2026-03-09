import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from '@douyinfe/semi-ui';
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import { registerDefaultBindings } from './container/bindings';
import { Demo } from './demo';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

// 注册默认 DI 绑定
registerDefaultBindings();

const EditorRoot = () => <Demo />;

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ConfigProvider locale={zhCN}>
          <EditorRoot />
        </ConfigProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
