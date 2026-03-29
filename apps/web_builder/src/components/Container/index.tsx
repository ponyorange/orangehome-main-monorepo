import React from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';
import { getResolvedInlineStyle } from '../../common/base/schemaOperator';

export const ContainerComponent: React.FC<SchemaComponentProps> = React.memo(({ schema, children, eventHandlers }) => {
  const style = getResolvedInlineStyle(schema) as React.CSSProperties;

  return (
    <div
      style={style}
      id={schema.id}
      {...(eventHandlers as React.HTMLAttributes<HTMLDivElement> | undefined)}
    >
      {children}
    </div>
  );
});
