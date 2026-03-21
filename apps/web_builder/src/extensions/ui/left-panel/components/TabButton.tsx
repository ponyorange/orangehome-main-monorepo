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
        borderRadius: 18,
        borderLeft: 'none',
        padding: '0',
        margin: '0 8px',
        background: isActive ? 'var(--theme-gradient-panel)' : 'rgba(255,255,255,0.36)',
        color: isActive ? primaryColor : 'var(--theme-text-secondary)',
        border: isActive ? `1px solid var(--theme-border-glow)` : '1px solid transparent',
        boxShadow: isActive ? 'var(--theme-shadow-sm)' : 'none',
        backdropFilter: 'blur(var(--theme-backdrop-blur))',
      }}
      onClick={() => setActiveTab(tabId)}
    >
      <Icon />
      <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500 }}>{title}</span>
    </Button>
  );
};
