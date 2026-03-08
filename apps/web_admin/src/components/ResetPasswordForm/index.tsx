import { useState } from 'react';
import { Form, Button, Toast } from '@douyinfe/semi-ui';
import { IconMail, IconKey, IconLock } from '@douyinfe/semi-icons';
import type { ResetPasswordParams } from '@/types/auth';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { useCountdown } from '@/hooks/useCountdown';
import './ResetPasswordForm.scss';

interface ResetPasswordFormProps {
  onSubmit: (values: ResetPasswordParams) => Promise<boolean>;
  onSendCode: (email: string) => Promise<boolean>;
  loading?: boolean;
}

/**
 * 重置密码表单
 */
export function ResetPasswordForm({
  onSubmit,
  onSendCode,
  loading = false,
}: ResetPasswordFormProps) {
  const [formApi, setFormApi] = useState<{ getValue: (key: string) => string } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, startCountdown, , isCounting] = useCountdown(60);

  const handleSendCode = async () => {
    const email = formApi?.getValue('email');
    if (!email) {
      Toast.error('请先输入邮箱');
      return;
    }
    if (!isValidEmail(email)) {
      Toast.error('邮箱格式不正确');
      return;
    }
    setCodeLoading(true);
    const success = await onSendCode(email);
    setCodeLoading(false);
    if (success) startCountdown();
  };

  const handleSubmit = async (values: ResetPasswordParams & { confirmPassword?: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      Toast.error('两次输入的新密码不一致');
      return;
    }
    if (!isValidPassword(values.newPassword)) {
      Toast.error('密码至少6位');
      return;
    }
    await onSubmit({
      email: values.email,
      code: values.code,
      newPassword: values.newPassword,
    });
  };

  return (
    <div className="reset-password-form">
      <Form
        onSubmit={handleSubmit}
        layout="vertical"
        className="reset-password-form__container"
        getFormApi={setFormApi}
      >
        <Form.Input
          field="email"
          label="邮箱"
          placeholder="请输入注册邮箱"
          prefix={<IconMail />}
          validate={(val) => {
            if (!val) return '请输入邮箱';
            if (!isValidEmail(val)) return '邮箱格式不正确';
            return '';
          }}
          rules={[{ required: true, message: '请输入邮箱' }]}
        />
        <Form.Input
          field="code"
          label="验证码"
          placeholder="请输入6位验证码"
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
          rules={[{ required: true, message: '请输入验证码' }]}
        />
        <Form.Input
          field="newPassword"
          label="新密码"
          type="password"
          placeholder="至少6位密码"
          prefix={<IconLock />}
          validate={(val) => {
            if (!val) return '请输入新密码';
            if (!isValidPassword(val)) return '密码至少6位';
            return '';
          }}
          rules={[{ required: true, message: '请输入新密码' }]}
        />
        <Form.Input
          field="confirmPassword"
          label="确认新密码"
          type="password"
          placeholder="请再次输入新密码"
          prefix={<IconLock />}
          rules={[{ required: true, message: '请再次输入新密码' }]}
        />
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          theme="solid"
        >
          重置密码
        </Button>
      </Form>
    </div>
  );
}
