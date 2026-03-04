import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Toast } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import { LoginContainer } from './containers/LoginContainer';
import { RegisterContainer } from './containers/RegisterContainer';
import { DashboardContainer } from './containers/DashboardContainer';
import { authService } from './services/auth';
import { useAppStore } from './store/appStore';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import type { Locale } from '@douyinfe/semi-ui/lib/es/locale';
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
  const { theme, setTheme, toggleTheme } = useTheme();
  const { language, setLanguage, loadSemiLocale } = useLanguage();
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
                <DashboardContainer 
                  theme={theme}
                  onThemeChange={setTheme}
                  onToggleTheme={toggleTheme}
                  language={language}
                  onLanguageChange={setLanguage}
                />
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
