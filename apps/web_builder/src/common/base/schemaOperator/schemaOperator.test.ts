import { describe, it, expect } from 'vitest';
import {
  updateNodePropsById,
  readNodeById,
  deleteNodeById,
  addChildNode,
} from './index';
import type { ISchema } from '../../../types/base';

const mockSchema: ISchema = {
  id: 'root',
  name: 'Root',
  type: 'page',
  children: [
    {
      id: 'a',
      name: 'BlockA',
      type: 'block',
      props: { title: 'A' },
      children: [
        { id: 'a1', name: 'BlockA1', type: 'text', props: {} },
        { id: 'a2', name: 'BlockA2', type: 'text', props: {} },
      ],
    },
    {
      id: 'b',
      name: 'BlockB',
      type: 'block',
      props: { title: 'B' },
      children: [],
    },
  ],
};

describe('schemaOperator', () => {
  describe('updateNodePropsById', () => {
    it('应正确更新节点属性', () => {
      const result = updateNodePropsById(mockSchema, 'a', { title: 'A-Updated' });
      expect(result).not.toBeNull();
      const node = readNodeById(result, 'a');
      expect(node?.props?.title).toBe('A-Updated');
    });

    it('应正确更新深层节点属性', () => {
      const result = updateNodePropsById(mockSchema, 'a1', { content: 'hello' });
      expect(result).not.toBeNull();
      const node = readNodeById(result!, 'a1');
      expect(node?.props?.content).toBe('hello');
    });

    it('当节点不存在时应返回原 schema', () => {
      const result = updateNodePropsById(mockSchema, 'not-exist', { x: 1 });
      expect(result).toBe(mockSchema);
    });

    it('当 schema 为 null 时应返回 null', () => {
      const result = updateNodePropsById(null, 'a', { title: 'x' });
      expect(result).toBeNull();
    });
  });

  describe('readNodeById', () => {
    it('应正确读取根节点', () => {
      const node = readNodeById(mockSchema, 'root');
      expect(node?.id).toBe('root');
      expect(node?.name).toBe('Root');
    });

    it('应正确读取深层节点', () => {
      const node = readNodeById(mockSchema, 'a1');
      expect(node?.id).toBe('a1');
      expect(node?.name).toBe('BlockA1');
    });

    it('当节点不存在时应返回 null', () => {
      const node = readNodeById(mockSchema, 'not-exist');
      expect(node).toBeNull();
    });

    it('当 schema 为 null 时应返回 null', () => {
      const node = readNodeById(null, 'a');
      expect(node).toBeNull();
    });
  });

  describe('deleteNodeById', () => {
    it('应正确删除子节点', () => {
      const result = deleteNodeById(mockSchema, 'a1');
      expect(result).not.toBeNull();
      const node = readNodeById(result!, 'a1');
      expect(node).toBeNull();
      const parent = readNodeById(result!, 'a');
      expect(parent?.children?.length).toBe(1);
      expect(parent?.children?.[0]?.id).toBe('a2');
    });

    it('删除根节点应返回 null', () => {
      const result = deleteNodeById(mockSchema, 'root');
      expect(result).toBeNull();
    });

    it('当 schema 为 null 时应返回 null', () => {
      const result = deleteNodeById(null, 'a');
      expect(result).toBeNull();
    });

    it('删除不存在的节点应返回原 schema', () => {
      const result = deleteNodeById(mockSchema, 'not-exist');
      expect(result).toEqual(mockSchema);
    });
  });

  describe('addChildNode', () => {
    it('应在指定位置添加子节点', () => {
      const newNode: ISchema = {
        id: 'new',
        name: 'NewBlock',
        type: 'block',
        props: {},
      };
      const result = addChildNode(mockSchema, 'a', newNode, 1);
      expect(result).not.toBeNull();
      const parent = readNodeById(result!, 'a');
      expect(parent?.children?.length).toBe(3);
      expect(parent?.children?.[1]?.id).toBe('new');
    });

    it('未指定 index 时应追加到末尾', () => {
      const newNode: ISchema = {
        id: 'tail',
        name: 'Tail',
        type: 'block',
        props: {},
      };
      const result = addChildNode(mockSchema, 'b', newNode);
      expect(result).not.toBeNull();
      const parent = readNodeById(result!, 'b');
      expect(parent?.children?.length).toBe(1);
      expect(parent?.children?.[0]?.id).toBe('tail');
    });

    it('父节点不存在时应返回原 schema', () => {
      const newNode: ISchema = { id: 'x', name: 'X', type: 'block', props: {} };
      const result = addChildNode(mockSchema, 'not-exist', newNode);
      expect(result).toBe(mockSchema);
    });

    it('当 schema 为 null 时应返回 null', () => {
      const newNode: ISchema = { id: 'x', name: 'X', type: 'block', props: {} };
      const result = addChildNode(null, 'a', newNode);
      expect(result).toBeNull();
    });
  });
});
