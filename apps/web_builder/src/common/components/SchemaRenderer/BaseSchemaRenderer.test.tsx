import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BaseSchemaRenderer } from './BaseSchemaRenderer';
import { ComponentManager } from './ComponentManager';
import type { ISchema } from '../../../types/base';

const mockDiv: React.FC<Record<string, unknown>> = (props) => (
  <div data-testid="mock-div" {...props} />
);
const mockButton: React.FC<Record<string, unknown>> = (props) => (
  <button data-testid="mock-button" type="button" {...props} />
);

describe('BaseSchemaRenderer', () => {
  it('应正确渲染包含 div 和 button 的 schema 树', async () => {
    const manager = new ComponentManager();
    manager.registerStatic('div', mockDiv);
    manager.registerStatic('button', mockButton);

    const schema: ISchema = {
      id: 'root',
      name: 'Root',
      type: 'div',
      props: {},
      children: [
        {
          id: 'btn',
          name: 'Btn',
          type: 'button',
          props: { children: '点击' },
        },
      ],
    };

    render(
      <BaseSchemaRenderer schema={schema} componentManager={manager} />
    );

    await screen.findByTestId('mock-div');
    expect(screen.getByTestId('mock-div')).toBeDefined();
    expect(screen.getByTestId('mock-button')).toBeDefined();
    expect(screen.getByText('点击')).toBeDefined();
  });

  it('当组件加载失败时应显示错误信息', async () => {
    const manager = new ComponentManager();
    manager.registerStatic('div', mockDiv);

    const schema: ISchema = {
      id: 'x',
      name: 'Unknown',
      type: 'unknown-type',
      props: {},
    };

    render(
      <BaseSchemaRenderer schema={schema} componentManager={manager} />
    );

    const errorEl = await screen.findByText(/加载失败/);
    expect(errorEl).toBeDefined();
    expect(screen.getByText(/unknown-type/)).toBeDefined();
  });
});
