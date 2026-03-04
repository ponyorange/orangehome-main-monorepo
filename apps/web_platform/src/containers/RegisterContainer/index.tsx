import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from '@/components/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { RegisterParams } from '@/types/auth';

const { Text } = Typography;

/**
 * 注册页面容器
 */
export function RegisterContainer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, sendCode, loading } = useAuth();

  const handleRegister = async (values: RegisterParams): Promise<boolean> => {
    const success = await register(values);
    if (success) {
      navigate('/login');
    }
    return success;
  };

  const handleSendCode = async (email: string): Promise<boolean> => {
    return await sendCode({ email, type: 'register' });
  };

  const footer = (
    <Text>
      {t('auth.hasAccount')} <Link to="/login">{t('auth.goLogin')}</Link>
    </Text>
  );

  return (
    <AuthLayout 
      title={t('auth.register')} 
      subtitle="OrangeHome"
      footer={footer}
    >
      <RegisterForm 
        onSubmit={handleRegister} 
        onSendCode={handleSendCode}
        loading={loading} 
      />
    </AuthLayout>
  );
}

export default RegisterContainer;
