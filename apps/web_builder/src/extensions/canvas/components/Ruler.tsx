import React from 'react';

interface RulerProps {
  /** 方向 */
  direction: 'horizontal' | 'vertical';
  /** 长度（像素） */
  length: number;
  /** 缩放比例 */
  zoom?: number;
  /** 刻度间隔 */
  tickInterval?: number;
}

/**
 * 标尺组件
 * 显示坐标刻度
 */
export const Ruler: React.FC<RulerProps> = ({
  direction,
  length,
  zoom = 1,
  tickInterval = 50,
}) => {
  const isHorizontal = direction === 'horizontal';
  
  // 根据缩放调整刻度密度
  const adjustedInterval = tickInterval * zoom;
  
  // 生成刻度
  const ticks = [];
  const count = Math.ceil(length / adjustedInterval);
  
  for (let i = 0; i <= count; i++) {
    const pos = i * adjustedInterval;
    if (pos > length) break;
    
    const value = Math.round(pos / zoom);
    
    ticks.push(
      <g key={i}>
        {/* 主刻度线 */}
        <line
          x1={isHorizontal ? pos : 0}
          y1={isHorizontal ? 0 : pos}
          x2={isHorizontal ? pos : 12}
          y2={isHorizontal ? 12 : pos}
          stroke="#999"
          strokeWidth={1}
        />
        {/* 刻度值 */}
        <text
          x={isHorizontal ? pos + 2 : 14}
          y={isHorizontal ? 10 : pos + 3}
          fontSize={10}
          fill="#666"
          style={{ userSelect: 'none' }}
        >
          {value}
        </text>
      </g>
    );
  }

  return (
    <svg
      width={isHorizontal ? length : 24}
      height={isHorizontal ? 24 : length}
      style={{
        background: '#fafafa',
        borderRight: isHorizontal ? undefined : '1px solid #e0e0e0',
        borderBottom: isHorizontal ? '1px solid #e0e0e0' : undefined,
      }}
    >
      {ticks}
    </svg>
  );
};
