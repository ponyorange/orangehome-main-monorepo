import type { ISchemaEditorConfig, ISchemaEditorConfigPropItem } from '../../types/base';

/** 物料 editorConfigJson 结构（与后台存储一致，非页面 ISchema） */
export interface MaterialEditorConfigJson {
  uid?: string;
  dependencies?: unknown[];
  props?: unknown;
  editorCapabilities?: { isContainer?: boolean };
}

function normalizeEditorConfigProps(raw: unknown): ISchemaEditorConfigPropItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ISchemaEditorConfigPropItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const key = o.key;
    const type = o.type;
    if (typeof key !== 'string' || !key.trim()) continue;
    if (typeof type !== 'string' || !type.trim()) continue;
    const optionsRaw = o.options;
    let options: { label: string; value: string }[] | undefined;
    if (Array.isArray(optionsRaw)) {
      options = [];
      for (const opt of optionsRaw) {
        if (!opt || typeof opt !== 'object') continue;
        const r = opt as Record<string, unknown>;
        const label = typeof r.label === 'string' ? r.label : String(r.value ?? '');
        const value = typeof r.value === 'string' ? r.value : String(r.value ?? '');
        options.push({ label, value });
      }
      if (options.length === 0) options = undefined;
    }
    const initValue = 'initValue' in o ? o.initValue : undefined;
    out.push({
      key: key.trim(),
      type: type.trim(),
      label: typeof o.label === 'string' ? o.label : undefined,
      placeholder: typeof o.placeholder === 'string' ? o.placeholder : undefined,
      options,
      min: typeof o.min === 'number' ? o.min : undefined,
      max: typeof o.max === 'number' ? o.max : undefined,
      step: typeof o.step === 'number' ? o.step : undefined,
      ...(initValue !== undefined ? { initValue } : {}),
    });
  }
  return out.length > 0 ? out : undefined;
}

export function buildEditorConfigFromMaterial(cfg: MaterialEditorConfigJson): ISchemaEditorConfig | undefined {
  const props = normalizeEditorConfigProps(cfg.props);
  const deps = cfg.dependencies;
  const hasDeps = Array.isArray(deps) && deps.length > 0;
  const has =
    (typeof cfg.uid === 'string' && cfg.uid.trim() !== '') ||
    hasDeps ||
    (props && props.length > 0) ||
    cfg.editorCapabilities != null;
  if (!has) return undefined;
  return {
    uid: typeof cfg.uid === 'string' ? cfg.uid : undefined,
    dependencies: Array.isArray(cfg.dependencies) ? cfg.dependencies : undefined,
    props,
    editorCapabilities: cfg.editorCapabilities,
  };
}

export function parseMaterialEditorConfig(json: string | undefined): MaterialEditorConfigJson {
  if (!json?.trim()) return {};
  try {
    const o = JSON.parse(json) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    return o as MaterialEditorConfigJson;
  } catch {
    return {};
  }
}

export function pickVersionFileUrl(v: { fileUrl?: string; file_url?: string }): string | undefined {
  const u = v.fileUrl ?? v.file_url;
  return typeof u === 'string' && u.trim() ? u.trim() : undefined;
}
