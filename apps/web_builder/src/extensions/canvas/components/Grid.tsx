import React from 'react';

interface GridProps {
  /** 网格大小（像素） */
  gridSize?: number;
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 缩放比例 */
  zoom?: number;
  /** 是否显示 */
  visible?: boolean;
}

/**
 * 画布网格组件
 * 使用 SVG 绘制虚线网格
 */
export const Grid: React.FC<GridProps> = ({
  gridSize = 20,
  width,
  height,
  zoom = 1,
  visible = true,
}) => {
  if (!visible) return null;

  // 根据缩放调整网格密度
  const adjustedGridSize = gridSize * zoom;
  
  // 计算网格线数量
  const cols = Math.ceil(width / adjustedGridSize);
  const rows = Math.ceil(height / adjustedGridSize);

  // 生成垂直线
  const verticalLines = Array.from({ length: cols + 1 }, (_, i) => (
    <line
      key={`v-${i}`}
      x1={i * adjustedGridSize}
      y1={0}
      x2={i * adjustedGridSize}
      y2={height}
      stroke="var(--theme-grid-line)"
      strokeWidth={1 / zoom}
      strokeDasharray={`${2 / zoom} ${5 / zoom}`}
    />
  ));

  // 生成水平线
  const horizontalLines = Array.from({ length: rows + 1 }, (_, i) => (
    <line
      key={`h-${i}`}
      x1={0}
      y1={i * adjustedGridSize}
      x2={width}
      y2={i * adjustedGridSize}
      stroke="var(--theme-grid-line)"
      strokeWidth={1 / zoom}
      strokeDasharray={`${2 / zoom} ${5 / zoom}`}
    />
  ));

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {verticalLines}
      {horizontalLines}
    </svg>
  );
};
