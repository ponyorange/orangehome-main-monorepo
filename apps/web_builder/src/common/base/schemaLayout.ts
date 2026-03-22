/** 页面根节点 materialUid，与内置布局容器共用 Container 渲染与拖放/图层面板逻辑 */
export const ROOT_CONTAINER_MATERIAL_UID = '@orangehome/common-component-rootcontainer';

export function isBuiltInLayoutContainerType(type: string): boolean {
  return type === 'Container' || type === ROOT_CONTAINER_MATERIAL_UID;
}
