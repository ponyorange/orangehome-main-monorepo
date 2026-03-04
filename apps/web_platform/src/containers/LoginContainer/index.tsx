import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { LoginParams } from '@/types/auth';

const { Text } = Typography;

/**
 * 登录页面容器
 */
export function LoginContainer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      {t('auth.noAccount')} <Link to="/register">{t('auth.goRegister')}</Link>
    </Text>
  );

  return (
    <AuthLayout 
      title={t('auth.login')} 
      subtitle="OrangeHome"
      footer={footer}
    >
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
}

export default LoginContainer;
