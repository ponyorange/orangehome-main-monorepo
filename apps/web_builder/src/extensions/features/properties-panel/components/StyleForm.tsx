import React, { useCallback } from 'react';
import { InputNumber } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import { getResolvedInlineStyle } from '../../../../common/base/schemaOperator';
import { ColorPicker } from './ColorPicker';

interface StyleFormProps {
  schema: ISchema;
  onUpdateStyle: (style: Record<string, unknown>) => void;
}

export const StyleForm: React.FC<StyleFormProps> = ({ schema, onUpdateStyle }) => {
  const style = getResolvedInlineStyle(schema);

  const updateStyle = useCallback((key: string, value: unknown) => {
    onUpdateStyle({ ...style, [key]: value });
  }, [style, onUpdateStyle]);

  const numVal = (key: string) => {
    const v = style[key];
    return typeof v === 'number' ? v : undefined;
  };

  const strVal = (key: string) => {
    const v = style[key];
    return typeof v === 'string' ? v : '';
  };

  return (
    <div>
      {/* 布局 */}
      <div style={{ marginBottom: 16 }}>
        <div style={groupTitleStyle}>布局</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FieldRow label="宽度">
            <InputNumber size="small" value={numVal('width')} placeholder="auto" style={{ width: '100%' }}
              onChange={(v) => updateStyle('width', v)} />
          </FieldRow>
          <FieldRow label="高度">
            <InputNumber size="small" value={numVal('height')} placeholder="auto" style={{ width: '100%' }}
              onChange={(v) => updateStyle('height', v)} />
          </FieldRow>
        </div>
      </div>

      {/* 位置偏移 */}
      <div style={{ marginBottom: 16 }}>
        <div style={groupTitleStyle}>位置偏移</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FieldRow label="上边距">
            <InputNumber size="small" value={numVal('marginTop') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginTop', v ?? 0)} />
          </FieldRow>
          <FieldRow label="左边距">
            <InputNumber size="small" value={numVal('marginLeft') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginLeft', v ?? 0)} />
          </FieldRow>
          <FieldRow label="下边距">
            <InputNumber size="small" value={numVal('marginBottom') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginBottom', v ?? 0)} />
          </FieldRow>
          <FieldRow label="右边距">
            <InputNumber size="small" value={numVal('marginRight') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginRight', v ?? 0)} />
          </FieldRow>
        </div>
      </div>

      {/* 内边距 */}
      <div style={{ marginBottom: 16 }}>
        <div style={groupTitleStyle}>内边距</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FieldRow label="上">
            <InputNumber size="small" value={numVal('paddingTop') ?? numVal('padding') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('paddingTop', v ?? 0)} />
          </FieldRow>
          <FieldRow label="下">
            <InputNumber size="small" value={numVal('paddingBottom') ?? numVal('padding') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('paddingBottom', v ?? 0)} />
          </FieldRow>
          <FieldRow label="左">
            <InputNumber size="small" value={numVal('paddingLeft') ?? numVal('padding') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('paddingLeft', v ?? 0)} />
          </FieldRow>
          <FieldRow label="右">
            <InputNumber size="small" value={numVal('paddingRight') ?? numVal('padding') ?? 0} style={{ width: '100%' }}
              onChange={(v) => updateStyle('paddingRight', v ?? 0)} />
          </FieldRow>
        </div>
      </div>

      {/* 外观 */}
      <div style={{ marginBottom: 16 }}>
        <div style={groupTitleStyle}>外观</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldRow label="背景色">
            <ColorPicker value={strVal('background') || strVal('backgroundColor') || 'transparent'}
              onChange={(v) => updateStyle('background', v)} />
          </FieldRow>
          <FieldRow label="透明度">
            <InputNumber size="small" value={numVal('opacity') ?? 1} min={0} max={1} step={0.1} style={{ width: '100%' }}
              onChange={(v) => updateStyle('opacity', v)} />
          </FieldRow>
          <FieldRow label="圆角">
            <InputNumber size="small" value={numVal('borderRadius') ?? 0} min={0} max={200} style={{ width: '100%' }}
              onChange={(v) => updateStyle('borderRadius', v)} />
          </FieldRow>
        </div>
      </div>
    </div>
  );
};

const groupTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  marginBottom: 8,
  paddingBottom: 4,
  borderBottom: '1px solid #f0f0f0',
};

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <label style={{ fontSize: 12, color: '#888', width: 42, flexShrink: 0, textAlign: 'right' }}>
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);
