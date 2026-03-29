import React, { useEffect, useState } from 'react';
import { Form, Button, Typography, Toast } from '@douyinfe/semi-ui';
import { IconMail, IconLock } from '@douyinfe/semi-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail } from '@/utils/validators';
import { LoginMarketingPanel } from '@/components/LoginMarketingPanel';
import '@/styles/auth-theme.scss';
import './index.scss';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login: storeLogin } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const expired =
      sessionStorage.getItem('authExpired') === '1' ||
      sessionStorage.getItem('authExpiredMessage');
    if (expired) {
      Toast.warning(t('loginPage.sessionExpired'));
      sessionStorage.removeItem('authExpired');
      sessionStorage.removeItem('authExpiredMessage');
    }
  }, [t]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      storeLogin(response);
      Toast.success(t('auth.loginSuccess'));
      navigate('/projects');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      Toast.error(message || t('loginPage.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-premium">
      <div className="login-page-premium__shell">
        <aside className="login-page-premium__left">
          <LoginMarketingPanel />
        </aside>
        <section className="login-page-premium__right">
          <div className="login-page-premium__card">
            <div className="login-page-premium__form-head">
              <Title heading={3}>{t('loginPage.welcomeTitle')}</Title>
              <Text type="tertiary">{t('loginPage.welcomeSubtitle')}</Text>
            </div>
            <Title heading={5} className="login-page-premium__form-title">
              {t('loginPage.formTitle')}
            </Title>
            <Text type="tertiary" size="small" className="login-page-premium__form-hint">
              {t('loginPage.formHint')}
            </Text>

            <Form layout="vertical" className="login-page-premium__form" onSubmit={handleSubmit}>
              <Form.Input
                field="email"
                label={t('auth.email')}
                placeholder={t('loginPage.emailPlaceholder')}
                prefix={<IconMail />}
                rules={[
                  {
                    required: true,
                    message: t('validation.required', { field: t('auth.email') }),
                  },
                ]}
                validate={(val) => {
                  if (!val) return t('validation.required', { field: t('auth.email') });
                  if (!isValidEmail(val)) return t('validation.invalidEmail');
                  return '';
                }}
              />
              <Form.Input
                field="password"
                label={t('auth.password')}
                type="password"
                placeholder={t('loginPage.passwordPlaceholder')}
                prefix={<IconLock />}
                rules={[
                  {
                    required: true,
                    message: t('validation.required', { field: t('auth.password') }),
                  },
                ]}
              />
              <Button
                type="primary"
                htmlType="submit"
                theme="solid"
                loading={loading}
                block
                size="large"
                className="login-page-premium__submit"
              >
                {t('loginPage.submit')}
              </Button>
            </Form>

            <div className="login-page-premium__footer">
              <div className="login-page-premium__footer-line">
                <Text className="login-page-premium__footer-text">
                  {t('auth.noAccount')}
                </Text>
                <Link to="/register" className="login-page-premium__footer-link">
                  {t('auth.goRegister')}
                </Link>
              </div>
              <div className="login-page-premium__footer-sep" aria-hidden />
              <Link to="/reset-password" className="login-page-premium__forgot">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
