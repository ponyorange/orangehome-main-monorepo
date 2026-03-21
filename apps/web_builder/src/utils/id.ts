import { nanoid } from 'nanoid';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return nanoid(10);
}

/**
 * 生成带前缀的ID
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}_${nanoid(8)}`;
}
