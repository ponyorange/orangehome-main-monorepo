import React, { useCallback, useId } from 'react';
import { InputNumber, Radio, Select } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import { getResolvedInlineStyle } from '../../../../common/base/schemaOperator';
import { isStyleLayerFloating, withMoveLayerPosition } from '../../../../common/base/editorLayerStyle';
import { ColorPicker } from './ColorPicker';
import {
  InspectorFormGrid,
  InspectorFormRow,
  InspectorFormRowFull,
} from './inspector';
import styles from './inspector/inspector.module.css';

interface StyleFormProps {
  schema: ISchema;
  onUpdateStyle: (style: Record<string, unknown>) => void;
}

function readFontSize(style: Record<string, unknown>): number | undefined {
  const v = style.fontSize;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const m = v.trim().match(/^(\d+(?:\.\d+)?)\s*px$/i);
    if (m) return parseFloat(m[1]);
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** 与 Select 选项对齐，便于回显 number / string 混存的数据 */
function readFontWeightValue(style: Record<string, unknown>): string {
  const v = style.fontWeight;
  if (v === undefined || v === null || v === '') return 'normal';
  if (v === 700 || v === '700' || v === 'bold') return 'bold';
  if (v === 600 || v === '600') return '600';
  if (v === 500 || v === '500') return '500';
  if (v === 400 || v === '400' || v === 'normal') return 'normal';
  return String(v);
}

export const StyleForm: React.FC<StyleFormProps> = ({ schema, onUpdateStyle }) => {
  const baseId = useId();
  const style = getResolvedInlineStyle(schema);
  const floating = isStyleLayerFloating(style);
  const layerMode: 'relative' | 'absolute' = floating ? 'absolute' : 'relative';

  const updateStyle = useCallback(
    (key: string, value: unknown) => {
      const next = { ...style, [key]: value };
      onUpdateStyle(floating ? withMoveLayerPosition(next) : next);
    },
    [style, onUpdateStyle, floating],
  );

  const setLayerMode = useCallback(
    (pos: 'relative' | 'absolute') => {
      const s = { ...getResolvedInlineStyle(schema) };
      if (pos === 'absolute') {
        const mt = typeof s.marginTop === 'number' ? s.marginTop : 0;
        const ml = typeof s.marginLeft === 'number' ? s.marginLeft : 0;
        const top = typeof s.top === 'number' ? s.top : mt;
        const left = typeof s.left === 'number' ? s.left : ml;
        onUpdateStyle(
          withMoveLayerPosition({
            ...s,
            top,
            left,
            marginTop: 0,
            marginLeft: 0,
          }),
        );
      } else {
        const top = typeof s.top === 'number' ? s.top : 0;
        const left = typeof s.left === 'number' ? s.left : 0;
        const mt = typeof s.marginTop === 'number' ? s.marginTop : 0;
        const ml = typeof s.marginLeft === 'number' ? s.marginLeft : 0;
        const next = { ...s };
        delete next.top;
        delete next.left;
        onUpdateStyle({
          ...next,
          position: 'relative',
          marginTop: mt + top,
          marginLeft: ml + left,
        });
      }
    },
    [schema, onUpdateStyle],
  );

  const numVal = (key: string) => {
    const v = style[key];
    return typeof v === 'number' ? v : undefined;
  };

  const strVal = (key: string) => {
    const v = style[key];
    return typeof v === 'string' ? v : '';
  };

  const id = (suffix: string) => `${baseId}-${suffix}`;

  return (
    <InspectorFormGrid>
      <InspectorFormRowFull>
        <div className={styles.subsectionTitle}>布局</div>
      </InspectorFormRowFull>
      <InspectorFormRow label="宽度" htmlFor={id('w')}>
        <InputNumber
          id={id('w')}
          size="small"
          value={numVal('width')}
          placeholder="auto"
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('width', v)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="高度" htmlFor={id('h')}>
        <InputNumber
          id={id('h')}
          size="small"
          value={numVal('height')}
          placeholder="auto"
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('height', v)}
        />
      </InspectorFormRow>

      <InspectorFormRowFull>
        <div className={styles.subsectionTitle}>图层</div>
        <Radio.Group
          type="button"
          buttonSize="small"
          value={layerMode}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'relative' || v === 'absolute') setLayerMode(v);
          }}
        >
          <Radio value="relative">堆叠</Radio>
          <Radio value="absolute">移动</Radio>
        </Radio.Group>
      </InspectorFormRowFull>

      {floating ? (
        <>
          <InspectorFormRow label="Top" htmlFor={id('top')}>
            <InputNumber
              id={id('top')}
              size="small"
              value={numVal('top') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('top', v ?? 0)}
            />
          </InspectorFormRow>
          <InspectorFormRow label="Left" htmlFor={id('left')}>
            <InputNumber
              id={id('left')}
              size="small"
              value={numVal('left') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('left', v ?? 0)}
            />
          </InspectorFormRow>
        </>
      ) : (
        <>
          <InspectorFormRow label="上边距" htmlFor={id('mt')}>
            <InputNumber
              id={id('mt')}
              size="small"
              value={numVal('marginTop') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginTop', v ?? 0)}
            />
          </InspectorFormRow>
          <InspectorFormRow label="左边距" htmlFor={id('ml')}>
            <InputNumber
              id={id('ml')}
              size="small"
              value={numVal('marginLeft') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginLeft', v ?? 0)}
            />
          </InspectorFormRow>
          <InspectorFormRow label="下边距" htmlFor={id('mb')}>
            <InputNumber
              id={id('mb')}
              size="small"
              value={numVal('marginBottom') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginBottom', v ?? 0)}
            />
          </InspectorFormRow>
          <InspectorFormRow label="右边距" htmlFor={id('mr')}>
            <InputNumber
              id={id('mr')}
              size="small"
              value={numVal('marginRight') ?? 0}
              style={{ width: '100%' }}
              onChange={(v) => updateStyle('marginRight', v ?? 0)}
            />
          </InspectorFormRow>
        </>
      )}

      <InspectorFormRowFull>
        <div className={styles.subsectionTitle}>内边距</div>
      </InspectorFormRowFull>
      <InspectorFormRow label="上" htmlFor={id('pt')}>
        <InputNumber
          id={id('pt')}
          size="small"
          value={numVal('paddingTop') ?? numVal('padding') ?? 0}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('paddingTop', v ?? 0)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="下" htmlFor={id('pb')}>
        <InputNumber
          id={id('pb')}
          size="small"
          value={numVal('paddingBottom') ?? numVal('padding') ?? 0}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('paddingBottom', v ?? 0)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="左" htmlFor={id('pl')}>
        <InputNumber
          id={id('pl')}
          size="small"
          value={numVal('paddingLeft') ?? numVal('padding') ?? 0}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('paddingLeft', v ?? 0)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="右" htmlFor={id('pr')}>
        <InputNumber
          id={id('pr')}
          size="small"
          value={numVal('paddingRight') ?? numVal('padding') ?? 0}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('paddingRight', v ?? 0)}
        />
      </InspectorFormRow>

      <InspectorFormRowFull>
        <div className={styles.subsectionTitle}>文字</div>
      </InspectorFormRowFull>
      <InspectorFormRow label="字体大小" htmlFor={id('fs')}>
        <InputNumber
          id={id('fs')}
          size="small"
          value={readFontSize(style)}
          placeholder="默认"
          min={8}
          max={200}
          style={{ width: '100%' }}
          onChange={(v) => {
            if (v == null || v === '') {
              const next = { ...style };
              delete next.fontSize;
              onUpdateStyle(floating ? withMoveLayerPosition(next) : next);
              return;
            }
            updateStyle('fontSize', v);
          }}
        />
      </InspectorFormRow>
      <InspectorFormRow label="字体颜色">
        <ColorPicker
          value={strVal('color') || '#333333'}
          onChange={(v) => updateStyle('color', v)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="字体粗细" htmlFor={id('fw')}>
        <Select
          id={id('fw')}
          size="small"
          value={readFontWeightValue(style)}
          style={{ width: '100%' }}
          onChange={(v) => {
            if (v == null || v === 'normal') {
              const next = { ...style };
              delete next.fontWeight;
              onUpdateStyle(floating ? withMoveLayerPosition(next) : next);
              return;
            }
            updateStyle('fontWeight', v);
          }}
        >
          <Select.Option value="normal">常规 (400)</Select.Option>
          <Select.Option value="500">中等 (500)</Select.Option>
          <Select.Option value="600">半粗 (600)</Select.Option>
          <Select.Option value="bold">粗体</Select.Option>
        </Select>
      </InspectorFormRow>

      <InspectorFormRowFull>
        <div className={styles.subsectionTitle}>外观</div>
      </InspectorFormRowFull>
      <InspectorFormRow label="背景色">
        <ColorPicker
          value={strVal('background') || strVal('backgroundColor') || 'transparent'}
          onChange={(v) => updateStyle('background', v)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="透明度" htmlFor={id('op')}>
        <InputNumber
          id={id('op')}
          size="small"
          value={numVal('opacity') ?? 1}
          min={0}
          max={1}
          step={0.1}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('opacity', v)}
        />
      </InspectorFormRow>
      <InspectorFormRow label="圆角" htmlFor={id('br')}>
        <InputNumber
          id={id('br')}
          size="small"
          value={numVal('borderRadius') ?? 0}
          min={0}
          max={200}
          style={{ width: '100%' }}
          onChange={(v) => updateStyle('borderRadius', v)}
        />
      </InspectorFormRow>
    </InspectorFormGrid>
  );
};
