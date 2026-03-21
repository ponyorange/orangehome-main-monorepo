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
        background: 'var(--theme-gradient-page)',
        padding: 14,
        boxSizing: 'border-box',
        gap: 14,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          background: 'var(--theme-gradient-panel)',
          border: '1px solid var(--theme-border-soft)',
          borderRadius: 24,
          boxShadow: 'var(--theme-shadow-md)',
          backdropFilter: 'blur(var(--theme-backdrop-blur))',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            icon={<IconArrowLeft />}
            theme="borderless"
            type="tertiary"
            onClick={closePreview}
            style={{
              borderRadius: 999,
              background: 'rgba(255,255,255,0.62)',
              border: '1px solid var(--theme-border-soft)',
            }}
          >
            返回编辑
          </Button>
          <span style={{ fontSize: 13, color: 'var(--theme-text-secondary)', fontWeight: 600 }}>预览模式</span>
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
          borderRadius: 32,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
          border: '1px solid var(--theme-border-soft)',
          boxShadow: 'var(--theme-shadow-lg)',
        }}
      >
        <div
          style={{
            width: deviceSize.width,
            height: deviceSize.height,
            maxWidth: '100%',
            maxHeight: '100%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%)',
            border: '1px solid var(--theme-border-soft)',
            borderRadius: device === 'desktop' ? 28 : 28,
            boxShadow: device === 'desktop' ? 'var(--theme-shadow-md)' : 'var(--theme-shadow-lg)',
            overflow: 'auto',
            position: 'relative',
            paddingTop: device === 'desktop' ? 0 : 18,
            boxSizing: 'border-box',
          }}
        >
          {device !== 'desktop' ? (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                width: 92,
                height: 6,
                transform: 'translateX(-50%)',
                borderRadius: 999,
                background: 'rgba(15,23,42,0.12)',
                zIndex: 2,
              }}
            />
          ) : null}
          <SchemaNode schema={schema} />
        </div>
      </div>
    </div>
  );
};
