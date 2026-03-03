import { Form, Button, Toast } from '@douyinfe/semi-ui';
import { IconMail, IconLock } from '@douyinfe/semi-icons';
import { LoginParams } from '../../types/auth';
import { isValidEmail } from '../../utils/validators';
import './LoginForm.scss';

interface LoginFormProps {
  onSubmit: (values: LoginParams) => Promise<boolean>;
  loading?: boolean;
}

/**
 * 登录表单组件
 */
export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const handleSubmit = async (values: LoginParams) => {
    const success = await onSubmit(values);
    if (!success) {
      // 失败处理已在父组件完成
    }
  };

  return (
    <div className="login-form">
      <Form 
        onSubmit={handleSubmit}
        layout="vertical"
        className="login-form__container"
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
          field="password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          prefix={<IconLock />}
          rules={[{ required: true, message: '请输入密码' }]}
        />

        <Form.Checkbox field="remember" noLabel>
          记住我
        </Form.Checkbox>

        <Button 
          type="primary" 
          htmlType="submit"
          loading={loading}
          block
          size="large"
          theme="solid"
        >
          登录
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
