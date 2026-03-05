import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Toast } from '@douyinfe/semi-ui';
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import { authStorage } from '@/services/auth';
import { useTheme } from '@/hooks/useTheme';
import { AdminLayout } from '@/containers/AdminLayout';
import { LoginContainer } from '@/containers/LoginContainer';
import { RegisterContainer } from '@/containers/RegisterContainer';
import { Dashboard } from '@/containers/Dashboard';
import { Users } from '@/containers/Users';
import { Settings } from '@/containers/Settings';
import '@/styles/global.scss';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return authStorage.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return authStorage.isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;
}

function App() {
  useTheme();

  useEffect(() => {
    Toast.config({ duration: 3, position: 'top' });
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
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
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
