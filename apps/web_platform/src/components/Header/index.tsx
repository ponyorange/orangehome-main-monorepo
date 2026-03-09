import React from 'react';
import { Nav, Avatar, Dropdown, Typography } from '@douyinfe/semi-ui';
import { IconUser, IconSetting, IconExit, IconHome } from '@douyinfe/semi-icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './index.scss';

const { Text } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      node: 'item',
      name: '个人信息',
      icon: <IconUser />,
      onClick: () => navigate('/profile'),
    },
    {
      node: 'item',
      name: '设置',
      icon: <IconSetting />,
      onClick: () => navigate('/settings'),
    },
    {
      node: 'divider',
    },
    {
      node: 'item',
      name: '退出登录',
      icon: <IconExit />,
      onClick: handleLogout,
    },
  ];

  // 判断当前路由
  const isProjects = location.pathname.startsWith('/projects');

  return (
    <Nav
      mode="horizontal"
      className="main-header"
      header={{
        logo: <div className="header-logo">OrangeHome</div>,
        text: '无代码搭建平台',
      }}
      items={[
        {
          itemKey: 'projects',
          text: '项目管理',
          icon: <IconHome />,
          onClick: () => navigate('/projects'),
          active: isProjects,
        },
      ]}
      footer={
        isAuthenticated && user ? (
          <Dropdown
            position="bottomRight"
            menu={userDropdownItems}
            trigger="click"
          >
            <div className="user-info">
              <Avatar size="small" src={user.avatar}>
                {user.nickname?.[0] || user.email[0]}
              </Avatar>
              <Text className="user-name">
                {user.nickname || user.email}
              </Text>
            </div>
          </Dropdown>
        ) : (
          <div className="auth-buttons">
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </div>
        )
      }
    />
  );
};

export default Header;
