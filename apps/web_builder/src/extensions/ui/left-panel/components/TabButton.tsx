import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useLeftPanelStore } from '../store';

interface TabButtonProps {
  tabId: string;
  title: string;
  icon: React.ComponentType;
}

export const TabButton: React.FC<TabButtonProps> = ({
  tabId,
  title,
  icon: Icon,
}) => {
  const { activeTab, setActiveTab } = useLeftPanelStore();
  const isActive = activeTab === tabId;

  // 使用CSS变量获取主题色
  const primaryColor = 'var(--theme-primary)';
  const primaryLight = 'var(--theme-primary-light-bg)';

  return (
    <Button
      type="tertiary"
      theme="borderless"
      style={{
        width: '48px',
        height: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        borderRadius: 0,
        borderLeft: isActive ? `3px solid ${primaryColor}` : '3px solid transparent',
        padding: '0',
        backgroundColor: isActive ? primaryLight : 'transparent',
        color: isActive ? primaryColor : '#666',
      }}
      onClick={() => setActiveTab(tabId)}
    >
      <Icon />
      <span style={{ fontSize: '12px' }}>{title}</span>
    </Button>
  );
};
