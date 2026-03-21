import { useMemo } from 'react';

export interface RulerConfig {
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 缩放比例 */
  zoom: number;
  /** 刻度间隔 */
  tickInterval?: number;
}

export interface Tick {
  /** 位置（像素） */
  pos: number;
  /** 刻度值 */
  value: number;
  /** 是否为主刻度 */
  isMajor: boolean;
}

/**
 * 计算标尺刻度
 * @param config - 标尺配置
 * @returns 刻度数组
 */
export function calculateTicks(config: RulerConfig): Tick[] {
  const { width, height, zoom, tickInterval = 50 } = config;
  
  // 根据缩放调整刻度间隔
  const adjustedInterval = tickInterval * zoom;
  
  const ticks: Tick[] = [];
  const maxLength = Math.max(width, height);
  const count = Math.ceil(maxLength / adjustedInterval);
  
  for (let i = 0; i <= count; i++) {
    const pos = i * adjustedInterval;
    if (pos > maxLength) break;
    
    const value = Math.round(pos / zoom);
    const isMajor = i % 5 === 0; // 每5个刻度为主刻度
    
    ticks.push({ pos, value, isMajor });
  }
  
  return ticks;
}

/**
 * 使用标尺 Hook
 * @param config - 标尺配置
 * @returns 刻度数据和计算函数
 */
export function useRuler(config: RulerConfig) {
  const ticks = useMemo(() => calculateTicks(config), [config]);
  
  return {
    ticks,
    calculateTicks,
  };
}
