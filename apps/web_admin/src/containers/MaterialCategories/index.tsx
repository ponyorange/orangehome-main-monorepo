import { Card, Typography, Button, Tree, Modal, Form, Toast, Popconfirm, Select } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialCategoryApi } from '@/services/materialCategory';
import type { MaterialCategory, CreateMaterialCategoryParams } from '@/types/materialCategory';

const { Title } = Typography;
const { Option } = Select;

export function MaterialCategories() {
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreateMaterialCategoryParams>>({
    name: '',
    code: '',
    description: '',
    parentId: null,
    sortOrder: 0,
    isActive: true,
  });

  const { data, mutate } = useSWR(
    ['materialCategories-tree'],
    () => materialCategoryApi.getTreeList(),
    { revalidateOnFocus: false }
  );

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

  const categories = data?.data || [];

  // 将树形数据转换为扁平列表用于选择父分类
  const flattenCategories = (items: MaterialCategory[], level = 0): Array<{ id: string; name: string; level: number }> => {
    const result: Array<{ id: string; name: string; level: number }> = [];
    items.forEach(item => {
      result.push({ id: item.id, name: item.name, level });
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
      name: '',
      code: '',
      description: '',
      parentId: parentId || null,
      sortOrder: 0,
      isActive: true,
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: MaterialCategory) => {
    setEditingId(record.id);
    setFormValues({
      name: record.name,
      code: record.code,
      description: record.description,
      parentId: record.parentId,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
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
          <span>{item.name} <small style={{ color: '#999' }}>({item.code})</small></span>
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
            field="name"
            label="名称"
            initValue={formValues.name}
            onChange={(v) => setFormValues(p => ({ ...p, name: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="code"
            label="编码"
            initValue={formValues.code}
            onChange={(v) => setFormValues(p => ({ ...p, code: v }))}
            rules={[{ required: true, message: '请输入编码' }]}
          />
          <Form.Input 
            field="description" 
            label="描述" 
            initValue={formValues.description}
            onChange={(v) => setFormValues(p => ({ ...p, description: v }))}
          />
          <Form.Select
            field="parentId"
            label="父分类"
            placeholder="不选则为根分类"
            initValue={formValues.parentId}
            onChange={(v) => setFormValues(p => ({ ...p, parentId: v as string | null }))}
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
          <Form.Switch 
            field="isActive" 
            label="启用" 
            initValue={formValues.isActive}
            onChange={(v) => setFormValues(p => ({ ...p, isActive: Boolean(v) }))}
          />
        </Form>
      </Modal>
    </>
  );
}
