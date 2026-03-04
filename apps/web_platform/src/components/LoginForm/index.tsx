import { Form, Button } from '@douyinfe/semi-ui';
import { IconMail, IconLock } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { LoginParams } from '@/types/auth';
import { isValidEmail } from '@/utils/validators';
import './LoginForm.scss';

interface LoginFormProps {
  onSubmit: (values: LoginParams) => Promise<boolean>;
  loading?: boolean;
}

/**
 * 登录表单组件
 */
export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const { t } = useTranslation();

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
          label={t('auth.email')}
          placeholder={t('validation.required', { field: t('auth.email') })}
          prefix={<IconMail />}
          validate={(val) => {
            if (!val) return t('validation.required', { field: t('auth.email') });
            if (!isValidEmail(val)) return t('validation.invalidEmail');
            return '';
          }}
          rules={[{ required: true, message: t('validation.required', { field: t('auth.email') }) }]}
        />

        <Form.Input
          field="password"
          label={t('auth.password')}
          type="password"
          placeholder={t('validation.required', { field: t('auth.password') })}
          prefix={<IconLock />}
          rules={[{ required: true, message: t('validation.required', { field: t('auth.password') }) }]}
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
          {t('auth.login')}
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
