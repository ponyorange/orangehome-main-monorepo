import { useState } from 'react';
import { Form, Button, Toast } from '@douyinfe/semi-ui';
import { IconMail, IconKey, IconLock } from '@douyinfe/semi-icons';
import { RegisterParams } from '../../types/auth';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { useCountdown } from '../../hooks/useCountdown';
import './RegisterForm.scss';

interface RegisterFormProps {
  onSubmit: (values: RegisterParams) => Promise<boolean>;
  onSendCode: (email: string) => Promise<boolean>;
  loading?: boolean;
}

/**
 * 注册表单组件
 */
export function RegisterForm({ onSubmit, onSendCode, loading = false }: RegisterFormProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, startCountdown, , isCounting] = useCountdown(60);

  const handleSendCode = async () => {
    const email = formApi?.getValue('email');
    
    if (!email) {
      Toast.error('请先输入邮箱');
      return;
    }

    if (!isValidEmail(email)) {
      Toast.error('请输入有效的邮箱地址');
      return;
    }

    setCodeLoading(true);
    const success = await onSendCode(email);
    setCodeLoading(false);

    if (success) {
      startCountdown();
    }
  };

  const handleSubmit = (values: RegisterParams) => {
    if (values.password !== values.confirmPassword) {
      Toast.error('两次输入的密码不一致');
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="register-form">
      <Form 
        onSubmit={handleSubmit}
        layout="vertical"
        className="register-form__container"
        getFormApi={setFormApi}
      >
        <Form.Input
          field="email"
          label="邮箱"
          placeholder="请输入邮箱"
          prefix={<IconMail />}
          validate={(val) => {
            if (!val) return '请输入邮箱';
            if (!isValidEmail(val)) return '请输入有效的邮箱地址';
            return '';
          }}
          rules={[{ required: true, message: '请输入邮箱' }]}
        />

        <Form.Input
          field="code"
          label="验证码"
          placeholder="请输入验证码"
          prefix={<IconKey />}
          suffix={
            <Button 
              type="tertiary" 
              size="small"
              loading={codeLoading}
              disabled={isCounting}
              onClick={handleSendCode}
            >
              {isCounting ? `${countdown}秒` : '获取验证码'}
            </Button>
          }
          rules={[{ required: true, message: '请输入验证码' }]}
        />

        <Form.Input
          field="password"
          label="密码"
          type="password"
          placeholder="请设置密码（至少6位）"
          prefix={<IconLock />}
          validate={(val) => {
            if (!val) return '请输入密码';
            if (!isValidPassword(val)) return '密码至少6位';
            return '';
          }}
          rules={[{ required: true, message: '请输入密码' }]}
        />

        <Form.Input
          field="confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入密码"
          prefix={<IconLock />}
          rules={[{ required: true, message: '请确认密码' }]}
        />

        <Button 
          type="primary" 
          htmlType="submit"
          loading={loading}
          block
          size="large"
          theme="solid"
        >
          注册
        </Button>
      </Form>
    </div>
  );
}

export default RegisterForm;
