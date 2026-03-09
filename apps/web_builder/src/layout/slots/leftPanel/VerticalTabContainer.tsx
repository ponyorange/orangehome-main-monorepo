/**
 * VerticalTabContainer - 左侧面板 Tab 容器
 * 管理 leftPanelTab 类型的插槽，以竖向 Tab 形式展示
 */

import React, { useState, useMemo } from 'react';
import { useSlots } from '../../LayoutContext';
import type { TabSlot } from '../../types';

export function VerticalTabContainer() {
  const tabs = useSlots('leftPanelTab') as TabSlot[];
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.tabId || '');

  // 当 tabs 变化时，确保有选中的 tab
  const activeTab = useMemo(() => {
    const found = tabs.find((t) => t.tabId === activeTabId);
    if (!found && tabs.length > 0) {
      return tabs[0];
    }
    return found;
  }, [tabs, activeTabId]);

  if (tabs.length === 0) {
    return (
      <div style={{ padding: 24, color: '#999', fontSize: 12, textAlign: 'center' }}>
        暂无功能模块
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
      }}
    >
      {/* Tab 导航（竖向） */}
      <div
        style={{
          width: 48,
          flexShrink: 0,
          background: '#fafafa',
          borderRight: '1px solid var(--semi-color-border, #eee)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.tabId === activeTab?.tabId;
          return (
            <button
              key={tab.tabId}
              onClick={() => setActiveTabId(tab.tabId)}
              style={{
                width: 48,
                height: 56,
                border: 'none',
                background: isActive ? '#fff' : 'transparent',
                borderLeft: isActive ? '2px solid #ff6b00' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: isActive ? '#ff6b00' : '#666',
                fontSize: 11,
              }}
              title={tab.title}
            >
              {tab.icon ? (
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
              ) : (
                <span
                  style={{
                    width: 20,
                    height: 20,
                    background: isActive ? '#ff6b00' : '#ccc',
                    borderRadius: 4,
                  }}
                />
              )}
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 40 }}>
                {tab.title || tab.tabId}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 内容区 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#fff',
        }}
      >
        {activeTab ? (
          <TabContent slot={activeTab} />
        ) : (
          <div style={{ padding: 24, color: '#999' }}>请选择一个功能</div>
        )}
      </div>
    </div>
  );
}

function TabContent({ slot }: { slot: TabSlot }) {
  const Component = slot.component;
  return (
    <div style={{ height: '100%' }}>
      <Component />
    </div>
  );
}

export default VerticalTabContainer;
