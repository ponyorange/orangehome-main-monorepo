/**
 * NumberInput - 数字输入配置组件
 */

import React from 'react';
import { InputNumber } from '@douyinfe/semi-ui';
import type { SettingComponentProps } from './types';

export function NumberInput({ value, onChange, config }: SettingComponentProps) {
  const { label, extra } = config;
  const min = extra?.min as number | undefined;
  const max = extra?.max as number | undefined;
  const step = (extra?.step as number) || 1;

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
      <InputNumber
        value={typeof value === 'number' ? value : undefined}
        onChange={(v) => onChange(v)}
        min={min}
        max={max}
        step={step}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default NumberInput;
