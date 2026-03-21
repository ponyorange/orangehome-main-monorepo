import { useState, useCallback, useEffect } from 'react';

interface ZoomState {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
}

/** 缩放限制 */
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1.0;

/**
 * 画布缩放 Hook
 * 管理画布缩放状态和滚轮缩放交互
 */
export function useZoom(): ZoomState {
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM);

  /** 设置缩放值（带限制） */
  const setZoom = useCallback((newZoom: number) => {
    setZoomState(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  }, []);

  /** 放大 */
  const zoomIn = useCallback(() => {
    setZoom(zoom + ZOOM_STEP);
  }, [zoom, setZoom]);

  /** 缩小 */
  const zoomOut = useCallback(() => {
    setZoom(zoom - ZOOM_STEP);
  }, [zoom, setZoom]);

  /** 重置 */
  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
  }, [setZoom]);

  /** 滚轮缩放 */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 只在按住 Ctrl 或 Cmd 时触发缩放
      if (!e.ctrlKey && !e.metaKey) return;
      
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(zoom + delta);
    };

    // 监听整个文档的滚轮事件
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, setZoom]);

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
  };
}

/** 获取缩放百分比显示 */
export function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
