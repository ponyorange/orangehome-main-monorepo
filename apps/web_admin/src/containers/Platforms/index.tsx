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
  const [formValues, setFormValues] = useState<Record<string, unknown>>({
    platformName: '',
    platformCode: '',
    description: '',
    iconUrl: '',
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

  const platforms = data?.data || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({ platformName: '', platformCode: '', description: '', iconUrl: '' });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Record<string, unknown>) => {
    setEditingId(record.id as string);
    setFormValues({
      platformName: record.platformName || '',
      platformCode: record.platformCode || '',
      description: record.description || '',
      iconUrl: record.iconUrl || '',
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
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '操作失败');
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  const columns = [
    { title: '名称', dataIndex: 'platformName' },
    { title: '编码', dataIndex: 'platformCode' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '状态',
      dataIndex: 'isDeleted',
      render: (isDeleted: boolean) => (
        <Switch checked={!isDeleted} disabled size="small" />
      ),
    },
    {
      title: '操作',
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space>
          <Button
            icon={<IconEdit />}
            theme="borderless"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除？"
            content="此操作不可恢复"
            onConfirm={() => { if (record.id) handleDelete(record.id as string); }}
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
            field="platformName"
            label="名称"
            initValue={formValues.platformName}
            onChange={(v) => setFormValues(p => ({ ...p, platformName: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="platformCode"
            label="编码"
            initValue={formValues.platformCode}
            onChange={(v) => setFormValues(p => ({ ...p, platformCode: v }))}
            rules={[{ required: true, message: '请输入编码' }]}
          />
          <Form.Input
            field="description"
            label="描述"
            initValue={formValues.description}
            onChange={(v) => setFormValues(p => ({ ...p, description: v }))}
          />
          <Form.Input
            field="iconUrl"
            label="图标"
            initValue={formValues.iconUrl}
            onChange={(v) => setFormValues(p => ({ ...p, iconUrl: v }))}
          />
        </Form>
      </Modal>
    </>
  );
}
