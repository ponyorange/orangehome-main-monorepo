import { useState } from 'react';
import { Form, Button, Toast } from '@douyinfe/semi-ui';
import { IconMail, IconKey, IconLock } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { RegisterParams } from '@/types/auth';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { useCountdown } from '@/hooks/useCountdown';
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
  const { t } = useTranslation();
  const [formApi, setFormApi] = useState<any>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, startCountdown, , isCounting] = useCountdown(60);

  const handleSendCode = async () => {
    const email = formApi?.getValue('email');
    
    if (!email) {
      Toast.error(t('validation.required', { field: t('auth.email') }));
      return;
    }

    if (!isValidEmail(email)) {
      Toast.error(t('validation.invalidEmail'));
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
      Toast.error(t('validation.passwordMismatch'));
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
          field="code"
          label={t('auth.confirmPassword')}
          placeholder={t('validation.required', { field: t('auth.confirmPassword') })}
          prefix={<IconKey />}
          suffix={
            <Button 
              type="tertiary" 
              size="small"
              loading={codeLoading}
              disabled={isCounting}
              onClick={handleSendCode}
            >
              {isCounting ? `${countdown}s` : '获取验证码'}
            </Button>
          }
          rules={[{ required: true, message: t('validation.required', { field: t('auth.confirmPassword') }) }]}
        />

        <Form.Input
          field="password"
          label={t('auth.password')}
          type="password"
          placeholder={t('validation.minLength', { field: t('auth.password'), length: 6 })}
          prefix={<IconLock />}
          validate={(val) => {
            if (!val) return t('validation.required', { field: t('auth.password') });
            if (!isValidPassword(val)) return t('validation.minLength', { field: t('auth.password'), length: 6 });
            return '';
          }}
          rules={[{ required: true, message: t('validation.required', { field: t('auth.password') }) }]}
        />

        <Form.Input
          field="confirmPassword"
          label={t('auth.confirmPassword')}
          type="password"
          placeholder={t('validation.required', { field: t('auth.confirmPassword') })}
          prefix={<IconLock />}
          rules={[{ required: true, message: t('validation.required', { field: t('auth.confirmPassword') }) }]}
        />

        <Button 
          type="primary" 
          htmlType="submit"
          loading={loading}
          block
          size="large"
          theme="solid"
        >
          {t('auth.register')}
        </Button>
      </Form>
    </div>
  );
}

export default RegisterForm;
