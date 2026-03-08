import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Toast } from '@douyinfe/semi-ui';
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import { authStorage } from '@/services/auth';
import { useTheme } from '@/hooks/useTheme';
import { AdminLayout } from '@/containers/AdminLayout';
import { LoginContainer } from '@/containers/LoginContainer';
import { RegisterContainer } from '@/containers/RegisterContainer';
import { ResetPasswordContainer } from '@/containers/ResetPasswordContainer';
import { Dashboard } from '@/containers/Dashboard';
import { Users } from '@/containers/Users';
import { Settings } from '@/containers/Settings';
import { Platforms } from '@/containers/Platforms';
import { Businesses } from '@/containers/Businesses';
import { MaterialTypes } from '@/containers/MaterialTypes';
import { MaterialCategories } from '@/containers/MaterialCategories';
import { Materials } from '@/containers/Materials';
import { MaterialVersions } from '@/containers/MaterialVersions';
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
    Toast.config({ duration: 3 });
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
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordContainer />
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
            <Route path="platforms" element={<Platforms />} />
            <Route path="businesses" element={<Businesses />} />
            <Route path="material-types" element={<MaterialTypes />} />
            <Route path="material-categories" element={<MaterialCategories />} />
            <Route path="materials" element={<Materials />} />
            <Route path="materials/:materialId/versions" element={<MaterialVersions />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
