import { Card, Typography, Button, Table, Modal, Form, Toast, Popconfirm, Switch, Space } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialTypeApi } from '@/services/materialType';
import type { MaterialType, CreateMaterialTypeParams } from '@/types/materialType';

const { Title } = Typography;

export function MaterialTypes() {
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreateMaterialTypeParams>>({
    typeName: '',
    typeCode: '',
    description: '',
    icon: '',
    sortOrder: 0,
  });

  const { data, mutate, isLoading } = useSWR(
    ['materialTypes'],
    () => materialTypeApi.getList(),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger } = useSWRMutation(
    'materialTypes',
    (_, { arg }: { arg: CreateMaterialTypeParams }) => materialTypeApi.create(arg)
  );

  const { trigger: updateTrigger } = useSWRMutation(
    'materialTypes',
    (_, { arg }: { arg: { id: string; data: Partial<CreateMaterialTypeParams> } }) =>
      materialTypeApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'materialTypes',
    (_, { arg }: { arg: string }) => materialTypeApi.delete(arg)
  );

  const materialTypes = data?.data || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({ typeName: '', typeCode: '', description: '', icon: '', sortOrder: 0 });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: MaterialType) => {
    setEditingId(record.id);
    setFormValues({
      typeName: record.typeName,
      typeCode: record.typeCode,
      description: record.description,
      icon: record.icon,
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
      if (editingId) {
        await updateTrigger({ id: editingId, data: formValues });
        Toast.success('更新成功');
      } else {
        await createTrigger(formValues as CreateMaterialTypeParams);
        Toast.success('创建成功');
      }
      setVisible(false);
      mutate();
    } catch {
      // error
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  const columns = [
    { title: '名称', dataIndex: 'typeName' },
    { title: '编码', dataIndex: 'typeCode' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '排序',
      dataIndex: 'sortOrder',
    },
    {
      title: '操作',
      render: (_: unknown, record: MaterialType) => (
        <Space>
          <Button
            icon={<IconEdit />}
            theme="borderless"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除？"
            content="此操作不可恢复"
            onConfirm={() => { if (record.id) handleDelete(record.id); }}
          >
            <Button icon={<IconDelete />} theme="borderless" type="danger" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title heading={5}>物料类别</Title>
          <Button icon={<IconPlus />} type="primary" onClick={handleAdd}>
            新增类别
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={materialTypes}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingId ? '编辑类别' : '新增类别'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        maskClosable={false}
      >
        <Form layout="vertical">
          <Form.Input
            field="typeName"
            label="名称"
            initValue={formValues.typeName}
            onChange={(v) => setFormValues(p => ({ ...p, typeName: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="typeCode"
            label="编码"
            initValue={formValues.typeCode}
            onChange={(v) => setFormValues(p => ({ ...p, typeCode: v }))}
            rules={[{ required: true, message: '请输入编码' }]}
          />
          <Form.Input
            field="description"
            label="描述"
            initValue={formValues.description}
            onChange={(v) => setFormValues(p => ({ ...p, description: v }))}
          />
          <Form.Input
            field="icon"
            label="图标"
            initValue={formValues.icon}
            onChange={(v) => setFormValues(p => ({ ...p, icon: v }))}
          />
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
