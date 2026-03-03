import { Layout, Typography, Card } from '@douyinfe/semi-ui';
import { IconCode } from '@douyinfe/semi-icons';
import './AuthLayout.scss';

const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

/**
 * 认证页面布局
 */
export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <Layout className="auth-layout">
      <div className="auth-layout__background">
        <div className="auth-layout__gradient" />
      </div>
      
      <div className="auth-layout__content">
        <div className="auth-layout__header">
          <div className="auth-layout__logo">
            <IconCode size="large" />
            <Title heading={3} style={{ margin: 0 }}>OrangeHome</Title>
          </div>
          <Text type="secondary">低代码应用开发平台</Text>
        </div>

        <Card className="auth-layout__card" shadows="hover">
          <div className="auth-layout__form-header">
            <Title heading={4} style={{ margin: '0 0 8px 0' }}>{title}</Title>
            {subtitle && <Text type="tertiary">{subtitle}</Text>}
          </div>
          
          <div className="auth-layout__form-content">
            {children}
          </div>

          {footer && (
            <div className="auth-layout__footer">
              {footer}
            </div>
          )}
        </Card>

        <div className="auth-layout__copyright">
          <Text type="tertiary" size="small">
            © 2026 OrangeHome. All rights reserved.
          </Text>
        </div>
      </div>
    </Layout>
  );
}

export default AuthLayout;
