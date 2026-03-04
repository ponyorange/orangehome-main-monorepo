import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Spin } from '@douyinfe/semi-ui';
import App from './App';
import i18n from './i18n';
import './styles/global.scss';
import './styles/themes.scss';

// 加载状态组件
const LoadingFallback = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>
);
