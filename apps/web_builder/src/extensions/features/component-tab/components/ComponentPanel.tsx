import React, { useState, useMemo } from 'react';
import { Input, Tabs, Empty } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { basicComponents, businessComponents } from '../catalog';
import { DraggableComponentItem } from './DraggableComponentItem';

const { TabPane } = Tabs;

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  padding: 12,
};

export const ComponentPanel: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredBasic = useMemo(
    () => basicComponents.filter((c) => c.name.includes(search) || c.type.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const filteredBusiness = useMemo(
    () => businessComponents.filter((c) => c.name.includes(search) || c.type.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索组件..."
          size="small"
          value={search}
          onChange={(v) => setSearch(v)}
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
              {filteredBusiness.length > 0 ? (
                <div style={gridStyle}>
                  {filteredBusiness.map((item) => (
                    <DraggableComponentItem key={item.type} item={item} />
                  ))}
                </div>
              ) : (
                <Empty description="暂无业务组件" style={{ marginTop: 40 }} />
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
