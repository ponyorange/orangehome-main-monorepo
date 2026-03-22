/**
 * 从当前地址解析 pageId：支持 ?pageId= 与 hash 中的 ?pageId=（如 #/path?pageId=）
 */
export function getPageIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const fromSearch = new URLSearchParams(window.location.search).get('pageId');
  if (fromSearch?.trim()) return fromSearch.trim();
  const hash = window.location.hash;
  const q = hash.indexOf('?');
  if (q >= 0) {
    const fromHash = new URLSearchParams(hash.slice(q)).get('pageId');
    if (fromHash?.trim()) return fromHash.trim();
  }
  return null;
}
