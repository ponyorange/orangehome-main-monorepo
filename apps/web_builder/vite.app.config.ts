import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** 用于生产镜像的 SPA 构建（与 modern 库构建分离） */
export default defineConfig({
  base: process.env.ORANGEHOME_VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
