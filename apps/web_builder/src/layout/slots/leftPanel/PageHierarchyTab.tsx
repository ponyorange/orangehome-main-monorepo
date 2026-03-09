/**
 * PageHierarchyTab - 页面层级 Tab
 * 展示当前页面的组件树，点击可选中对应组件
 */

import React from 'react';
import { useStore } from 'zustand';
import { useEditorStore } from '../../../core/EditorStoreContext';
import { useRegisterSlot } from '../../LayoutContext';
import type { TabSlot } from '../../types';
import type { ISchema } from '../../../types/base';

function PageHierarchyContent() {
  const store = useEditorStore();
  const schema = useStore(store, (s) => s.schema);
  const selectedNodeId = useStore(store, (s) => s.selectedNodeId);

  const handleNodeClick = (id: string) => {
    // 通过全局事件总线或 context 触发选中
    // 这里简化处理，直接调用 select
    store.setState({ selectedNodeId: id });
    console.log('[PageHierarchy] 选中节点:', id);
  };

  const renderTree = (node: ISchema, depth = 0): React.ReactElement => {
    const isSelected = node.id === selectedNodeId;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} style={{ marginLeft: depth * 16 }}>
        <div
          onClick={() => handleNodeClick(node.id)}
          style={{
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: 4,
            background: isSelected ? 'rgba(255, 107, 0, 0.1)' : 'transparent',
            color: isSelected ? '#ff6b00' : '#333',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: hasChildren ? '#ff6b00' : '#ccc',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name} ({node.type})
          </span>
        </div>
        {hasChildren && (
          <div style={{ marginTop: 2 }}>
            {node.children!.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!schema) {
    return (
      <div style={{ padding: 24, color: '#999', fontSize: 12, textAlign: 'center' }}>
        暂无页面结构
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12, fontSize: 12, color: '#999' }}>
        点击节点可选中组件
      </div>
      {renderTree(schema)}
    </div>
  );
}

/** 页面层级 Tab 插槽注册器 */
export function usePageHierarchyTab() {
  const register = useRegisterSlot();

  React.useEffect(() => {
    const unregister = register({
      id: 'page-hierarchy-tab',
      type: 'leftPanelTab',
      tabId: 'hierarchy',
      priority: 10,
      title: '层级',
      component: PageHierarchyContent,
    });
    return unregister;
  }, [register]);
}

export { PageHierarchyContent };
export default PageHierarchyContent;
