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

export type CopyRuntimePreviewLinkResult = 'ok' | 'no_url' | 'clipboard_error';

export async function copyRuntimePreviewLink(
  pageId: string | null | undefined,
): Promise<CopyRuntimePreviewLinkResult> {
  const url = buildRuntimePreviewUrl(pageId);
  if (!url) return 'no_url';
  try {
    await navigator.clipboard.writeText(url);
    return 'ok';
  } catch {
    return 'clipboard_error';
  }
}
