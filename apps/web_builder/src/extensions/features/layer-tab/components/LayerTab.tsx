import React from 'react';
import { TabButton } from '../../../ui/left-panel';
import { IconLayers } from '@douyinfe/semi-icons';

export const LayerTab: React.FC = () => {
  return (
    <TabButton
      tabId="layer"
      title="图层"
      icon={IconLayers}
    />
  );
};
