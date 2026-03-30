import { useCallback, useRef, useState } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import { SharePreviewLinkModal } from '../components/SharePreviewLinkModal';
import { buildRuntimePreviewUrl, copyRuntimePreviewLink } from '../../utils/runtimePreviewUrl';

const NO_URL_TOAST =
  '无法生成预览链接：请确认已打开页面且已配置 VITE_RUNTIME_PREVIEW_URL_TEMPLATE';

/**
 * 工具栏 / 预览模式「复制预览链接」共用：多层复制 + 失败时 Modal 兜底。
 */
export function useShareRuntimePreviewLink(pageId: string | null | undefined) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const inFlight = useRef(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (!modalUrl) return;
    const w = window.open(modalUrl, '_blank', 'noopener,noreferrer');
    if (!w || w.closed) {
      Toast.warning('无法打开新标签页：可能被浏览器拦截，请允许弹窗或手动复制下方链接打开');
    }
  }, [modalUrl]);

  const sharePreviewLink = useCallback(async () => {
    if (inFlight.current) return;
    const url = buildRuntimePreviewUrl(pageId);
    if (!url) {
      Toast.warning(NO_URL_TOAST);
      return;
    }
    inFlight.current = true;
    try {
      const result = await copyRuntimePreviewLink(pageId);
      if (result === 'ok') {
        setModalOpen(false);
        Toast.success('预览链接已复制到剪贴板');
        return;
      }
      if (result === 'no_url') {
        Toast.warning(NO_URL_TOAST);
        return;
      }
      setModalUrl(url);
      setModalOpen(true);
    } finally {
      inFlight.current = false;
    }
  }, [pageId]);

  const sharePreviewLinkModal = (
    <SharePreviewLinkModal
      visible={modalOpen}
      url={modalUrl}
      onClose={closeModal}
      onOpenInNewTab={handleOpenInNewTab}
    />
  );

  return { sharePreviewLink, sharePreviewLinkModal };
}
