/// <reference types="vite/client" />

declare const __VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** JSON：RuntimeAmdConfig，如 {"paths":{"react":"https://..."},"map":{"*":{"react":"react"}}} */
  readonly VITE_AMD_RUNTIME_CONFIG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** RequireJS（public/vendor/require.min.js），用于加载 AMD 远程物料 */
type OrangeRequireFn = (deps: string[], onLoad: (mod: unknown) => void, onError?: (err: Error) => void) => void;
type OrangeRequireRoot = OrangeRequireFn & { config: (cfg: Record<string, unknown>) => OrangeRequireFn };

interface Window {
  requirejs?: OrangeRequireRoot;
  require?: OrangeRequireRoot;
}
