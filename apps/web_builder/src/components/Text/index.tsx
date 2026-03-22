import React from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';
import { getResolvedInlineStyle } from '../../common/base/schemaOperator';

export const TextComponent: React.FC<SchemaComponentProps> = React.memo(({ schema, eventHandlers }) => {
  const text = (schema.props?.text as string) ?? '';
  const style = getResolvedInlineStyle(schema) as React.CSSProperties;

  return (
    <div style={style} {...(eventHandlers as React.HTMLAttributes<HTMLDivElement> | undefined)}>
      {text}
    </div>
  );
});
