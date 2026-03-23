/**
 * 物料版本状态：0-开发中 1-测试中 2-已发布 3-已下线（与 core 一致）
 */
export const VERSION_STATUS = {
  DEVELOPING: 0,
  TESTING: 1,
  PUBLISHED: 2,
  DEPRECATED: 3,
} as const;

/** release / preview：只查已发布 */
export const MATERIAL_VERSION_STATUSES_RELEASE_PREVIEW: number[] = [
  VERSION_STATUS.PUBLISHED,
];

/** dev：开发中、测试中、已发布均可命中最新 */
export const MATERIAL_VERSION_STATUSES_DEV: number[] = [
  VERSION_STATUS.DEVELOPING,
  VERSION_STATUS.TESTING,
  VERSION_STATUS.PUBLISHED,
];
