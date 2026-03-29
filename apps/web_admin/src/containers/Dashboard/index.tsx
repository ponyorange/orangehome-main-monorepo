import { Card, Row, Col, Typography, Spin } from '@douyinfe/semi-ui';
import { IconUser, IconSetting, IconActivity } from '@douyinfe/semi-icons';
import useSWR from 'swr';
import { authStorage } from '@/services/auth';
import { userApi } from '@/services/user';
import './Dashboard.scss';

const { Title, Text } = Typography;

export function Dashboard() {
  const user = authStorage.getUser();

  const { data: userListRes, isLoading: userTotalLoading, error: userTotalError } = useSWR(
    ['dashboard', 'user-total'],
    () => userApi.getList({ page: 1, pageSize: 1 }),
    { revalidateOnFocus: false }
  );

  const userTotalDisplay = userTotalError ? (
    '—'
  ) : userTotalLoading ? (
    <Spin size="small" />
  ) : (
    String(userListRes?.total ?? 0)
  );

  const cards = [
    { title: '用户总数', value: userTotalDisplay, icon: <IconUser size="large" /> },
    { title: '今日访问', value: '0', icon: <IconActivity size="large" /> },
    { title: '系统状态', value: '正常', icon: <IconSetting size="large" /> },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <Title heading={3}>工作台</Title>
        <Text type="secondary">欢迎回来，{user?.email || '管理员'}</Text>
      </div>
      <Row gutter={[16, 16]} className="dashboard__cards">
        {cards.map((item) => (
          <Col key={item.title} span={8}>
            <Card className="dashboard__card" shadows="hover">
              <div className="dashboard__card-content">
                <div className="dashboard__card-icon">{item.icon}</div>
                <div>
                  <Text type="secondary">{item.title}</Text>
                  <Title heading={4} style={{ margin: '8px 0 0' }}>{item.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="dashboard__info" title="快速开始" shadows="hover">
        <ul>
          <li>用户管理：管理系统用户与权限</li>
          <li>系统设置：配置系统参数与偏好</li>
          <li>数据统计：查看运营数据与报表</li>
        </ul>
      </Card>
    </div>
  );
}
