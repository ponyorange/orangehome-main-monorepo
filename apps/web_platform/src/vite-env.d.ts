/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 编辑器基址；不设则同域打开「规范路径」/builder/?pageId=…（生产/Docker）。开发可设 http://localhost:5173 */
  readonly VITE_BUILDER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
