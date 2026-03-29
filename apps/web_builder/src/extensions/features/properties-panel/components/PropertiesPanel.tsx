import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, Modal } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import {
  findById,
  updateProps,
  validate,
  normalizeSchemaNode,
  updateInlineStyle,
} from '../../../../common/base/schemaOperator';
import { useMaterialBundleStore } from '../../../../core/store/materialBundleStore';
import { getComponentConfig } from '../configs';
import { PropertyForm } from './PropertyForm';
import { StyleForm } from './StyleForm';
import { EditorConfigPropsForm } from './EditorConfigPropsForm';
import { MonacoSchemaEditor } from './MonacoSchemaEditor';
import {
  InspectorShell,
  InspectorSection,
  InspectorSegmentedTabs,
  INSPECTOR_TAB_IDS,
} from './inspector';
import type { InspectorPanelTab } from './inspector';
import styles from './inspector/inspector.module.css';

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
  const [activeTab, setActiveTab] = useState<InspectorPanelTab>('config');
  const [schemaModalVisible, setSchemaModalVisible] = useState(false);

  const selectedId = selectedIds.length === 1
    ? (selectedIds[0] === schema.id ? schema.id : selectedIds[0])
    : selectedIds.length === 0
      ? schema.id
      : null;
  const selectedNode = selectedId ? findById(schema, selectedId) : null;
  const materialUidForCatalog = selectedNode?.type;
  const editorCfgProps = useMaterialBundleStore((s) =>
    materialUidForCatalog ? s.editorConfigs[materialUidForCatalog]?.props : undefined,
  );

  useEffect(() => {
    setActiveTab('config');
  }, [selectedId]);

  const handlePropsUpdate = useCallback((newProps: Record<string, unknown>) => {
    if (!selectedId) return;
    const updated = updateProps(schema, selectedId, newProps);
    setSchema(updated);
  }, [selectedId, schema, setSchema]);

  const handleInlineStyleUpdate = useCallback((nextStyle: Record<string, unknown>) => {
    if (!selectedId) return;
    setSchema(updateInlineStyle(schema, selectedId, nextStyle));
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
      const parsed = normalizeSchemaNode(JSON.parse(value) as ISchema);
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

  const schemaPreview = useMemo(
    () => (selectedNode ? JSON.stringify(selectedNode, null, 2) : ''),
    [selectedNode],
  );

  if (!selectedNode) {
    return (
      <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <InspectorShell
          title="组件配置"
          subtitle="请在画布上选择单个组件以编辑属性与样式"
          segmented={null}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
            <Empty description="请选择单个组件" />
          </div>
        </InspectorShell>
      </div>
    );
  }

  const config = getComponentConfig(selectedNode.type);
  const isRootSchema = selectedId === schema.id;
  const headerTitle = isRootSchema ? '根容器' : (selectedNode.name || selectedNode.type);
  const subtitle = '编辑属性与样式，或在「信息」中查看标识与 Schema';

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <InspectorShell
        title={headerTitle}
        subtitle={subtitle}
        segmented={(
          <InspectorSegmentedTabs
            activeKey={activeTab}
            onChange={setActiveTab}
            ids={INSPECTOR_TAB_IDS}
          />
        )}
      >
        <div
          id={INSPECTOR_TAB_IDS.panelConfig}
          role="tabpanel"
          aria-labelledby={INSPECTOR_TAB_IDS.tabConfig}
          hidden={activeTab !== 'config'}
        >
          {activeTab === 'config' && (
            <>
              <InspectorSection title="属性配置" titleId="inspector-sec-props">
                {config ? (
                  <PropertyForm
                    schema={selectedNode}
                    config={config}
                    onUpdateProps={handlePropsUpdate}
                    onUpdateStyle={handleInlineStyleUpdate}
                  />
                ) : editorCfgProps && editorCfgProps.length > 0 ? (
                  <EditorConfigPropsForm
                    schema={selectedNode}
                    items={editorCfgProps}
                    onUpdateProps={handlePropsUpdate}
                  />
                ) : (
                  <Empty description={`${selectedNode.type} 暂无属性配置`} />
                )}
              </InspectorSection>
              <InspectorSection title="样式配置" titleId="inspector-sec-style">
                <StyleForm schema={selectedNode} onUpdateStyle={handleInlineStyleUpdate} />
              </InspectorSection>
            </>
          )}
        </div>

        <div
          id={INSPECTOR_TAB_IDS.panelInfo}
          role="tabpanel"
          aria-labelledby={INSPECTOR_TAB_IDS.tabInfo}
          hidden={activeTab !== 'info'}
        >
          {activeTab === 'info' && (
            <section className={styles.section} aria-label="组件信息">
              <div className={styles.infoRow}>
                <div className={styles.infoKey}>组件 ID</div>
                <div className={styles.infoVal}>
                  <code
                    style={{
                      background: 'var(--theme-accent-soft, #fff7ed)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {selectedNode.id}
                  </code>
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoKey}>组件 Type</div>
                <div className={styles.infoVal}>
                  <span className={styles.typeBadge}>{selectedNode.type}</span>
                </div>
              </div>
              <div style={{ paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--theme-divider, #fde8d4)' }}>
                <div className={styles.schemaTitle}>组件 Schema</div>
                <pre className={styles.schemaBlock}>{schemaPreview}</pre>
                <Button
                  type="tertiary"
                  size="small"
                  style={{ marginTop: 10 }}
                  onClick={() => setSchemaModalVisible(true)}
                >
                  编辑 Schema
                </Button>
              </div>
            </section>
          )}
        </div>
      </InspectorShell>

      <Modal
        title="编辑 Schema"
        visible={schemaModalVisible}
        onCancel={() => setSchemaModalVisible(false)}
        width={560}
        footer={null}
        maskClosable
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonacoSchemaEditor value={schemaText} onChange={handleSchemaChange} />
          <div style={{ fontSize: 12, color: schemaError ? 'var(--theme-error)' : 'var(--theme-text-secondary)' }}>
            {schemaError ?? '合法 JSON 会实时同步到画布'}
          </div>
          <Button type="primary" onClick={() => setSchemaModalVisible(false)}>
            完成
          </Button>
        </div>
      </Modal>
    </div>
  );
};
