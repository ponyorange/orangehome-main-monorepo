import { Layout, Nav, Avatar, Dropdown, Toast, Button, Select } from '@douyinfe/semi-ui';
import { 
  IconHome, 
  IconAppCenter, 
  IconSetting, 
  IconExit,
  IconSun,
  IconMoon,
  IconLanguage
} from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import type { Theme, Language } from '@/store/appStore';
import './DashboardContainer.scss';

const { Header, Sider, Content } = Layout;

interface DashboardContainerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onToggleTheme: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

/**
 * Dashboard 页面容器
 */
export function DashboardContainer({
  theme,
  onThemeChange,
  onToggleTheme,
  language,
  onLanguageChange,
}: DashboardContainerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    Toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  const navItems = [
    { itemKey: 'home', text: t('common.welcome'), icon: <IconHome /> },
    { itemKey: 'apps', text: '应用管理', icon: <IconAppCenter /> },
    { itemKey: 'settings', text: t('common.settings'), icon: <IconSetting /> },
  ];

  const dropDownItems = [
    { node: 'item', name: '个人中心', onClick: () => Toast.info('个人中心') },
    { node: 'item', name: t('auth.logout'), icon: <IconExit />, onClick: handleLogout },
  ];

  const themeOptions = [
    { value: 'light', label: t('theme.light') },
    { value: 'dark', label: t('theme.dark') },
    { value: 'semi-dark', label: t('theme.semiDark') },
  ];

  const languageOptions = [
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' },
  ];

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <div className="dashboard-header__logo">
          <IconAppCenter size="large" />
          <span>OrangeHome</span>
        </div>
        
        <div className="dashboard-header__actions">
          {/* 主题切换 */}
          <Select
            value={theme}
            onChange={(value) => onThemeChange(value as Theme)}
            optionList={themeOptions}
            prefix={<IconSun />}
            style={{ width: 140, marginRight: 12 }}
          />
          
          {/* 语言切换 */}
          <Select
            value={language}
            onChange={(value) => onLanguageChange(value as Language)}
            optionList={languageOptions}
            prefix={<IconLanguage />}
            style={{ width: 120, marginRight: 12 }}
          />
          
          <Dropdown menu={dropDownItems} position="bottomRight">
            <div className="dashboard-header__user">
              <Avatar size="small" style={{ marginRight: 8 }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <span>{user?.email || t('auth.username')}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Sider className="dashboard-sider">
          <Nav
            items={navItems}
            defaultSelectedKeys={['home']}
            style={{ maxWidth: 220, height: '100%' }}
          />
        </Sider>
        
        <Content className="dashboard-content">
          <div className="dashboard-content__wrapper">
            <h1>🎉 {t('common.welcome')} OrangeHome</h1>
            <p>这里是你登录后的主页面。你可以在此基础上开发：</p>
            <ul>
              <li>项目列表管理</li>
              <li>可视化应用编辑器</li>
              <li>组件库管理</li>
              <li>数据源配置</li>
              <li>部署发布流程</li>
            </ul>
            
            {/* 演示多语言使用 */}
            <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <h3>{t('common.settings')}</h3>
              <p>{t('theme.switch')}: {t(`theme.${theme.replace('-', '')}`)}</p>
              <p>{t('language.switch')}: {language === 'zh-CN' ? '中文' : 'English'}</p>
              <p>{t('common.loading')}</p>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardContainer;
