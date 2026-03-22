import React, { useEffect } from 'react';
import { injectRequireJsScript } from '../../../../vendor/loadRequireJs';
import { runtimeContextService, type RuntimeAmdConfig } from '../../../../core/services/RuntimeContextService';

/**
 * 编辑器内（含预览）在 React 主包就绪后再注入 require.min.js，并预热 RuntimeContextService 的独立 RequireJS context（paths/map）。
 */
export const CanvasAmdRequireBootstrap: React.FC = () => {
  useEffect(() => {
    void (async () => {
      try {
        await injectRequireJsScript();
        const raw = import.meta.env.VITE_AMD_RUNTIME_CONFIG;
        if (typeof raw === 'string' && raw.trim()) {
          try {
            const parsed = JSON.parse(raw) as RuntimeAmdConfig;
            runtimeContextService.configure(parsed);
          } catch {
            console.warn('[CanvasAmdRequireBootstrap] VITE_AMD_RUNTIME_CONFIG 不是合法 JSON，已忽略');
          }
        }
        await runtimeContextService.ensureInitialized();
      } catch (e) {
        console.error('[CanvasAmdRequireBootstrap]', e);
      }
    })();
  }, []);
  return null;
};
