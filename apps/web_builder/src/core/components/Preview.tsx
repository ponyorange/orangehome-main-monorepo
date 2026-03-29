import React, { useEffect, useMemo, useState } from 'react';
import { Button, Select, Spin, Toast } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconCopy, IconExternalOpen } from '@douyinfe/semi-icons';
import { usePreviewStore, type PreviewDevice } from '../store/previewStore';
import { useEditorPageId } from '../context/EditorPageContext';
import { buildRuntimePreviewUrl, copyRuntimePreviewLink } from '../../utils/runtimePreviewUrl';

const DEVICE_SIZES: Record<PreviewDevice, { label: string; width: number | string; height: number | string }> = {
  mobile: { label: '手机', width: 375, height: 667 },
  tablet: { label: '平板', width: 768, height: 1024 },
  desktop: { label: '桌面', width: '100%', height: '100%' },
};

export const Preview: React.FC = () => {
  const pageId = useEditorPageId();
  const { device, closePreview, setDevice } = usePreviewStore();
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const deviceSize = useMemo(() => DEVICE_SIZES[device], [device]);
  const previewUrl = useMemo(() => buildRuntimePreviewUrl(pageId), [pageId]);

  useEffect(() => {
    if (!previewUrl) {
      setIframeLoading(false);
      setIframeError(false);
      return;
    }
    setIframeLoading(true);
    setIframeError(false);
  }, [previewUrl]);

  /** iframe 跨域时 onError 往往不触发；超时后给出说明与「新窗口打开」 */
  useEffect(() => {
    if (!previewUrl) return;
    const t = window.setTimeout(() => {
      setIframeLoading((loading) => {
        if (loading) {
          setIframeError(true);
          return false;
        }
        return loading;
      });
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [previewUrl]);

  const handleCopyPreviewLink = async () => {
    const result = await copyRuntimePreviewLink(pageId);
    if (result === 'no_url') {
      Toast.warning('无法生成预览链接：请确认当前有页面且已配置 VITE_RUNTIME_PREVIEW_URL_TEMPLATE');
      return;
    }
    if (result === 'clipboard_error') {
      Toast.error('复制失败，请检查浏览器权限或使用 HTTPS');
      return;
    }
    Toast.success('预览链接已复制到剪贴板');
  };

  const handleOpenInNewWindow = () => {
    const url = buildRuntimePreviewUrl(pageId);
    if (!url) {
      Toast.warning('无法打开：预览地址无效');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          minHeight: 64,
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
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
            <span
              style={{
                fontSize: 11,
                color: 'var(--theme-text-secondary)',
                fontWeight: 500,
                opacity: 0.85,
              }}
            >
              以下为运行时已发布版本预览
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button
            icon={<IconCopy />}
            type="tertiary"
            size="small"
            onClick={handleCopyPreviewLink}
            style={{
              borderRadius: 999,
              background: 'rgba(255,255,255,0.62)',
              border: '1px solid var(--theme-border-soft)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            复制链接
          </Button>
          <div style={{ width: 120 }}>
            <Select value={device} onChange={(value) => setDevice(value as PreviewDevice)} size="small">
              <Select.Option value="mobile">手机</Select.Option>
              <Select.Option value="tablet">平板</Select.Option>
              <Select.Option value="desktop">桌面</Select.Option>
            </Select>
          </div>
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
            overflow: 'hidden',
            position: 'relative',
            paddingTop: device === 'desktop' ? 0 : 18,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
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

          {!previewUrl ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                textAlign: 'center',
                color: 'var(--theme-text-secondary)',
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              无法加载运行时预览：请确认 URL 带有 pageId，并在环境变量中配置有效的
              VITE_RUNTIME_PREVIEW_URL_TEMPLATE（须包含 {'{pageId}'} 占位符）。
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%' }}>
              {iframeLoading ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.72)',
                    zIndex: 3,
                  }}
                >
                  <Spin size="large" />
                </div>
              ) : null}
              <iframe
                key={previewUrl}
                title="运行时预览"
                src={previewUrl}
                onLoad={() => {
                  setIframeLoading(false);
                  setIframeError(false);
                }}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError(true);
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  background: '#fff',
                }}
              />
              {iframeError ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    padding: 24,
                    background: 'rgba(255,255,255,0.94)',
                    textAlign: 'center',
                    zIndex: 4,
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--theme-text-secondary)', lineHeight: 1.6, maxWidth: 320 }}>
                    预览区域无法嵌入该页面（可能被安全策略禁止 iframe）。可尝试在新窗口打开完整预览链接。
                  </div>
                  <Button
                    icon={<IconExternalOpen />}
                    type="primary"
                    onClick={handleOpenInNewWindow}
                    style={{ borderRadius: 999 }}
                  >
                    新窗口打开
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
