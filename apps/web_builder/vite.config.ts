import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __VERSION__ = '1.0.0';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'ES2022',
    cssCodeSplit: true,
  },
  css: {
    devSourcemap: true,
  },
  define: {
    __VERSION__: JSON.stringify(__VERSION__),
  },
  server: {
    port: 3001,
  },
});
