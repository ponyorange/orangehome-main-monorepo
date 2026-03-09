/**
 * OrangeHomeTitle - Header 插槽组件
 * 右上角显示 OrangeHome 标题
 */

import React from 'react';

export function OrangeHomeTitle() {
  return (
    <div
      style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#ff6b00',
        }}
      >
        OrangeHome
      </span>
      <span
        style={{
          fontSize: 12,
          color: '#999',
          padding: '2px 8px',
          background: '#f5f5f5',
          borderRadius: 4,
        }}
      >
        Web Builder
      </span>
    </div>
  );
}

export default OrangeHomeTitle;
