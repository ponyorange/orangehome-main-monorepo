import React, { useState } from 'react';
import { Form, Input, Button, Typography, Toast } from '@douyinfe/semi-ui';
import { IconLock, IconKey, IconMail } from '@douyinfe/semi-icons';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword, sendEmailCode } from '../../api/auth';
import './index.scss';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async (email: string) => {
    if (!email) {
      Toast.error('请输入邮箱');
      return;
    }
    setSendingCode(true);
    try {
      await sendEmailCode(email);
      Toast.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      Toast.error(error.message || '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (values: {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      Toast.error('两次密码输入不一致');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
      });
      Toast.success('密码重置成功');
      navigate('/login');
    } catch (error: any) {
      Toast.error(error.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page reset-page">
      <div className="auth-container">
        <div className="auth-header">
          <Title heading={3}>重置密码</Title>
          <Text type="tertiary">验证邮箱后重置您的密码</Text>
        </div>

        <Form className="auth-form" onSubmit={handleSubmit}>
          <Form.Input
            field="email"
            label="邮箱"
            placeholder="请输入邮箱"
            prefix={<IconMail />}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          />

          <Form.Input
            field="code"
            label="验证码"
            placeholder="请输入验证码"
            prefix={<IconKey />}
            rules={[{ required: true, message: '请输入验证码' }]}
            suffix={
              <Button
                type="tertiary"
                loading={sendingCode}
                disabled={countdown > 0}
                onClick={(e: any) => {
                  const email = (e.target as HTMLElement)
                    .closest('.semi-form')?.querySelector('input[name="email"]') as HTMLInputElement;
                  handleSendCode(email?.value);
                }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            }
          />

          <Form.Input
            field="newPassword"
            label="新密码"
            type="password"
            placeholder="请输入新密码（6-50位）"
            prefix={<IconLock />}
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          />

          <Form.Input
            field="confirmPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入新密码"
            prefix={<IconLock />}
            rules={[{ required: true, message: '请确认密码' }]}
          />

          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            重置密码
          </Button>
        </Form>

        <div className="auth-footer">
          <Text>想起密码了？ <Link to="/login">返回登录</Link></Text>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
