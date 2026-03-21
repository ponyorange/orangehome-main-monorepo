import React from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';

export const ButtonComponent: React.FC<SchemaComponentProps> = React.memo(({ schema, eventHandlers }) => {
  const text = (schema.props?.text as string) ?? '按钮';
  const style = (schema.props?.style as React.CSSProperties) ?? {};

  return (
    <button
      style={{
        padding: '6px 16px',
        borderRadius: 4,
        border: '1px solid var(--theme-primary, #e07a3f)',
        background: 'var(--theme-primary, #e07a3f)',
        color: '#fff',
        fontSize: 14,
        cursor: 'pointer',
        ...style,
      }}
      {...(eventHandlers as React.ButtonHTMLAttributes<HTMLButtonElement> | undefined)}
    >
      {text}
    </button>
  );
});
