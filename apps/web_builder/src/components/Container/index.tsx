import React from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';

export const ContainerComponent: React.FC<SchemaComponentProps> = React.memo(({ schema, children, eventHandlers }) => {
  const style = (schema.props?.style as React.CSSProperties) ?? {};

  return (
    <div
      style={style}
      data-schema-id={schema.id}
      {...(eventHandlers as React.HTMLAttributes<HTMLDivElement> | undefined)}
    >
      {children}
    </div>
  );
});
