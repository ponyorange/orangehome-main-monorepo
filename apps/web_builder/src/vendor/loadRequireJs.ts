import requireJsUrl from './require.min.js?url';

let scriptPromise: Promise<void> | null = null;
/**
 * 将项目内的 require.min.js 注入页面（不写在 index.html）。
 * 须在 Vite/React 主包执行后再注入，避免依赖里的 UMD 在全局已存在 define.amd 时注册匿名 define，从而触发 RequireJS mismatch。
 */
export function injectRequireJsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const root = window.requirejs ?? window.require;
  if (root && typeof root.config === 'function') {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const sel = 'script[data-orange-requirejs]';
    const existed = document.querySelector(sel) as HTMLScriptElement | null;
    if (existed) {
      const finish = () => {
        if (window.requirejs && typeof window.requirejs.config === 'function') resolve();
        else reject(new Error('RequireJS 未正确初始化'));
      };
      if (window.requirejs) {
        finish();
        return;
      }
      existed.addEventListener('load', finish, { once: true });
      existed.addEventListener('error', () => reject(new Error('RequireJS 脚本加载失败')), { once: true });
      return;
    }

    const s = document.createElement('script');
    s.src = requireJsUrl;
    s.async = false;
    s.dataset.orangeRequirejs = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('RequireJS 脚本加载失败'));
    document.head.appendChild(s);
  });

  return scriptPromise;
}
