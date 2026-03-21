import { defineConfig, moduleTools } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: {
    target: 'es2022',
    buildType: 'bundleless',
    dts: {
      respectExternal: true,
    },
    alias: {
      '@': './src',
    },
    externalHelpers: false,
    sourceMap: true,
    jsx: 'transform',
    style: {
      inject: true,
    },
    define: {
      __VERSION__: JSON.stringify('0.1.0'),
    },
  },
});
