/**
 * 物料版本状态：0-开发中 1-测试中 2-已发布 3-已下线（与 core 一致）
 */
export const VERSION_STATUS = {
  DEVELOPING: 0,
  TESTING: 1,
  PUBLISHED: 2,
  DEPRECATED: 3,
} as const;

/**
 * release（线上）：只查已发布物料，与 CDN 缓存策略一致。
 */
export const MATERIAL_VERSION_STATUSES_RELEASE_ONLY: number[] = [
  VERSION_STATUS.PUBLISHED,
];

/** @deprecated 使用 {@link MATERIAL_VERSION_STATUSES_RELEASE_ONLY} */
export const MATERIAL_VERSION_STATUSES_RELEASE_PREVIEW =
  MATERIAL_VERSION_STATUSES_RELEASE_ONLY;

/**
 * dev：开发中、测试中、已发布均可命中「最新」一条。
 */
export const MATERIAL_VERSION_STATUSES_DEV: number[] = [
  VERSION_STATUS.DEVELOPING,
  VERSION_STATUS.TESTING,
  VERSION_STATUS.PUBLISHED,
];
