import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconSetting } from '@douyinfe/semi-icons';
import { UndoRedoButtons } from '../../../undo-redo/components/UndoRedoButtons';

export const Actions: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 16 }}>
      <UndoRedoButtons />
      <div style={{ width: 1, height: 16, background: '#d9d9d9', margin: '0 6px' }} />
      <Button icon={<IconSetting />} type="tertiary" size="small">设置</Button>
    </div>
  );
};
