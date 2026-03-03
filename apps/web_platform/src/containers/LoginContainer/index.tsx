import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { AuthLayout } from '../../components/AuthLayout';
import { LoginForm } from '../../components/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { LoginParams } from '../../types/auth';

const { Text } = Typography;

/**
 * 登录页面容器
 */
export function LoginContainer() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleLogin = async (values: LoginParams): Promise<boolean> => {
    const success = await login(values);
    if (success) {
      navigate('/dashboard');
    }
    return success;
  };

  const footer = (
    <Text>
      还没有账号？<Link to="/register">立即注册</Link>
    </Text>
  );

  return (
    <AuthLayout 
      title="欢迎回来" 
      subtitle="登录你的 OrangeHome 账号"
      footer={footer}
    >
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
}

export default LoginContainer;
