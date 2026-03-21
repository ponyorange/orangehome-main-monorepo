import React, { useMemo } from 'react';
import { Button, Select } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { useSchemaStore } from '../store/schemaStore';
import { usePreviewStore, type PreviewDevice } from '../store/previewStore';
import { SchemaNode } from '../../common/components/SchemaRenderer/BaseComponents';

const DEVICE_SIZES: Record<PreviewDevice, { label: string; width: number | string; height: number | string }> = {
  mobile: { label: '手机', width: 375, height: 667 },
  tablet: { label: '平板', width: 768, height: 1024 },
  desktop: { label: '桌面', width: '100%', height: '100%' },
};

export const Preview: React.FC = () => {
  const { schema } = useSchemaStore();
  const { device, closePreview, setDevice } = usePreviewStore();

  const deviceSize = useMemo(() => DEVICE_SIZES[device], [device]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button icon={<IconArrowLeft />} theme="borderless" type="tertiary" onClick={closePreview}>
            返回编辑
          </Button>
          <span style={{ fontSize: 13, color: '#666' }}>预览模式</span>
        </div>

        <div style={{ width: 120 }}>
          <Select value={device} onChange={(value) => setDevice(value as PreviewDevice)} size="small">
            <Select.Option value="mobile">手机</Select.Option>
            <Select.Option value="tablet">平板</Select.Option>
            <Select.Option value="desktop">桌面</Select.Option>
          </Select>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: deviceSize.width,
            height: deviceSize.height,
            maxWidth: '100%',
            maxHeight: '100%',
            background: '#fff',
            borderRadius: device === 'desktop' ? 0 : 20,
            boxShadow: device === 'desktop' ? 'none' : '0 10px 30px rgba(0,0,0,0.12)',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <SchemaNode schema={schema} />
        </div>
      </div>
    </div>
  );
};
