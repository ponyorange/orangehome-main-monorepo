import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconSetting } from '@douyinfe/semi-icons';
import { UndoRedoButtons } from '../../../undo-redo/components/UndoRedoButtons';

export const Actions: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginLeft: 16,
        padding: '4px 6px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.52)',
        border: '1px solid var(--theme-border-soft)',
        boxShadow: 'var(--theme-shadow-sm)',
      }}
    >
      <UndoRedoButtons />
      <div style={{ width: 1, height: 16, background: 'var(--theme-divider)', margin: '0 6px' }} />
      <Button
        icon={<IconSetting />}
        type="tertiary"
        size="small"
        style={{
          borderRadius: 999,
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid var(--theme-border-soft)',
          color: 'var(--theme-text-secondary)',
        }}
      >
        设置
      </Button>
    </div>
  );
};
