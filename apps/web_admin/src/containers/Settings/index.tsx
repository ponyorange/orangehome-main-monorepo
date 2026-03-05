import { Card, Typography } from '@douyinfe/semi-ui';

const { Title } = Typography;

export function Settings() {
  return (
    <Card title="系统设置">
      <Title heading={5}>系统参数配置</Title>
      <p style={{ color: 'var(--semi-color-text-1)' }}>此处可接入系统配置功能</p>
    </Card>
  );
}
