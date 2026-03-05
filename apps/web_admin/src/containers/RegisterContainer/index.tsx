import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from '@/components/RegisterForm';
import { useRegister, useSendCode } from '@/hooks/useAuth';
import type { RegisterParams } from '@/types/auth';

const { Text } = Typography;

/**
 * 注册页面 - 邮箱验证码注册
 */
export function RegisterContainer() {
  const navigate = useNavigate();
  const { register, loading } = useRegister();
  const { sendCode } = useSendCode();

  const handleRegister = async (values: RegisterParams): Promise<boolean> => {
    const success = await register(values);
    if (success) navigate('/login');
    return success;
  };

  const handleSendCode = async (email: string): Promise<boolean> => {
    return sendCode({ email, type: 'register' });
  };

  const footer = (
    <Text>
      已有账号？ <Link to="/login">去登录</Link>
    </Text>
  );

  return (
    <AuthLayout title="注册" subtitle="邮箱验证码注册" footer={footer}>
      <RegisterForm
        onSubmit={handleRegister}
        onSendCode={handleSendCode}
        loading={loading}
      />
    </AuthLayout>
  );
}
