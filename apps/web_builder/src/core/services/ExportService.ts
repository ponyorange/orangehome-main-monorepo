import type { ISchema } from '../../types/base';

function serializeSchema(schema: ISchema): string {
  return JSON.stringify(schema, null, 2);
}

export class ExportService {
  exportToJSON(schema: ISchema, filename = 'orange-editor-schema.json'): void {
    const blob = new Blob([serializeSchema(schema)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async copyToClipboard(schema: ISchema): Promise<void> {
    const text = serializeSchema(schema);
    await navigator.clipboard.writeText(text);
  }

  generateShareLink(schema: ISchema): string {
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(serializeSchema(schema)))));
    return `${window.location.origin}${window.location.pathname}#schema=${encoded}`;
  }
}

export const exportService = new ExportService();
