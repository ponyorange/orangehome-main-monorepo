import { useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Typography, Toast } from '@douyinfe/semi-ui';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';
import { useLogin } from '@/hooks/useAuth';
import type { LoginParams } from '@/types/auth';

const { Text } = Typography;

export function LoginContainer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loading } = useLogin();

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      Toast.warning('登录已过期，请重新登录');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLogin = async (values: LoginParams): Promise<boolean> => {
    const success = await login(values);
    if (success) navigate('/');
    return success;
  };

  const footer = (
    <Text>
      没有账号？ <Link to="/register">去注册</Link>
      {' · '}
      <Link to="/reset-password">忘记密码</Link>
    </Text>
  );

  return (
    <AuthLayout title="登录" subtitle="Web Admin 后台管理" footer={footer}>
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
}
