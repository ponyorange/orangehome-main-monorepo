import { Layout, Nav, Avatar, Dropdown, Toast, Select } from '@douyinfe/semi-ui';
import {
  IconHome,
  IconUser,
  IconSetting,
  IconExit,
  IconAppCenter,
  IconBriefcase,
  IconFolder,
  IconFile,
} from '@douyinfe/semi-icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authStorage } from '@/services/auth';
import { useLogout } from '@/hooks/useAuth';
import { useAppStore, type Theme } from '@/store/appStore';
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname || '/';
  const logout = useLogout();
  const { theme, setTheme } = useAppStore();
  const user = authStorage.getUser();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { itemKey: '/', text: '工作台', icon: <IconHome /> },
    { itemKey: '/users', text: '用户管理', icon: <IconUser /> },
    {
      itemKey: 'materials-group',
      text: '物料管理',
      icon: <IconFolder />,
      items: [
        { itemKey: '/material-types', text: '物料类别', icon: <IconFile /> },
        { itemKey: '/material-categories', text: '物料分类', icon: <IconFolder /> },
        { itemKey: '/materials', text: '物料列表', icon: <IconFile /> },
      ],
    },
    {
      itemKey: 'platform-group',
      text: '业务管理',
      icon: <IconBriefcase />,
      items: [
        { itemKey: '/platforms', text: '平台管理', icon: <IconAppCenter /> },
        { itemKey: '/businesses', text: '业务线管理', icon: <IconBriefcase /> },
      ],
    },
    { itemKey: '/settings', text: '系统设置', icon: <IconSetting /> },
  ];

  const dropDownItems = [
    { node: 'item' as const, name: '个人中心', onClick: () => { Toast.info('个人中心'); } },
    { node: 'item' as const, name: '退出登录', icon: <IconExit />, onClick: handleLogout },
  ];

  const themeOptions = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'semi-dark', label: '半深色' },
  ];

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="admin-header__logo">
          <IconSetting size="large" />
          <span>Web Admin</span>
        </div>
        <div className="admin-header__actions">
          <Select
            value={theme}
            onChange={(v) => setTheme(v as Theme)}
            optionList={themeOptions}
            style={{ width: 120, marginRight: 16 }}
          />
          <Dropdown menu={dropDownItems} position="bottomRight">
            <div className="admin-header__user">
              <Avatar size="small">{user?.email?.charAt(0).toUpperCase() || 'U'}</Avatar>
              <span>{user?.email || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider className="admin-sider">
          <Nav
            items={navItems}
            selectedKeys={[path]}
            onSelect={(data) => navigate(data.itemKey as string)}
            style={{ maxWidth: 220, height: '100%' }}
          />
        </Sider>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
