import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@douyinfe/semi-ui';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleTextChange = (v: string) => {
    setText(v);
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(v) || /^rgba?\(/.test(v) || /^[a-z]+$/i.test(v)) {
      onChange(v);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setText(newColor);
    onChange(newColor);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          border: '1px solid #d9d9d9',
          background: value || '#fff',
          cursor: 'pointer',
        }} onClick={() => inputRef.current?.click()} />
        <input
          ref={inputRef}
          type="color"
          value={value?.startsWith('#') ? value : '#000000'}
          onChange={handleNativeChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </div>
      <Input
        size="small"
        value={text}
        style={{ flex: 1 }}
        onChange={handleTextChange}
        onBlur={() => onChange(text)}
      />
    </div>
  );
};
