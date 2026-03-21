import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface RulerProps {
  /** 方向 */
  direction: 'horizontal' | 'vertical';
  /** 画布宽度 */
  canvasWidth: number;
  /** 画布高度 */
  canvasHeight: number;
  /** 缩放比例 */
  zoom: number;
  /** 滚动偏移 X */
  scrollX?: number;
  /** 滚动偏移 Y */
  scrollY?: number;
  /** 标尺尺寸 */
  size?: number;
  /** 刻度间隔 */
  tickInterval?: number;
}

/**
 * 标尺组件
 * 使用 HTML5 Canvas 绘制刻度
 */
export const Ruler: React.FC<RulerProps> = ({
  direction,
  canvasWidth,
  canvasHeight,
  zoom,
  scrollX = 0,
  scrollY = 0,
  size = 24,
  tickInterval = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 强制重新绘制
  const redraw = useCallback(() => {
    setForceUpdate(f => f + 1);
  }, []);
  
  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      redraw();
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [redraw]);

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = () => {
      redraw();
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, [redraw]);
  
  // 绘制标尺
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 获取容器尺寸
    const containerWidth = containerRef.current?.clientWidth || (isHorizontal ? 800 : size);
    const containerHeight = containerRef.current?.clientHeight || (isHorizontal ? size : 600);
    
    // 考虑设备像素比
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(containerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(containerHeight * dpr));
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    
    ctx.scale(dpr, dpr);
    
    // 清除画布
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    
    // 绘制背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, containerWidth, containerHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(0, containerHeight - 0.5);
      ctx.lineTo(containerWidth, containerHeight - 0.5);
      ctx.moveTo(containerWidth - 0.5, 0);
      ctx.lineTo(containerWidth - 0.5, containerHeight);
    } else {
      ctx.moveTo(containerWidth - 0.5, 0);
      ctx.lineTo(containerWidth - 0.5, containerHeight);
      ctx.moveTo(0, containerHeight - 0.5);
      ctx.lineTo(containerWidth, containerHeight - 0.5);
    }
    ctx.stroke();
    
    // 计算缩放后的画布尺寸
    const scaledWidth = canvasWidth * zoom;
    const scaledHeight = canvasHeight * zoom;
    const maxValue = isHorizontal ? canvasWidth : canvasHeight;
    
    const adjustedInterval = tickInterval * zoom;
    const scrollOffset = isHorizontal ? scrollX : scrollY;
    
    // 计算起始刻度位置（对齐到画布坐标系）
    const startValue = Math.floor(scrollOffset / zoom / tickInterval) * tickInterval;
    const startPos = (startValue * zoom) - scrollOffset;
    
    // 计算结束位置（取容器和画布缩放后尺寸的较小值）
    const containerMax = isHorizontal ? containerWidth : containerHeight;
    const canvasMax = isHorizontal ? scaledWidth : scaledHeight;
    const maxPos = Math.min(containerMax, canvasMax - scrollOffset);
    
    // 绘制范围
    const minPos = Math.max(0, startPos);
    const drawEndPos = Math.min(maxPos, containerMax);
    
    if (drawEndPos <= minPos) return;
    
    const count = Math.ceil((drawEndPos - minPos) / adjustedInterval) + 2;
    
    // 已绘制的刻度值集合（避免重复）
    const drawnValues = new Set<number>();
    
    // 绘制普通刻度
    for (let i = 0; i < count; i++) {
      const value = startValue + i * tickInterval;
      const pos = startPos + i * adjustedInterval;
      
      if (pos < 0 || pos > containerMax) continue;
      if (value < 0 || value > maxValue) continue;
      
      drawnValues.add(value);
      drawTick(ctx, value, pos, containerWidth, containerHeight, isHorizontal, tickInterval);
    }
    
    // 强制绘制画布末尾刻度（375 或 667）
    const endPos = (maxValue * zoom) - scrollOffset;
    if (endPos >= 0 && endPos <= containerMax && !drawnValues.has(maxValue)) {
      drawTick(ctx, maxValue, endPos, containerWidth, containerHeight, isHorizontal, tickInterval, true);
    }
    
  }, [isHorizontal, canvasWidth, canvasHeight, zoom, scrollX, scrollY, tickInterval, forceUpdate]);
  
  // 获取当前主题色
  const getThemeColor = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    return computedStyle.getPropertyValue('--theme-primary').trim() || '#e07a3f';
  };

  // 绘制单个刻度
  const drawTick = (
    ctx: CanvasRenderingContext2D,
    value: number,
    pos: number,
    containerWidth: number,
    containerHeight: number,
    isHorizontal: boolean,
    tickInterval: number,
    isEndTick: boolean = false
  ) => {
    const isMajor = isEndTick || (value / tickInterval) % 2 === 0;
    const primaryColor = getThemeColor();

    // 刻度线样式（末尾刻度用主题色突出显示）
    ctx.strokeStyle = isEndTick ? primaryColor : (isMajor ? '#8c8c8c' : '#bfbfbf');
    ctx.lineWidth = isEndTick ? 2 : 1;
    ctx.beginPath();

    if (isHorizontal) {
      // 水平刻度线（向下）- 主刻度 6px，次刻度 3px
      const tickLength = isMajor ? 6 : 3;
      ctx.moveTo(pos, containerHeight - tickLength);
      ctx.lineTo(pos, containerHeight);
    } else {
      // 垂直刻度线（向右）- 主刻度 6px，次刻度 3px
      const tickLength = isMajor ? 6 : 3;
      ctx.moveTo(containerWidth - tickLength, pos);
      ctx.lineTo(containerWidth, pos);
    }

    ctx.stroke();

    // 绘制刻度值（主刻度或末尾刻度显示）
    if (isMajor || isEndTick) {
      ctx.fillStyle = isEndTick ? primaryColor : (value === 0 ? primaryColor : '#595959');
      ctx.font = (isEndTick || value === 0)
        ? 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      if (isHorizontal) {
        // 水平标尺：数字显示在刻度线上方，避免重叠
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // 居中对齐到刻度线
        const padding = isEndTick ? 6 : 12;
        if (pos >= padding && pos <= containerWidth - padding) {
          // 数字显示在刻度线上方 5px 处，保持清晰可读
          ctx.fillText(String(value), pos, containerHeight - 8);
        }
      } else {
        // 垂直标尺：数字纵向显示（旋转 90 度）
        const padding = isEndTick ? 6 : 12;
        if (pos >= padding && pos <= containerHeight - padding) {
          ctx.save();
          // 以刻度线位置为原点，旋转 -90 度使数字纵向排列
          ctx.translate(containerWidth - 10, pos);
          ctx.rotate(-90 * Math.PI / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(value), 0, 0);
          ctx.restore();
        }
      }
    }
  };
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
