import React from 'react';
import { Ruler } from './Ruler';

export interface RulerXProps {
  /** 画布宽度 */
  canvasWidth: number;
  /** 缩放比例 */
  zoom: number;
  /** 滚动偏移 X */
  scrollX?: number;
}

/**
 * 水平标尺组件
 * 显示在画布上方
 */
export const RulerX: React.FC<RulerXProps> = ({ canvasWidth, zoom, scrollX = 0 }) => {
  return (
    <div style={{
      height: 24,
      overflow: 'hidden',
      background: '#f5f5f5',
      borderBottom: '1px solid #d9d9d9',
    }}>
      <Ruler
        direction="horizontal"
        canvasWidth={canvasWidth}
        canvasHeight={0}
        zoom={zoom}
        scrollX={scrollX}
        size={24}
      />
    </div>
  );
};
