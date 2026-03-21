import React from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';

export const ImageComponent: React.FC<SchemaComponentProps> = React.memo(({ schema, eventHandlers }) => {
  const src = (schema.props?.src as string) ?? '';
  const alt = (schema.props?.alt as string) ?? '';
  const style = (schema.props?.style as React.CSSProperties) ?? {};

  return (
    <img
      src={src}
      alt={alt}
      style={{
        display: 'block',
        maxWidth: '100%',
        ...style,
      }}
      {...(eventHandlers as React.ImgHTMLAttributes<HTMLImageElement> | undefined)}
    />
  );
});
