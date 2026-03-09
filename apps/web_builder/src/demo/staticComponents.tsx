import React from 'react';

/** 基础 div 组件：支持 children、style、className */
export const StaticDiv: React.FC<Record<string, unknown>> = ({
  children,
  style,
  className,
  ...rest
}) => (
  <div style={style as React.CSSProperties} className={className as string} {...rest}>
    {children}
  </div>
);

/** 基础 button 组件 */
export const StaticButton: React.FC<Record<string, unknown>> = ({
  children,
  style,
  className,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    style={style as React.CSSProperties}
    className={className as string}
    onClick={onClick as React.MouseEventHandler}
    {...rest}
  >
    {children}
  </button>
);

/** 基础 image 占位组件 */
export const StaticImage: React.FC<Record<string, unknown>> = ({
  src,
  alt,
  style,
  className,
  ...rest
}) => (
  <div
    style={{
      width: 120,
      height: 80,
      background: '#eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#999',
      ...(style as object),
    }}
    className={className as string}
    {...rest}
  >
    {src ? (
      <img src={src as string} alt={(alt as string) || ''} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    ) : (
      '图片'
    )}
  </div>
);

/** Demo 用静态组件映射 */
export const DEMO_STATIC_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  div: StaticDiv,
  button: StaticButton,
  image: StaticImage,
};
