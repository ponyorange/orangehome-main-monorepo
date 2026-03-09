/**
 * PropertyPanel - 右侧面板属性配置
 * 根据选中组件动态渲染配置表单
 */

import React, { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { useEditorStore } from '../../../core/EditorStoreContext';
import { useRegisterSlot } from '../../LayoutContext';
import { EditorConfigLoader, EditorConfigLoaderImpl } from '../../../services/EditorConfigLoader';
import { getSettingComponent, type IEditorConfig, type SettingConfig } from '../../../common/settingComponents';
import type { ISchema } from '../../../types/base';

const configLoader = new EditorConfigLoaderImpl();

function PropertyPanelContent() {
  const store = useEditorStore();
  const schema = useStore(store, (s) => s.schema);
  const selectedNodeId = useStore(store, (s) => s.selectedNodeId);
  const [config, setConfig] = useState<IEditorConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取选中节点
  const selectedNode = React.useMemo(() => {
    if (!schema || !selectedNodeId) return null;
    const findNode = (node: ISchema): ISchema | null => {
      if (node.id === selectedNodeId) return node;
      for (const child of node.children || []) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };
    return findNode(schema);
  }, [schema, selectedNodeId]);

  // 加载配置
  useEffect(() => {
    if (!selectedNode) {
      setConfig(null);
      return;
    }
    setLoading(true);
    configLoader
      .load(selectedNode.type)
      .then((cfg) => {
        setConfig(cfg);
      })
      .finally(() => setLoading(false));
  }, [selectedNode]);

  // 更新节点属性
  const handlePropChange = (propKey: string, value: unknown) => {
    if (!selectedNode || !schema) return;

    const updateNode = (node: ISchema): ISchema => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          props: {
            ...node.props,
            [propKey]: value,
          },
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateNode) };
      }
      return node;
    };

    store.setState({ schema: updateNode({ ...schema }) });
  };

  // 渲染配置项
  const renderConfigItem = (setting: SettingConfig) => {
    const Component = getSettingComponent(setting.type);
    if (!Component) {
      return (
        <div key={setting.propKey} style={{ color: '#f56', fontSize: 12, marginBottom: 8 }}>
          未知配置类型: {setting.type}
        </div>
      );
    }

    const value = selectedNode?.props?.[setting.propKey] ?? setting.defaultValue;

    return (
      <Component
        key={setting.propKey}
        config={setting}
        value={value}
        onChange={(v) => handlePropChange(setting.propKey, v)}
      />
    );
  };

  if (!selectedNode) {
    return (
      <div style={{ padding: 24, color: '#999', fontSize: 12, textAlign: 'center' }}>
        <div style={{ marginBottom: 8 }}>请选择一个组件</div>
        <div style={{ fontSize: 11, color: '#bbb' }}>点击画布中的组件以配置属性</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* 组件信息 */}
      <div
        style={{
          padding: '12px 0',
          borderBottom: '1px solid var(--semi-color-border, #eee)',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 4 }}>
          {config?.displayName || selectedNode.name}
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>
          类型: {selectedNode.type} | ID: {selectedNode.id.slice(0, 8)}...
        </div>
      </div>

      {/* 配置表单 */}
      {loading ? (
        <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: 24 }}>
          加载配置...
        </div>
      ) : config ? (
        <div>{config.props.map(renderConfigItem)}</div>
      ) : (
        <div style={{ color: '#f56', fontSize: 12, padding: 16, background: '#fff2f0', borderRadius: 4 }}>
          未找到该组件的配置文件 (editor.json)
        </div>
      )}
    </div>
  );
}

/** PropertyPanel 插槽注册器 */
export function usePropertyPanelSlot() {
  const register = useRegisterSlot();

  React.useEffect(() => {
    const unregister = register({
      id: 'property-panel',
      type: 'rightPanel',
      priority: 10,
      title: '属性配置',
      component: PropertyPanelContent,
    });
    return unregister;
  }, [register]);
}

export { PropertyPanelContent };
export default PropertyPanelContent;
