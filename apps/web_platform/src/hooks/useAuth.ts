import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCurrentUser, logout as apiLogout } from '../api/auth';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setAuthenticated, setLoading, logout: storeLogout } = useAuthStore();

  // 初始化时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      setLoading(true);
      getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setAuthenticated(true);
        })
        .catch(() => {
          // Token 无效，清除登录状态
          storeLogout();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, setUser, setAuthenticated, setLoading, storeLogout]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      storeLogout();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
  };
};
