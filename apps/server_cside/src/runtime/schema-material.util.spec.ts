import { collectMaterialUids } from './schema-material.util';

describe('collectMaterialUids', () => {
  it('returns empty for null', () => {
    expect(collectMaterialUids(null)).toEqual([]);
  });

  it('collects type along children in preorder', () => {
    const schema = {
      type: 'root-type',
      children: [{ type: 'a' }, { type: 'b', children: [{ type: 'c' }] }],
    };
    expect(collectMaterialUids(schema)).toEqual(['root-type', 'a', 'b', 'c']);
  });

  it('does not walk arbitrary keys (only children)', () => {
    const schema = {
      a: { materialUid: 'm1' },
      children: [{ materialUid: 'm2' }],
    };
    expect(collectMaterialUids(schema)).toEqual([]);
  });

  it('collects all node types including @orangehome/common-component-*', () => {
    const schema = {
      id: 'root',
      type: '@orangehome/common-component-rootcontainer',
      children: [
        { id: '1', type: '@orangehome/common-component-text', children: [] },
        { id: '2', type: '@orangehome/common-component-button', children: [] },
        { id: '3', type: '@orangehome/common-component-image', children: [] },
      ],
    };
    expect(collectMaterialUids(schema)).toEqual([
      '@orangehome/common-component-rootcontainer',
      '@orangehome/common-component-text',
      '@orangehome/common-component-button',
      '@orangehome/common-component-image',
    ]);
  });

  it('collects custom type under root', () => {
    const schema = {
      id: 'root',
      type: '@orangehome/common-component-rootcontainer',
      children: [{ id: 'x', type: '6482afask4396634', name: 'Custom', children: [] }],
    };
    expect(collectMaterialUids(schema)).toEqual([
      '@orangehome/common-component-rootcontainer',
      '6482afask4396634',
    ]);
  });

  it('ignores root with only material_uid (no type / children)', () => {
    expect(collectMaterialUids({ material_uid: 'snake-uid' })).toEqual([]);
  });

  it('ignores empty type', () => {
    expect(collectMaterialUids({ type: '', children: [] })).toEqual([]);
  });
});
