import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IconUndo, IconRedo } from '@douyinfe/semi-icons';
import { useSchemaStore } from '../../../core/store/schemaStore';

export const UndoRedoButtons: React.FC = () => {
  const { canUndo, canRedo, undo, redo } = useSchemaStore();

  return (
    <>
      <Button
        icon={<IconUndo />}
        type="tertiary"
        size="small"
        theme="borderless"
        disabled={!canUndo}
        onClick={undo}
      />
      <Button
        icon={<IconRedo />}
        type="tertiary"
        size="small"
        theme="borderless"
        disabled={!canRedo}
        onClick={redo}
      />
    </>
  );
};
