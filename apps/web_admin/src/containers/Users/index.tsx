import { Card, Typography } from '@douyinfe/semi-ui';

const { Title } = Typography;

export function Users() {
  return (
    <Card title="用户管理">
      <Title heading={5}>用户列表</Title>
      <p style={{ color: 'var(--semi-color-text-1)' }}>此处可接入用户管理功能</p>
    </Card>
  );
}
