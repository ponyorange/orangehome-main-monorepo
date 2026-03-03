import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from '@douyinfe/semi-ui';
import zh_CN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import { LoginContainer } from './containers/LoginContainer';
import { RegisterContainer } from './containers/RegisterContainer';
import { DashboardContainer } from './containers/DashboardContainer';
import { authService } from './services/auth';
import './styles/global.scss';

/**
 * 路由守卫组件 - 需要登录
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  return authService.isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
}

/**
 * 路由守卫组件 - 已登录跳转
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  return authService.isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
}

/**
 * 应用主组件
 */
function App() {
  return (
    <ConfigProvider locale={zh_CN}>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginContainer />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterContainer />
              </PublicRoute>
            }
          />

          {/* 需要登录的路由 */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardContainer />
              </PrivateRoute>
            }
          />

          {/* 默认重定向 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
