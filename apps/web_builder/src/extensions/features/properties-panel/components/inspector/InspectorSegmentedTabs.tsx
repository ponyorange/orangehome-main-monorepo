import React from 'react';
import styles from './inspector.module.css';

export type InspectorPanelTab = 'config' | 'info';

export interface InspectorSegmentedTabsProps {
  activeKey: InspectorPanelTab;
  onChange: (key: InspectorPanelTab) => void;
  disabled?: boolean;
  ids?: {
    tabConfig: string;
    tabInfo: string;
    panelConfig: string;
    panelInfo: string;
  };
}

const DEFAULT_IDS = {
  tabConfig: 'inspector-tab-config',
  tabInfo: 'inspector-tab-info',
  panelConfig: 'inspector-panel-config',
  panelInfo: 'inspector-panel-info',
};

export const InspectorSegmentedTabs: React.FC<InspectorSegmentedTabsProps> = ({
  activeKey,
  onChange,
  disabled = false,
  ids = DEFAULT_IDS,
}) => {
  const { tabConfig, tabInfo, panelConfig, panelInfo } = ids;

  const onTabKeyDown = (e: React.KeyboardEvent, key: InspectorPanelTab) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' && key === 'config') {
      e.preventDefault();
      onChange('info');
      document.getElementById(tabInfo)?.focus();
    } else if (e.key === 'ArrowLeft' && key === 'info') {
      e.preventDefault();
      onChange('config');
      document.getElementById(tabConfig)?.focus();
    }
  };

  return (
    <div className={styles.tabsWrap} role="tablist" aria-label="面板分区">
      <div className={styles.track}>
        <button
          type="button"
          id={tabConfig}
          role="tab"
          className={styles.tabBtn}
          aria-selected={activeKey === 'config'}
          aria-controls={panelConfig}
          tabIndex={disabled ? -1 : activeKey === 'config' ? 0 : -1}
          disabled={disabled}
          onClick={() => !disabled && onChange('config')}
          onKeyDown={(e) => onTabKeyDown(e, 'config')}
        >
          配置
        </button>
        <button
          type="button"
          id={tabInfo}
          role="tab"
          className={styles.tabBtn}
          aria-selected={activeKey === 'info'}
          aria-controls={panelInfo}
          tabIndex={disabled ? -1 : activeKey === 'info' ? 0 : -1}
          disabled={disabled}
          onClick={() => !disabled && onChange('info')}
          onKeyDown={(e) => onTabKeyDown(e, 'info')}
        >
          信息
        </button>
      </div>
    </div>
  );
};

export { DEFAULT_IDS as INSPECTOR_TAB_IDS };
