import React from 'react';
import { Button, Modal, Typography } from '@douyinfe/semi-ui';

export interface SharePreviewLinkModalProps {
  visible: boolean;
  url: string | null;
  onClose: () => void;
  onOpenInNewTab: () => void;
}

export const SharePreviewLinkModal: React.FC<SharePreviewLinkModalProps> = ({
  visible,
  url,
  onClose,
  onOpenInNewTab,
}) => (
  <Modal
    title="分享预览链接"
    visible={visible && Boolean(url)}
    onCancel={onClose}
    maskClosable
    centered
    width={560}
    footer={(
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>关闭</Button>
        <Button type="primary" onClick={onOpenInNewTab}>
          在新标签页打开
        </Button>
      </div>
    )}
  >
    <Typography.Paragraph type="tertiary" style={{ marginBottom: 8, marginTop: 0 }}>
      自动复制未成功，请手动选中下方链接复制，或使用按钮在新标签页打开。
    </Typography.Paragraph>
    {url ? (
      <div
        style={{
          maxHeight: 200,
          overflow: 'auto',
          padding: 12,
          borderRadius: 8,
          background: 'var(--semi-color-fill-0)',
          border: '1px solid var(--theme-border-soft)',
          wordBreak: 'break-all',
        }}
      >
        <Typography.Text copyable={{ content: url }} style={{ fontSize: 13 }}>
          {url}
        </Typography.Text>
      </div>
    ) : null}
  </Modal>
);
