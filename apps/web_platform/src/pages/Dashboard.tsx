import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../api/auth';
import './Auth.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>OrangeHome 低代码平台</h1>
        <div className="user-info">
          <span>欢迎，{user?.email || '用户'}</span>
          <button className="logout-button" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>🎉 登录成功</h2>
          <p>
            欢迎来到 OrangeHome 低代码平台！<br /><br />
            这里是你登录后的主页面。你可以在此基础上开发：<br />
            - 项目列表<br />
            - 应用编辑器<br />
            - 组件库管理<br />
            - 数据源配置<br />
            - 部署发布
          </p>
        </div>
      </main>
    </div>
  );
}
