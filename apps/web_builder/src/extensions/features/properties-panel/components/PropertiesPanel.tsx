import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, Typography, Tabs, TabPane } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { findById, updateProps, validate } from '../../../../common/base/schemaOperator';
import { getComponentConfig } from '../configs';
import { PropertyForm } from './PropertyForm';
import { StyleForm } from './StyleForm';
import { MonacoSchemaEditor } from './MonacoSchemaEditor';

function replaceNode(root: ISchema, targetId: string, nextNode: ISchema): ISchema {
  if (root.id === targetId) {
    return nextNode;
  }

  return {
    ...root,
    children: root.children.map((child) => replaceNode(child, targetId, nextNode)),
  };
}

export const PropertiesPanel: React.FC = () => {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const setSelectedIds = useSelectionStore((s) => s.setSelectedIds);
  const { schema, setSchema } = useSchemaStore();
  const [schemaText, setSchemaText] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const selectedId = selectedIds.length === 1
    ? (selectedIds[0] === schema.id ? schema.id : selectedIds[0])
    : selectedIds.length === 0
      ? schema.id
      : null;
  const selectedNode = selectedId ? findById(schema, selectedId) : null;

  const handlePropsUpdate = useCallback((newProps: Record<string, unknown>) => {
    if (!selectedId) return;
    const updated = updateProps(schema, selectedId, newProps);
    setSchema(updated);
  }, [selectedId, schema, setSchema]);

  useEffect(() => {
    if (!selectedNode) return;
    setSchemaText(JSON.stringify(selectedNode, null, 2));
    setSchemaError(null);
  }, [selectedNode]);

  const handleSchemaChange = useCallback((value: string) => {
    setSchemaText(value);
    if (!selectedNode) return;

    try {
      const parsed = JSON.parse(value) as ISchema;
      if (!validate(parsed)) {
        setSchemaError('Schema 结构无效');
        return;
      }

      const updatedSchema = selectedId === schema.id ? parsed : replaceNode(schema, selectedId!, parsed);
      setSchema(updatedSchema);
      setSchemaError(null);
      if (selectedId !== schema.id) {
        setSelectedIds([parsed.id]);
      }
    } catch (error) {
      setSchemaError(error instanceof Error ? error.message : 'JSON 解析失败');
    }
  }, [selectedNode, selectedId, schema, setSchema, setSelectedIds]);

  if (!selectedNode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
          <Typography.Title heading={6} style={{ margin: 0 }}>属性配置</Typography.Title>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="请选择单个组件" />
        </div>
      </div>
    );
  }

  const config = getComponentConfig(selectedNode.type);
  const isRootSchema = selectedId === schema.id;
  const headerTitle = useMemo(() => (isRootSchema ? '根容器' : selectedNode.name), [isRootSchema, selectedNode.name]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 组件信息 */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          background: 'var(--theme-primary-light, #fff3e8)',
          color: 'var(--theme-primary, #e07a3f)',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {selectedNode.type}
        </span>
        <Typography.Text style={{ fontSize: 13, color: '#333' }}>
          {headerTitle}
        </Typography.Text>
        <Typography.Text style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>
          {selectedNode.id}
        </Typography.Text>
      </div>

      {/* 属性/样式选项卡 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Tabs type="line" size="small" style={{ padding: '0 12px' }}>
          <TabPane tab="属性" itemKey="props">
            <div style={{ padding: '8px 0' }}>
              {config ? (
                <PropertyForm
                  schema={selectedNode}
                  config={config}
                  onUpdate={handlePropsUpdate}
                />
              ) : (
                <Empty description={`${selectedNode.type} 暂无属性配置`} />
              )}
            </div>
          </TabPane>
          <TabPane tab="样式" itemKey="style">
            <div style={{ padding: '8px 0' }}>
              <StyleForm schema={selectedNode} onUpdate={handlePropsUpdate} />
            </div>
          </TabPane>
          <TabPane tab="Schema" itemKey="schema">
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MonacoSchemaEditor value={schemaText} onChange={handleSchemaChange} />
              <div style={{ fontSize: 12, color: schemaError ? '#d84a1b' : '#999' }}>
                {schemaError ?? '编辑当前选中组件的 Schema，合法 JSON 会实时同步到画布'}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
