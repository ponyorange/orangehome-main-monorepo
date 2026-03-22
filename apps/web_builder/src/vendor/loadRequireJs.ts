import requireJsUrl from './require.min.js?url';

let scriptPromise: Promise<void> | null = null;

type RequireJsRoot = NonNullable<Window['requirejs']>;

/**
 * 获取全局 RequireJS 根对象（与注入完成后的 `window.requirejs` 一致）。
 * 等价于你期望的 `import R from './require.min.js'` 在浏览器里真正得到的 `R`。
 */
export function getRequireJsRoot(): RequireJsRoot {
  const R = window.requirejs ?? window.require;
  if (!R || typeof R.config !== 'function') {
    throw new Error('RequireJS 未就绪，请先调用 injectRequireJsScript()');
  }
  return R;
}

/**
 * 惰性访问根对象：可在任意模块 `import { requirejs }`，首次访问属性/调用前须已完成 `injectRequireJsScript()`。
 * 语义上等同 `const R = window.requirejs`（`R.config`、`R(deps, cb)` 等）。
 */
export const requirejs: RequireJsRoot = new Proxy(function () {} as unknown as RequireJsRoot, {
  get(_target, prop, receiver) {
    const R = getRequireJsRoot();
    const value = Reflect.get(R as object, prop, receiver);
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(R) : value;
  },
  apply(_target, _thisArg, argArray) {
    const R = getRequireJsRoot();
    return (R as (...args: unknown[]) => unknown)(...argArray);
  },
}) as RequireJsRoot;
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
