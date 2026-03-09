/**
 * ColorPicker - 颜色选择配置组件
 */

import React from 'react';
import type { SettingComponentProps } from './types';

export function ColorPicker({ value, onChange, config }: SettingComponentProps) {
  const { label } = config;
  const colorValue = (value as string) || '#000000';

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 12,
            color: '#666',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 40,
            height: 32,
            padding: 0,
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
          {colorValue}
        </span>
      </div>
    </div>
  );
}

export default ColorPicker;
