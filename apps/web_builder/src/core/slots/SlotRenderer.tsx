import React from 'react';
import { SlotRegistry } from './SlotRegistry';
import { getService } from '../container';

interface SlotRendererProps {
  /** 插槽名称 */
  slotName: string;
  /** 传递给子组件的额外属性 */
  childProps?: Record<string, any>;
  /** 渲染包裹容器 */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /** 空状态渲染 */
  emptyRender?: React.ReactNode;
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 插槽渲染组件
 * 根据插槽名称渲染该插槽下的所有内容
 */
export const SlotRenderer: React.FC<SlotRendererProps> = ({
  slotName,
  childProps = {},
  wrapper: Wrapper,
  emptyRender = null,
  direction = 'horizontal',
  style,
  className,
}) => {
  // 获取 SlotRegistry 服务
  const slotRegistry = getService(SlotRegistry);
  const contents = slotRegistry.getContents(slotName);

  if (contents.length === 0) {
    return <>{emptyRender}</>;
  }

  const isVertical = direction === 'vertical';

  // 从 childProps 中提取 key，避免传递给子组件
  const { key: _childKey, ...safeChildProps } = childProps || {};

  const elements = contents.map(content => {
    const Component = content.component;
    // 从 config 中提取 key，避免传递给子组件
    const { key: _configKey, flex: _flex, ...configWithoutKey } = content.config || {};
    const componentProps = {
      ...safeChildProps,
      ...configWithoutKey,
    };
    // 横向布局下 flex: 0 在浏览器中等价于 basis 0%，会把插槽压成 0 宽导致无法点击；需用 0 0 auto 保留内容宽度
    const horizontalFlex =
      content.config?.flex === undefined || content.config?.flex === null
        ? 1
        : content.config.flex === 0
          ? '0 0 auto'
          : content.config.flex;
    // 竖向插槽默认按内容高度；显式 config.flex === 1 时占满剩余高度（如右侧面板 Inspector）
    const verticalFlex =
      content.config?.flex === 1
        ? 1
        : content.config?.flex === 0
          ? '0 0 auto'
          : '0 0 auto';
    return (
      <div
        key={content.id}
        style={{
          flex: isVertical ? verticalFlex : horizontalFlex,
          minHeight: isVertical && content.config?.flex === 1 ? 0 : undefined,
        }}
        data-slot-content={content.id}
      >
        <Component {...componentProps} />
      </div>
    );
  });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    height: '100%',
    ...style,
  };

  const content = <div className={className} style={containerStyle}>{elements}</div>;

  if (Wrapper) {
    return <Wrapper>{content}</Wrapper>;
  }

  return content;
};

export default SlotRenderer;
