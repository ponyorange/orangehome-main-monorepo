import React, { useCallback, useId } from 'react';
import { Input, InputNumber, Select, Switch, TextArea } from '@douyinfe/semi-ui';
import type { ISchema, ISchemaEditorConfigPropItem } from '../../../../types/base';
import { ColorPicker } from './ColorPicker';
import { ImageInput } from './ImageInput';
import { InspectorFormGrid, InspectorFormRow } from './inspector';

interface EditorConfigPropsFormProps {
  schema: ISchema;
  items: ISchemaEditorConfigPropItem[];
  onUpdateProps: (props: Record<string, unknown>) => void;
}

function propValue(schema: ISchema, key: string): unknown {
  return schema.props[key];
}

export const EditorConfigPropsForm: React.FC<EditorConfigPropsFormProps> = ({
  schema,
  items,
  onUpdateProps,
}) => {
  const baseId = useId();
  const patch = useCallback(
    (key: string, value: unknown) => {
      onUpdateProps({ ...schema.props, [key]: value });
    },
    [schema.props, onUpdateProps],
  );

  const fid = (key: string) => `${baseId}-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const renderField = (item: ISchemaEditorConfigPropItem) => {
    const value = propValue(schema, item.key);
    const t = (item.type || 'input').toLowerCase();
    const inputId = fid(item.key);

    switch (t) {
      case 'input':
      case 'text':
        return (
          <Input
            id={inputId}
            size="small"
            value={(value as string) ?? ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'textarea':
        return (
          <TextArea
            id={inputId}
            rows={3}
            value={(value as string) ?? ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'number':
        return (
          <InputNumber
            id={inputId}
            size="small"
            value={(value as number) ?? undefined}
            min={item.min}
            max={item.max}
            step={item.step ?? 1}
            style={{ width: '100%' }}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'select':
        return (
          <Select
            id={inputId}
            size="small"
            value={(value as string) ?? undefined}
            style={{ width: '100%' }}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          >
            {(item.options ?? []).map((opt) => (
              <Select.Option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'switch':
      case 'boolean':
        return (
          <Switch id={inputId} size="small" checked={!!value} onChange={(v) => patch(item.key, v)} />
        );
      case 'color':
        return (
          <ColorPicker
            value={(value as string) ?? '#000000'}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'imageupload':
      case 'image':
        return (
          <ImageInput
            value={(value as string) ?? ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
      default:
        return (
          <Input
            id={inputId}
            size="small"
            value={value != null ? String(value) : ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
    }
  };

  const labelFor = (item: ISchemaEditorConfigPropItem) => {
    const t = (item.type || 'input').toLowerCase();
    if (t === 'switch' || t === 'boolean' || t === 'color' || t === 'imageupload' || t === 'image') {
      return undefined;
    }
    return fid(item.key);
  };

  return (
    <InspectorFormGrid>
      {items.map((item) => {
        if (!item.key) return null;
        const label = item.label ?? item.key;
        return (
          <InspectorFormRow key={item.key} label={label} htmlFor={labelFor(item)}>
            {renderField(item)}
          </InspectorFormRow>
        );
      })}
    </InspectorFormGrid>
  );
};
