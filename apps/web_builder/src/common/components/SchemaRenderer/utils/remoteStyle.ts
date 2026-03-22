const remoteStyleCache = new Set<string>();

export async function loadRemoteStyle(cssUrl?: string): Promise<void> {
  if (!cssUrl || remoteStyleCache.has(cssUrl)) return;

  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`远程样式加载失败: ${cssUrl}`));
    document.head.appendChild(link);
  });

  remoteStyleCache.add(cssUrl);
}
