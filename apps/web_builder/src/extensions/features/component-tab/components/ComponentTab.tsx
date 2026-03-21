import React from 'react';
import { TabButton } from '../../../ui/left-panel';
import { IconComponent } from '@douyinfe/semi-icons';

export const ComponentTab: React.FC = () => {
  return (
    <TabButton
      tabId="component"
      title="组件"
      icon={IconComponent}
    />
  );
};
