import { create } from 'zustand';
import type { ISchemaEditorConfig } from '../../types/base';
import {
  buildEditorConfigFromMaterial,
  parseMaterialEditorConfig,
  pickVersionFileUrl,
} from '../../data/modules/componentMaterialMeta';
import { remoteComponentDebug } from '../../utils/remoteComponentDebug';

export interface MaterialCatalogListRow {
  material: { materialUid: string };
  latestVersion: {
    fileUrl?: string;
    file_url?: string;
    editorConfigJson?: string;
  } | null;
}

function pickFileUrl(v: { fileUrl?: string; file_url?: string }): string | undefined {
  return pickVersionFileUrl(v);
}

/**
 * 物料目录：materialUid（与 schema.type 一致）→ bundle URL、editorConfig。
 * bundle / editorConfig 均来自组件列表接口，不写入页面 schema。
 */
interface MaterialBundleState {
  bundles: Record<string, string>;
  /** 与 schema.type（materialUid）对齐，用于属性面板与画布能力判断 */
  editorConfigs: Record<string, ISchemaEditorConfig>;
  setBundle: (materialUid: string, amdUrl: string) => void;
  hydrateFromComponentList: (items: MaterialCatalogListRow[]) => void;
  clear: () => void;
}

export const useMaterialBundleStore = create<MaterialBundleState>((set) => ({
  bundles: {},
  editorConfigs: {},
  setBundle: (materialUid, amdUrl) =>
    set((s) => {
      const t = amdUrl.trim();
      if (!t) return s;
      if (s.bundles[materialUid] === t) return s;
      return { bundles: { ...s.bundles, [materialUid]: t } };
    }),
  hydrateFromComponentList: (items) => {
    set((s) => {
      const nextBundles = { ...s.bundles };
      const nextEditor = { ...s.editorConfigs };
      for (const row of items) {
        const uid = row.material?.materialUid?.trim();
        const v = row.latestVersion;
        if (!uid || !v) continue;
        const url = pickFileUrl(v);
        if (url) nextBundles[uid] = url;
        const ec = buildEditorConfigFromMaterial(parseMaterialEditorConfig(v.editorConfigJson));
        if (ec) nextEditor[uid] = ec;
        else delete nextEditor[uid];
      }
      return { bundles: nextBundles, editorConfigs: nextEditor };
    });
    const { bundles, editorConfigs } = useMaterialBundleStore.getState();
    const uids = Object.keys(bundles);
    remoteComponentDebug('materialBundleStore.hydrateFromComponentList', {
      listRowCount: items.length,
      bundleCount: uids.length,
      bundleUidsSample: uids.slice(0, 24),
      editorConfigCount: Object.keys(editorConfigs).length,
    });
  },
  clear: () => set({ bundles: {}, editorConfigs: {} }),
}));
