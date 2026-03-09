import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Toast } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';
import type { Locale } from '@douyinfe/semi-ui/lib/es/locale';
import './styles/global.scss';

// 页面
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

/**
 * 路由守卫组件 - 需要登录
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        加载中...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * 路由守卫组件 - 已登录跳转
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        加载中...
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/projects" replace />;
}

/**
 * 应用主组件
 */
function App() {
  const { theme } = useTheme();
  const { language, loadSemiLocale } = useLanguage();
  const [semiLocale, setSemiLocale] = useState<Locale | null>(null);
  
  // 加载 Semi UI 语言包
  useEffect(() => {
    loadSemiLocale(language).then(setSemiLocale);
  }, [language, loadSemiLocale]);

  // 初始化 Toast
  useEffect(() => {
    Toast.config({
      duration: 3,
      position: 'top',
    });
  }, []);

  if (!semiLocale) {
    return null; // 等待语言包加载
  }

  return (
    <ConfigProvider locale={semiLocale}>
      <div className={`app ${theme}`}>
        <Router>
          <Routes>
            {/* 公开路由 - 未登录可访问 */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* 需要登录的路由 */}
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              }
            />

            {/* 默认重定向 */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </Router>
      </div>
    </ConfigProvider>
  );
}

export default App;
