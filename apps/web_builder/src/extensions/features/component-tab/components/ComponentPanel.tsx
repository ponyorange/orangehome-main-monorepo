import React, { useState, useMemo } from 'react';
import { Input, Tabs, Empty, Spin } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { basicComponents, type ComponentCatalogItem } from '../catalog';
import { DraggableComponentItem } from './DraggableComponentItem';
import { componentListItemToCatalogItem, useComponentList } from '../../../../data/modules';

const { TabPane } = Tabs;

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
  padding: 12,
};

function getPageIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('pageId');
}

export const ComponentPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const pageId = useMemo(() => getPageIdFromLocation(), []);

  const { data: componentListData, error: componentListError, isLoading: componentListLoading } = useComponentList(
    pageId,
    'dev',
    Boolean(pageId),
  );

  const businessRows = useMemo(() => {
    if (!componentListData?.items?.length) return [];
    return componentListData.items
      .map((row) => {
        const item = componentListItemToCatalogItem(row);
        return item ? { key: row.material.id, item } : null;
      })
      .filter((x): x is { key: string; item: ComponentCatalogItem } => x != null);
  }, [componentListData]);

  const filteredBasic = useMemo(
    () => basicComponents.filter((c) => c.name.includes(search) || c.type.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const filteredBusiness = useMemo(
    () =>
      businessRows.filter(
        ({ item }) => item.name.includes(search) || item.type.toLowerCase().includes(search.toLowerCase()),
      ),
    [businessRows, search],
  );

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

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Tabs
          tabPosition="left"
          type="line"
          style={{ height: '100%' }}
          className="component-tabs"
        >
          <TabPane tab="基础" itemKey="basic" className="component-tabpane">
            <div style={{ height: '100%', overflow: 'auto' }}>
              {filteredBasic.length > 0 ? (
                <div style={gridStyle}>
                  {filteredBasic.map((item) => (
                    <DraggableComponentItem key={item.type} item={item} />
                  ))}
                </div>
              ) : (
                <Empty description="没有匹配的组件" style={{ marginTop: 40 }} />
              )}
            </div>
          </TabPane>
          <TabPane tab="业务" itemKey="business" className="component-tabpane">
            <div style={{ height: '100%', overflow: 'auto' }}>
              {!pageId ? (
                <Empty description="缺少 pageId 参数，无法加载业务组件" style={{ marginTop: 40 }} />
              ) : componentListLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
                  <Spin />
                </div>
              ) : componentListError ? (
                <Empty description={componentListError.message || '业务组件列表加载失败'} style={{ marginTop: 40 }} />
              ) : filteredBusiness.length > 0 ? (
                <div style={gridStyle}>
                  {filteredBusiness.map(({ key, item }) => (
                    <DraggableComponentItem key={key} item={item} />
                  ))}
                </div>
              ) : (
                <Empty description="暂无可用业务组件（需物料版本含 bundle 地址或 editorConfig 中的 remote）" style={{ marginTop: 40 }} />
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
