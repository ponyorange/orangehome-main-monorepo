/**
 * ImageUpload - 图片上传/URL 输入配置组件
 */

import React, { useState } from 'react';
import { Input, Button, Tabs } from '@douyinfe/semi-ui';
import type { SettingComponentProps } from './types';

export function ImageUpload({ value, onChange, config }: SettingComponentProps) {
  const { label } = config;
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const urlValue = (value as string) || '';

  // 模拟上传（实际应调用上传接口）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

      <Tabs type="line" activeKey={activeTab} onChange={(k) => setActiveTab(k as 'url' | 'upload')}>
        <Tabs.TabPane tab="URL" itemKey="url">
          <Input
            value={urlValue}
            onChange={(v) => onChange(v)}
            placeholder="输入图片 URL"
            style={{ width: '100%' }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="上传" itemKey="upload">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button type="secondary">
              <label style={{ cursor: 'pointer' }}>
                选择文件
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </Button>
            <span style={{ fontSize: 12, color: '#999' }}>支持 JPG、PNG、GIF</span>
          </div>
        </Tabs.TabPane>
      </Tabs>

      {urlValue && (
        <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
          <img
            src={urlValue}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: 120, display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
