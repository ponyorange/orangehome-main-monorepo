const PAGE_ID_PLACEHOLDER = '{pageId}';

/**
 * 由环境变量模板构造运行时预览完整 URL，供 iframe / 分享 / 复制共用。
 * @see specs/004-runtime-preview-iframe-share/contracts/runtime-preview-url.md
 */
export function buildRuntimePreviewUrl(pageId: string | null | undefined): string | null {
  const id = typeof pageId === 'string' ? pageId.trim() : '';
  if (!id) return null;

  const template = import.meta.env.VITE_RUNTIME_PREVIEW_URL_TEMPLATE?.trim();
  if (!template || !template.includes(PAGE_ID_PLACEHOLDER)) return null;

  return template.replace(PAGE_ID_PLACEHOLDER, encodeURIComponent(id));
}

function copyViaExecCommand(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 优先使用 Clipboard API（仅安全上下文）；否则或非安全上下文用 execCommand 兜底（便于局域网 HTTP）。
 * @see specs/011-http-share-fallback/research.md
 */
export async function copyTextToClipboardRobust(text: string): Promise<boolean> {
  if (typeof window !== 'undefined' && window.isSecureContext) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // 权限拒绝等：尝试 execCommand
    }
    return copyViaExecCommand(text);
  }
  return copyViaExecCommand(text);
}

export type CopyRuntimePreviewLinkResult = 'ok' | 'no_url' | 'clipboard_error';

export async function copyRuntimePreviewLink(
  pageId: string | null | undefined,
): Promise<CopyRuntimePreviewLinkResult> {
  const url = buildRuntimePreviewUrl(pageId);
  if (!url) return 'no_url';
  const ok = await copyTextToClipboardRobust(url);
  return ok ? 'ok' : 'clipboard_error';
}
