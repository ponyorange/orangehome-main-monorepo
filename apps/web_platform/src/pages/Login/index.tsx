import React, { useState } from 'react';
import { Form, Input, Button, Typography, Toast } from '@douyinfe/semi-ui';
import { IconLock, IconUser } from '@douyinfe/semi-icons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import './index.scss';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      storeLogin(response);
      Toast.success('登录成功');
      navigate('/projects');
    } catch (error: any) {
      Toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-header">
          <Title heading={3}>欢迎登录</Title>
          <Text type="tertiary">OrangeHome 无代码搭建平台</Text>
        </div>

        <Form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <Form.Input
            field="email"
            label="邮箱"
            placeholder="请输入邮箱"
            prefix={<IconUser />}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          />

          <Form.Input
            field="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            prefix={<IconLock />}
            rules={[{ required: true, message: '请输入密码' }]}
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            登录
          </Button>
        </Form>

        <div className="auth-footer">
          <Text>还没有账号？ <Link to="/register">立即注册</Link></Text>
          <br />
          <Link to="/reset-password">忘记密码？</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
