import { Card, Typography, Button, Table, Modal, Form, Toast, Popconfirm, Switch, Space } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { platformApi } from '@/services/platform';
import type { Platform, CreatePlatformParams } from '@/types/platform';

const { Title } = Typography;

export function Platforms() {
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreatePlatformParams>>({
    name: '',
    code: '',
    description: '',
    icon: '',
    sortOrder: 0,
    isActive: true,
  });

  const { data, mutate, isLoading } = useSWR(
    ['platforms'],
    () => platformApi.getList({ page: 1, pageSize: 100 }),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger } = useSWRMutation(
    'platforms',
    (_, { arg }: { arg: CreatePlatformParams }) => platformApi.create(arg)
  );

  const { trigger: updateTrigger } = useSWRMutation(
    'platforms',
    (_, { arg }: { arg: { id: string; data: Partial<CreatePlatformParams> } }) =>
      platformApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'platforms',
    (_, { arg }: { arg: string }) => platformApi.delete(arg)
  );

  const platforms = data?.data?.items || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({
      name: '',
      code: '',
      description: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Platform) => {
    setEditingId(record.id);
    setFormValues({
      name: record.name,
      code: record.code,
      description: record.description,
      icon: record.icon,
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
      if (editingId) {
        await updateTrigger({ id: editingId, data: formValues });
        Toast.success('更新成功');
      } else {
        await createTrigger(formValues as CreatePlatformParams);
        Toast.success('创建成功');
      }
      setVisible(false);
      mutate();
    } catch {
      // error
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '状态',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled size="small" />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
    },
    {
      title: '操作',
      render: (_: unknown, record: Platform) => (
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
          <Title heading={5}>平台管理</Title>
          <Button icon={<IconPlus />} type="primary" onClick={handleAdd}>
            新增平台
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={platforms}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingId ? '编辑平台' : '新增平台'}
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
