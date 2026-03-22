import React, { useMemo, useState } from 'react';
import { Input, Empty, Spin } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import type { ComponentCatalogItem } from '../catalog';
import { DraggableComponentItem } from './DraggableComponentItem';
import { componentListItemToCatalogItem, useComponentList } from '../../../../data/modules';
import { useEditorPageId } from '../../../../core/context/EditorPageContext';
import { useMaterialBundleStore } from '../../../../core/store/materialBundleStore';
import type { ISchemaEditorConfig } from '../../../../types/base';

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
  padding: '0 12px 12px',
};

const sectionTitleStyle: React.CSSProperties = {
  padding: '10px 12px 6px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.02,
  color: 'var(--theme-text-secondary)',
};

function isRemoteContainerCategory(categoryName: string): boolean {
  const c = categoryName.trim();
  return c === '容器' || c.includes('容器');
}

type RemoteRow = { key: string; item: ComponentCatalogItem; categoryName: string };

function matchesSearch(item: ComponentCatalogItem, search: string): boolean {
  if (!search.trim()) return true;
  return item.name.includes(search) || item.type.toLowerCase().includes(search.toLowerCase());
}

function isHiddenInComponentList(
  editorConfigs: Record<string, ISchemaEditorConfig>,
  materialUid: string,
): boolean {
  const caps = editorConfigs[materialUid]?.editorCapabilities;
  return caps?.hideInComponentList === true;
}

export const ComponentPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const pageId = useEditorPageId();
  const editorConfigs = useMaterialBundleStore((s) => s.editorConfigs);

  const { data: componentListData, error: componentListError, isLoading: componentListLoading } = useComponentList(
    pageId,
    'dev',
    Boolean(pageId),
  );

  const remoteRows = useMemo((): RemoteRow[] => {
    if (!componentListData?.items?.length) return [];
    return componentListData.items
      .map((row) => {
        const uid = row.material.materialUid?.trim();
        if (uid && isHiddenInComponentList(editorConfigs, uid)) return null;
        const item = componentListItemToCatalogItem(row);
        if (!item) return null;
        const categoryName = row.material.categoryName?.trim() || '基础';
        return { key: row.material.id, item, categoryName };
      })
      .filter((x): x is RemoteRow => x != null);
  }, [componentListData, editorConfigs]);

  const remoteBasicRows = useMemo(
    () => remoteRows.filter((r) => !isRemoteContainerCategory(r.categoryName)),
    [remoteRows],
  );

  const remoteContainerRows = useMemo(
    () => remoteRows.filter((r) => isRemoteContainerCategory(r.categoryName)),
    [remoteRows],
  );

  const filteredRemoteBasic = useMemo(
    () => remoteBasicRows.filter(({ item }) => matchesSearch(item, search)),
    [remoteBasicRows, search],
  );

  const filteredRemoteContainer = useMemo(
    () => remoteContainerRows.filter(({ item }) => matchesSearch(item, search)),
    [remoteContainerRows, search],
  );

  const hasBasicSection = filteredRemoteBasic.length > 0;
  const hasContainerSection = filteredRemoteContainer.length > 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid var(--theme-divider)' }}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索组件..."
          size="small"
          value={search}
          onChange={(v) => setSearch(v)}
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.72)',
          }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {!pageId ? (
          <Empty description="缺少 pageId，无法加载远端物料列表" style={{ marginTop: 40 }} />
        ) : componentListLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <Spin />
          </div>
        ) : componentListError ? (
          <Empty description={componentListError.message || '物料列表加载失败'} style={{ marginTop: 40 }} />
        ) : !hasBasicSection && !hasContainerSection ? (
          <Empty description="没有匹配的组件" style={{ marginTop: 40 }} />
        ) : (
          <>
            {hasBasicSection ? (
              <div>
                <div style={sectionTitleStyle}>基础</div>
                <div style={gridStyle}>
                  {filteredRemoteBasic.map(({ key, item }) => (
                    <DraggableComponentItem key={key} item={item} />
                  ))}
                </div>
              </div>
            ) : null}

            {hasContainerSection ? (
              <div>
                <div style={sectionTitleStyle}>容器</div>
                <div style={gridStyle}>
                  {filteredRemoteContainer.map(({ key, item }) => (
                    <DraggableComponentItem key={key} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
