/**
 * HelpButton - 浮动帮助按钮（右下角）
 */

import React, { useState } from 'react';
import { useRegisterSlot } from '../../LayoutContext';

function HelpButtonContent() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
    if (!open) {
      console.log('[Help] 打开帮助面板');
    }
  };

  return (
    <>
      {/* 帮助按钮 */}
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#ff6b00',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.4)';
        }}
        title="帮助"
      >
        {open ? (
          <span style={{ fontSize: 20 }}>✕</span>
        ) : (
          <span style={{ fontSize: 20 }}>?</span>
        )}
      </button>

      {/* 帮助弹窗 */}
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            width: 280,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
            Orange Editor 帮助
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 8 }}>快捷键：</p>
            <ul style={{ paddingLeft: 16, marginBottom: 12 }}>
              <li>拖拽组件到画布添加</li>
              <li>点击组件选中</li>
              <li>拖动手柄移动组件</li>
              <li>右侧面板配置属性</li>
            </ul>
            <p style={{ color: '#999', fontSize: 11 }}>
              更多帮助请访问文档中心
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '8px 0',
              background: '#ff6b00',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            知道了
          </button>
        </div>
      )}
    </>
  );
}

/** HelpButton 插槽注册器 */
export function useHelpButtonSlot() {
  const register = useRegisterSlot();

  React.useEffect(() => {
    const unregister = register({
      id: 'help-button',
      type: 'float',
      priority: 10,
      title: '帮助',
      component: HelpButtonContent,
    });
    return unregister;
  }, []);
}

export { HelpButtonContent };
export default HelpButtonContent;
