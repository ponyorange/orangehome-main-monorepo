import * as React from 'react';
import {
  collectSchemaTypes,
  renderSchemaNode,
  type OhSchemaNode,
} from './schema-ssr-render.util';

describe('schema-ssr-render', () => {
  it('collectSchemaTypes collects unique types', () => {
    const root: OhSchemaNode = {
      id: '1',
      type: 'root',
      children: [
        { id: '2', type: 'a', children: [] },
        { id: '3', type: 'b', children: [{ id: '4', type: 'a', children: [] }] },
      ],
    };
    expect([...collectSchemaTypes(root)].sort()).toEqual(['a', 'b', 'root']);
  });

  it('renderSchemaNode matches SchemaRender props shape', () => {
    const Btn = (props: Record<string, unknown>) =>
      React.createElement('button', { id: props.id }, props.children as React.ReactNode);
    const registry = { btn: Btn as React.ComponentType<Record<string, unknown>> };
    const node: OhSchemaNode = {
      id: 'x',
      type: 'btn',
      style: { width: 100 },
      props: { text: 'go' },
      children: [],
    };
    const el = renderSchemaNode(node, registry);
    expect(el).not.toBeNull();
    expect(el!.props.id).toBe('x');
    expect(el!.props.style).toMatchObject({ width: expect.stringMatching(/rem$/) });
    expect(el!.props.text).toBe('go');
  });
});
