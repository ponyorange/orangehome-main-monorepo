import React from 'react';
import { Ruler } from './Ruler';

export interface RulerYProps {
  /** 画布高度 */
  canvasHeight: number;
  /** 缩放比例 */
  zoom: number;
  /** 滚动偏移 Y */
  scrollY?: number;
}

/**
 * 垂直标尺组件
 * 显示在画布左侧
 */
export const RulerY: React.FC<RulerYProps> = ({ canvasHeight, zoom, scrollY = 0 }) => {
  return (
    <div style={{
      width: 24,
      height: '100%',
      overflow: 'hidden',
      background: '#f5f5f5',
      borderRight: '1px solid #d9d9d9',
    }}>
      <Ruler
        direction="vertical"
        canvasWidth={0}
        canvasHeight={canvasHeight}
        zoom={zoom}
        scrollY={scrollY}
        size={24}
      />
    </div>
  );
};
