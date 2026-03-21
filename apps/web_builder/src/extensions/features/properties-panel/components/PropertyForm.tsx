import React, { useCallback } from 'react';
import { Input, InputNumber, Select, Switch, Slider } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import type { FieldConfig, ComponentConfig } from '../configs/types';
import { ColorPicker } from './ColorPicker';
import { ImageInput } from './ImageInput';

interface PropertyFormProps {
  schema: ISchema;
  config: ComponentConfig;
  onUpdate: (props: Record<string, unknown>) => void;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.');
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value };
  }
  const [first, ...rest] = keys;
  const child = (obj[first] as Record<string, unknown>) ?? {};
  return { ...obj, [first]: setNestedValue(child, rest.join('.'), value) };
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ schema, config, onUpdate }) => {
  const handleChange = useCallback((field: FieldConfig, value: unknown) => {
    const newProps = setNestedValue(schema.props, field.key, value);
    onUpdate(newProps);
  }, [schema.props, onUpdate]);

  const renderField = (field: FieldConfig) => {
    const value = getNestedValue(schema.props, field.key);

    switch (field.type) {
      case 'text':
        return (
          <Input
            size="small"
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'number':
        return (
          <InputNumber
            size="small"
            value={(value as number) ?? field.defaultValue ?? 0}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            style={{ width: '100%' }}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'select':
        return (
          <Select
            size="small"
            value={(value as string) ?? field.defaultValue}
            style={{ width: '100%' }}
            onChange={(v) => handleChange(field, v)}
          >
            {field.options?.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))}
          </Select>
        );
      case 'switch':
        return (
          <Switch
            size="small"
            checked={!!value}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'slider':
        return (
          <Slider
            value={(value as number) ?? field.defaultValue ?? 0}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'color':
        return (
          <ColorPicker
            value={(value as string) ?? (field.defaultValue as string) ?? '#000000'}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'image':
        return (
          <ImageInput
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(v) => handleChange(field, v)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {config.groups.map((group) => (
        <div key={group.title} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#666',
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: '1px solid #f0f0f0',
          }}>
            {group.title}
          </div>
          {group.fields.map((field) => (
            <div key={field.key} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8,
              gap: 8,
            }}>
              <label style={{
                fontSize: 12,
                color: '#666',
                width: 70,
                flexShrink: 0,
                textAlign: 'right',
              }}>
                {field.label}
              </label>
              <div style={{ flex: 1 }}>
                {renderField(field)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
