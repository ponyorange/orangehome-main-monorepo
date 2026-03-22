import React, { useCallback } from 'react';
import { Input, InputNumber, Select, Switch, TextArea } from '@douyinfe/semi-ui';
import type { ISchema, ISchemaEditorConfigPropItem } from '../../../../types/base';
import { ColorPicker } from './ColorPicker';
import { ImageInput } from './ImageInput';

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
  const patch = useCallback(
    (key: string, value: unknown) => {
      onUpdateProps({ ...schema.props, [key]: value });
    },
    [schema.props, onUpdateProps],
  );

  const renderField = (item: ISchemaEditorConfigPropItem) => {
    const value = propValue(schema, item.key);
    const t = (item.type || 'input').toLowerCase();

    switch (t) {
      case 'input':
      case 'text':
        return (
          <Input
            size="small"
            value={(value as string) ?? ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'textarea':
        return (
          <TextArea
            rows={3}
            value={(value as string) ?? ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
      case 'number':
        return (
          <InputNumber
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
          <Switch size="small" checked={!!value} onChange={(v) => patch(item.key, v)} />
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
            size="small"
            value={value != null ? String(value) : ''}
            placeholder={item.placeholder}
            onChange={(v) => patch(item.key, v)}
          />
        );
    }
  };

  return (
    <div>
      {items.map((item) => {
        if (!item.key) return null;
        const label = item.label ?? item.key;
        return (
          <div
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8,
              gap: 8,
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: '#666',
                width: 70,
                flexShrink: 0,
                textAlign: 'right',
              }}
            >
              {label}
            </label>
            <div style={{ flex: 1 }}>{renderField(item)}</div>
          </div>
        );
      })}
    </div>
  );
};
