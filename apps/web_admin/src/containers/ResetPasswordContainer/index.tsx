import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { AuthLayout } from '@/components/AuthLayout';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { useResetPassword, useSendCode } from '@/hooks/useAuth';
import type { ResetPasswordParams } from '@/types/auth';

const { Text } = Typography;

/**
 * 重置密码页面
 */
export function ResetPasswordContainer() {
  const navigate = useNavigate();
  const { resetPassword, loading } = useResetPassword();
  const { sendCode } = useSendCode();

  const handleResetPassword = async (values: ResetPasswordParams): Promise<boolean> => {
    const success = await resetPassword(values);
    if (success) navigate('/login');
    return success;
  };

  const handleSendCode = async (email: string): Promise<boolean> => {
    return sendCode({ email, type: 'reset_password' });
  };

  const footer = (
    <Text>
      想起密码了？ <Link to="/login">返回登录</Link>
    </Text>
  );

  return (
    <AuthLayout title="重置密码" subtitle="通过邮箱验证码重置密码" footer={footer}>
      <ResetPasswordForm
        onSubmit={handleResetPassword}
        onSendCode={handleSendCode}
        loading={loading}
      />
    </AuthLayout>
  );
}
