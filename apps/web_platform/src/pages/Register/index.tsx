import React, { useState } from 'react';
import { Form, Input, Button, Typography, Toast } from '@douyinfe/semi-ui';
import { IconLock, IconUser, IconKey, IconMail } from '@douyinfe/semi-icons';
import { Link, useNavigate } from 'react-router-dom';
import { register, sendEmailCode } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import './index.scss';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [formApi, setFormApi] = useState<any>(null);
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
    password: string;
    confirmPassword: string;
    code: string;
    nickname?: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      Toast.error('两次密码输入不一致');
      return;
    }
    setLoading(true);
    try {
      const response = await register(values);
      storeLogin({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        user: {
          id: response.id,
          email: response.email,
          nickname: response.nickname,
        },
      });
      Toast.success('注册成功');
      navigate('/projects');
    } catch (error: any) {
      Toast.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-header">
          <Title heading={3}>创建账号</Title>
          <Text type="tertiary">加入 OrangeHome 开始搭建</Text>
        </div>

        <Form className="auth-form" onSubmit={handleSubmit} getFormApi={setFormApi}>
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
            field="nickname"
            label="昵称"
            placeholder="请输入昵称（可选）"
            prefix={<IconUser />}
          />

          <Form.Input
            field="password"
            label="密码"
            type="password"
            placeholder="请输入密码（6-50位）"
            prefix={<IconLock />}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          />

          <Form.Input
            field="confirmPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            prefix={<IconLock />}
            rules={[{ required: true, message: '请确认密码' }]}
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
                onClick={() => {
                  const raw = formApi?.getValue?.('email');
                  const email = typeof raw === 'string' ? raw.trim() : '';
                  handleSendCode(email);
                }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            }
          />

          <Button type="primary" theme="solid" htmlType="submit" loading={loading} block size="large">
            注册
          </Button>
        </Form>

        <div className="auth-footer">
          <Text>已有账号？ <Link to="/login">立即登录</Link></Text>
        </div>
      </div>
    </div>
  );
};

export default Register;
