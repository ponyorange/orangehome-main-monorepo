export type FieldType = 'text' | 'number' | 'select' | 'switch' | 'slider' | 'color' | 'image';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  defaultValue?: unknown;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ComponentConfig {
  type: string;
  name: string;
  groups: {
    title: string;
    fields: FieldConfig[];
  }[];
}
