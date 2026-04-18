import { BadGatewayException } from '@nestjs/common';

/** 与物料 fileObjectKey → URL 规则一致（见 runtime SSR / AMD 映射） */
export const ORANGEHOME_MATERIAL_CDN_BASE =
  'http://8.148.251.221:6011/orangehome';

export function urlFromOrangehomeMaterialObjectKey(
  fileObjectKey: string,
): string {
  return `${ORANGEHOME_MATERIAL_CDN_BASE}/${fileObjectKey}`;
}

export function assertHttpOrHttpsMaterialUrl(url: string): void {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new BadGatewayException('Invalid material URL scheme');
    }
  } catch (e) {
    if (e instanceof BadGatewayException) throw e;
    throw new BadGatewayException('Invalid material URL');
  }
}
