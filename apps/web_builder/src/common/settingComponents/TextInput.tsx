/**
 * TextInput - 文本输入配置组件
 */

import React from 'react';
import { Input } from '@douyinfe/semi-ui';
import type { SettingComponentProps } from './types';

export function TextInput({ value, onChange, config }: SettingComponentProps) {
  const { label, extra } = config;
  const placeholder = (extra?.placeholder as string) || `请输入${label || ''}`;

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
      <Input
        value={(value as string) || ''}
        onChange={(v) => onChange(v)}
        placeholder={placeholder}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default TextInput;
