import { Layout, Nav, Avatar, Dropdown, Toast } from '@douyinfe/semi-ui';
import { IconHome, IconAppCenter, IconSetting, IconExit } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './DashboardContainer.scss';

const { Header, Sider, Content } = Layout;

/**
 * Dashboard 页面容器
 */
export function DashboardContainer() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { itemKey: 'home', text: '首页', icon: <IconHome /> },
    { itemKey: 'apps', text: '应用管理', icon: <IconAppCenter /> },
    { itemKey: 'settings', text: '系统设置', icon: <IconSetting /> },
  ];

  const dropDownItems = [
    { node: 'item', name: '个人中心', onClick: () => Toast.info('个人中心') },
    { node: 'item', name: '退出登录', icon: <IconExit />, onClick: handleLogout },
  ];

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <div className="dashboard-header__logo">
          <IconAppCenter size="large" />
          <span>OrangeHome</span>
        </div>
        <div className="dashboard-header__actions">
          <Dropdown menu={dropDownItems} position="bottomRight">
            <div className="dashboard-header__user">
              <Avatar size="small" style={{ marginRight: 8 }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <span>{user?.email || '用户'}</span>
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
            <h1>🎉 欢迎使用 OrangeHome 低代码平台</h1>
            <p>这里是你登录后的主页面。你可以在此基础上开发：</p>
            <ul>
              <li>项目列表管理</li>
              <li>可视化应用编辑器</li>
              <li>组件库管理</li>
              <li>数据源配置</li>
              <li>部署发布流程</li>
            </ul>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardContainer;
