import { Card, Typography, Button, Tree, Modal, Form, Toast, Popconfirm, Select } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialCategoryApi } from '@/services/materialCategory';
import { materialTypeApi } from '@/services/materialType';
import { platformApi } from '@/services/platform';
import type { MaterialCategory, CreateMaterialCategoryParams } from '@/types/materialCategory';

const { Title } = Typography;
const { Option } = Select;

export function MaterialCategories() {
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreateMaterialCategoryParams>>({
    categoryName: '',
    categoryCode: '',
    description: '',
    typeId: '',
    platformId: '',
    parentId: null,
    sortOrder: 0,
  });

  const { data, mutate } = useSWR(
    ['materialCategories-tree'],
    () => materialCategoryApi.getTreeList(),
    { revalidateOnFocus: false }
  );

  const { data: typeData } = useSWR(['materialTypes-all'], () => materialTypeApi.getList(), { revalidateOnFocus: false });
  const { data: platformData } = useSWR(['platforms-all'], () => platformApi.getList({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
  const types = typeData?.data || [];
  const platforms = platformData?.data || [];

  const { trigger: createTrigger } = useSWRMutation(
    'materialCategories',
    (_, { arg }: { arg: CreateMaterialCategoryParams }) => materialCategoryApi.create(arg)
  );

  const { trigger: updateTrigger } = useSWRMutation(
    'materialCategories',
    (_, { arg }: { arg: { id: string; data: Partial<CreateMaterialCategoryParams> } }) =>
      materialCategoryApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'materialCategories',
    (_, { arg }: { arg: string }) => materialCategoryApi.delete(arg)
  );

  // API 返回 _id，需映射为 id 供前端使用
  const normalizeNode = (node: Record<string, unknown>): MaterialCategory => {
    const id = (node.id ?? node._id)?.toString?.() ?? String(node._id ?? node.id);
    return {
      ...node,
      id,
      _id: node._id,
      categoryName: node.categoryName ?? node.categoryCode,
      categoryCode: node.categoryCode as string,
      children: Array.isArray(node.children)
        ? (node.children as Record<string, unknown>[]).map(normalizeNode)
        : undefined,
    } as MaterialCategory;
  };
  const categories = useMemo(
    () => (data?.data || []).map((n: Record<string, unknown>) => normalizeNode(n)),
    [data?.data]
  );

  // 将树形数据转换为扁平列表用于选择父分类
  const flattenCategories = (items: MaterialCategory[], level = 0): Array<{ id: string; name: string; level: number }> => {
    const result: Array<{ id: string; name: string; level: number }> = [];
    items.forEach(item => {
      result.push({ id: item.id, name: item.categoryName || item.name, level });
      if (item.children && item.children.length > 0) {
        result.push(...flattenCategories(item.children, level + 1));
      }
    });
    return result;
  };

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const handleAdd = useCallback((parentId?: string | null) => {
    setEditingId(null);
    setFormValues({
      categoryName: '',
      categoryCode: '',
      description: '',
      typeId: '',
      platformId: '',
      parentId: parentId || null,
      sortOrder: 0,
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: MaterialCategory) => {
    setEditingId(record.id);
    setFormValues({
      categoryName: record.categoryName || (record as { name?: string }).name,
      categoryCode: record.categoryCode || (record as { code?: string }).code,
      description: record.description,
      typeId: record.typeId,
      platformId: record.platformId,
      parentId: record.parentId,
      sortOrder: record.sortOrder ?? 0,
    });
    setVisible(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTrigger(id);
      Toast.success('删除成功');
      mutate();
    } catch {
      Toast.error('删除失败');
    }
  }, [deleteTrigger, mutate]);

  const handleSubmit: () => void | Promise<void> = useCallback(async () => {
    try {
      const data = { ...formValues, parentId: formValues.parentId || null };
      if (editingId) {
        await updateTrigger({ id: editingId, data });
        Toast.success('更新成功');
      } else {
        await createTrigger(data as CreateMaterialCategoryParams);
        Toast.success('创建成功');
      }
      setVisible(false);
      mutate();
    } catch {
      // error
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  // 渲染树节点
  const renderTreeNodes = useCallback((items: MaterialCategory[]): Array<{label: React.ReactNode; key: string; children?: any[]}> => {
    return items.map(item => ({
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{item.categoryName} <small style={{ color: '#999' }}>({item.categoryCode})</small></span>
          <div style={{ display: 'flex', gap: 8 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Button
              icon={<IconPlus />}
              theme="borderless"
              size="small"
              onClick={() => handleAdd(item.id)}
            />
            <Button
              icon={<IconEdit />}
              theme="borderless"
              size="small"
              onClick={() => handleEdit(item)}
            />
            <Popconfirm
              title="确认删除？"
              content="此操作不可恢复"
              onConfirm={() => handleDelete(item.id)}
            >
              <Button icon={<IconDelete />} theme="borderless" type="danger" size="small" />
            </Popconfirm>
          </div>
        </div>
      ),
      key: item.id,
      children: item.children ? renderTreeNodes(item.children) : undefined,
    }));
  }, [handleAdd, handleEdit, handleDelete]);

  const treeData = useMemo(() => renderTreeNodes(categories), [categories, renderTreeNodes]);

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title heading={5}>物料分类</Title>
          <Button icon={<IconPlus />} type="primary" onClick={() => handleAdd(null)}>
            新增根分类
          </Button>
        </div>
        <Tree
          treeData={treeData}
          defaultExpandAll
          style={{ width: '100%' }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        maskClosable={false}
      >
        <Form layout="vertical">
          <Form.Input
            field="categoryName"
            label="名称"
            initValue={formValues.categoryName}
            onChange={(v) => setFormValues(p => ({ ...p, categoryName: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="categoryCode"
            label="编码"
            initValue={formValues.categoryCode}
            onChange={(v) => setFormValues(p => ({ ...p, categoryCode: v }))}
            rules={[{ required: true, message: '请输入编码' }]}
          />
          <Form.Input 
            field="description" 
            label="描述" 
            initValue={formValues.description}
            onChange={(v) => setFormValues(p => ({ ...p, description: v }))}
          />
          <Form.Select
            field="typeId"
            label="物料类别"
            placeholder="请选择类别"
            initValue={formValues.typeId}
            onChange={(v) => setFormValues(p => ({ ...p, typeId: v as string }))}
            rules={[{ required: true, message: '请选择物料类别' }]}
          >
            {types.map((t: { id: string; typeName: string }) => (
              <Option key={t.id} value={t.id}>{t.typeName}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="platformId"
            label="平台"
            placeholder="请选择平台"
            initValue={formValues.platformId}
            onChange={(v) => setFormValues(p => ({ ...p, platformId: v as string }))}
            rules={[{ required: true, message: '请选择平台' }]}
          >
            {platforms.map((p: { id: string; platformName: string }) => (
              <Option key={p.id} value={p.id}>{p.platformName}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="parentId"
            label="父分类"
            placeholder="不选则为根分类"
            initValue={formValues.parentId}
            onChange={(v) => setFormValues(p => ({ ...p, parentId: v === '' ? null : (v as string) }))}
          >
            <Option value="">无（根分类）</Option>
            {flatCategories.filter(c => c.id !== editingId).map(c => (
              <Option key={c.id} value={c.id}>
                {'  '.repeat(c.level)}{c.name}
              </Option>
            ))}
          </Form.Select>
          <Form.InputNumber
            field="sortOrder"
            label="排序"
            initValue={formValues.sortOrder}
            onChange={(v) => setFormValues(p => ({ ...p, sortOrder: Number(v) }))}
          />
        </Form>
      </Modal>
    </>
  );
}
