import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type EditorChromeOverlayContextValue = {
  /** 画布内绝对定位、pointer-events: none 的挂载层，与 Schema 内容同源坐标系 */
  overlayElement: HTMLDivElement | null;
};

const EditorChromeOverlayContext = createContext<EditorChromeOverlayContextValue | null>(null);

/**
 * 包裹画布 Schema 层与编辑器装饰 Portal 目标层；由 CenterCanvas 使用。
 */
export const EditorChromeOverlayMount: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [overlayElement, setOverlayElement] = useState<HTMLDivElement | null>(null);
  const setOverlayRef = useCallback((el: HTMLDivElement | null) => {
    setOverlayElement(el);
  }, []);
  const value = useMemo(() => ({ overlayElement }), [overlayElement]);

  return (
    <EditorChromeOverlayContext.Provider value={value}>
      {/* 单层壳：overlay 与 Schema 树共原点，避免兄弟层参考系偏差导致选中框错位 */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
        <div
          ref={setOverlayRef}
          data-editor-chrome-overlay="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      </div>
    </EditorChromeOverlayContext.Provider>
  );
};

export function useEditorChromeOverlay(): EditorChromeOverlayContextValue {
  const v = useContext(EditorChromeOverlayContext);
  if (!v) {
    throw new Error('useEditorChromeOverlay must be used within EditorChromeOverlayMount');
  }
  return v;
}
