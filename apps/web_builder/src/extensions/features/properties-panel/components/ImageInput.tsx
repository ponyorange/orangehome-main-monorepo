import React, { useState, useEffect } from 'react';
import { Input } from '@douyinfe/semi-ui';

interface ImageInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ value, placeholder, onChange }) => {
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
  }, [value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Input
        size="small"
        value={value}
        placeholder={placeholder || '请输入图片 URL'}
        onChange={onChange}
      />
      <div
        style={{
          width: '100%',
          minHeight: 72,
          borderRadius: 6,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          background: '#fafafa',
        }}
      >
        <div
          style={{
            padding: '6px 8px',
            fontSize: 11,
            color: '#999',
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          图片预览
        </div>
        <div
          style={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          {value && !previewFailed ? (
            <img
              key={value}
              src={value}
              alt="preview"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <span style={{ fontSize: 12, color: '#bbb' }}>
              {value ? '图片加载失败，请检查地址' : '请输入图片地址后预览'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
