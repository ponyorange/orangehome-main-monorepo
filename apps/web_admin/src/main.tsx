import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Spin } from '@douyinfe/semi-ui';
import App from './App';
import './styles/global.scss';

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
