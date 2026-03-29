import React, { useCallback, useId } from 'react';
import { Input, InputNumber, Select, Switch, Slider } from '@douyinfe/semi-ui';
import type { ISchema } from '../../../../types/base';
import { getResolvedInlineStyle } from '../../../../common/base/schemaOperator';
import type { FieldConfig, ComponentConfig } from '../configs/types';
import { ColorPicker } from './ColorPicker';
import { ImageInput } from './ImageInput';
import {
  InspectorFormGrid,
  InspectorFormRow,
} from './inspector';
import styles from './inspector/inspector.module.css';

interface PropertyFormProps {
  schema: ISchema;
  config: ComponentConfig;
  onUpdateProps: (props: Record<string, unknown>) => void;
  onUpdateStyle: (style: Record<string, unknown>) => void;
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

export const PropertyForm: React.FC<PropertyFormProps> = ({
  schema,
  config,
  onUpdateProps,
  onUpdateStyle,
}) => {
  const baseId = useId();
  const handleChange = useCallback((field: FieldConfig, value: unknown) => {
    if (field.key.startsWith('style.')) {
      const sk = field.key.slice('style.'.length);
      const base = { ...getResolvedInlineStyle(schema), [sk]: value };
      if (sk === 'top' || sk === 'left') {
        base.position = 'absolute';
      }
      onUpdateStyle(base);
      return;
    }
    const base = { ...schema.props } as Record<string, unknown>;
    delete base.style;
    const newProps = setNestedValue(base, field.key, value);
    onUpdateProps(newProps);
  }, [schema, onUpdateProps, onUpdateStyle]);

  const fieldDomId = (field: FieldConfig) =>
    `${baseId}-${field.key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const renderField = (field: FieldConfig) => {
    const fid = fieldDomId(field);
    const value = field.key.startsWith('style.')
      ? getResolvedInlineStyle(schema)[field.key.slice('style.'.length)]
      : getNestedValue(schema.props, field.key);

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={fid}
            size="small"
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'number':
        return (
          <InputNumber
            id={fid}
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
            id={fid}
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
            id={fid}
            size="small"
            checked={!!value}
            onChange={(v) => handleChange(field, v)}
          />
        );
      case 'slider':
        return (
          <div id={fid}>
            <Slider
              value={(value as number) ?? field.defaultValue ?? 0}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              onChange={(v) => handleChange(field, v)}
            />
          </div>
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
          <div className={styles.subsectionTitle}>{group.title}</div>
          <InspectorFormGrid>
            {group.fields.map((field) => {
              const labelFor =
                field.type === 'switch' || field.type === 'slider' || field.type === 'color' || field.type === 'image'
                  ? undefined
                  : fieldDomId(field);
              return (
                <React.Fragment key={field.key}>
                  <InspectorFormRow label={field.label} htmlFor={labelFor}>
                    {renderField(field)}
                  </InspectorFormRow>
                </React.Fragment>
              );
            })}
          </InspectorFormGrid>
        </div>
      ))}
    </div>
  );
};
