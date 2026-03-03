import { useNavigate, Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { AuthLayout } from '../../components/AuthLayout';
import { RegisterForm } from '../../components/RegisterForm';
import { useAuth } from '../../hooks/useAuth';
import { RegisterParams } from '../../types/auth';

const { Text } = Typography;

/**
 * 注册页面容器
 */
export function RegisterContainer() {
  const navigate = useNavigate();
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
      已有账号？<Link to="/login">立即登录</Link>
    </Text>
  );

  return (
    <AuthLayout 
      title="创建账号" 
      subtitle="加入 OrangeHome 低代码平台"
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
