import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';
import { useLogin } from '@/hooks/useAuth';
import type { LoginParams } from '@/types/auth';

const { Text } = Typography;

export function LoginContainer() {
  const navigate = useNavigate();
  const { login, loading } = useLogin();

  const handleLogin = async (values: LoginParams): Promise<boolean> => {
    const success = await login(values);
    if (success) navigate('/');
    return success;
  };

  const footer = (
    <Text>
      没有账号？ <Link to="/register">去注册</Link>
    </Text>
  );

  return (
    <AuthLayout title="登录" subtitle="Web Admin 后台管理" footer={footer}>
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
}
