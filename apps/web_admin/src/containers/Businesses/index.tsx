import { Card, Typography, Button, Table, Modal, Form, Toast, Popconfirm, Switch, Select, Space } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete, IconLink } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { businessApi } from '@/services/business';
import { platformApi } from '@/services/platform';
import type { Business, CreateBusinessParams } from '@/types/business';

const { Title } = Typography;
const { Option } = Select;

export function Businesses() {
  const [visible, setVisible] = useState(false);
  const [linkVisible, setLinkVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreateBusinessParams>>({
    name: '',
    code: '',
    description: '',
    icon: '',
    platformIds: [],
    sortOrder: 0,
    isActive: true,
  });
  const [linkPlatformId, setLinkPlatformId] = useState<string>('');

  const { data, mutate, isLoading } = useSWR(
    ['businesses'],
    () => businessApi.getList({ page: 1, pageSize: 100 }),
    { revalidateOnFocus: false }
  );

  const { data: platformData } = useSWR(
    ['platforms-all'],
    () => platformApi.getList({ page: 1, pageSize: 100 }),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger } = useSWRMutation(
    'businesses',
    (_, { arg }: { arg: CreateBusinessParams }) => businessApi.create(arg)
  );

  const { trigger: updateTrigger } = useSWRMutation(
    'businesses',
    (_, { arg }: { arg: { id: string; data: Partial<CreateBusinessParams> } }) =>
      businessApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'businesses',
    (_, { arg }: { arg: string }) => businessApi.delete(arg)
  );

  const { trigger: linkPlatformTrigger } = useSWRMutation(
    'businesses',
    (_, { arg }: { arg: { id: string; platformId: string } }) =>
      businessApi.linkPlatform(arg.id, arg.platformId)
  );

  const businesses = data?.data?.items || [];
  const platforms = platformData?.data?.items || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({
      name: '',
      code: '',
      description: '',
      icon: '',
      platformIds: [],
      sortOrder: 0,
      isActive: true,
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Business) => {
    setEditingId(record.id);
    setFormValues({
      name: record.name,
      code: record.code,
      description: record.description,
      icon: record.icon,
      platformIds: record.platforms?.map(p => p.id) || [],
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
    setVisible(true);
  }, []);

  const handleLink = useCallback((record: Business) => {
    setLinkingId(record.id);
    setLinkPlatformId('');
    setLinkVisible(true);
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
        await createTrigger(formValues as CreateBusinessParams);
        Toast.success('创建成功');
      }
      setVisible(false);
      mutate();
    } catch {
      // error
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  const handleLinkSubmit = useCallback(async () => {
    try {
      if (linkingId && linkPlatformId) {
        await linkPlatformTrigger({ id: linkingId, platformId: linkPlatformId });
        Toast.success('关联成功');
        setLinkVisible(false);
        mutate();
      }
    } catch {
      // error
    }
  }, [linkingId, linkPlatformId, linkPlatformTrigger, mutate]);

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '关联平台',
      render: (_: unknown, record: Business) => (
        <span>{record.platforms?.map(p => p.name).join(', ') || '-'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled size="small" />
      ),
    },
    {
      title: '操作',
      render: (_: unknown, record: Business) => (
        <Space>
          <Button
            icon={<IconEdit />}
            theme="borderless"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<IconLink />}
            theme="borderless"
            onClick={() => handleLink(record)}
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
          <Title heading={5}>业务线管理</Title>
          <Button icon={<IconPlus />} type="primary" onClick={handleAdd}>
            新增业务线
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={businesses}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingId ? '编辑业务线' : '新增业务线'}
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
          <Form.Select
            field="platformIds"
            label="关联平台"
            multiple
            placeholder="请选择平台"
            initValue={formValues.platformIds}
            onChange={(v) => setFormValues(p => ({ ...p, platformIds: v as string[] }))}
          >
            {platforms.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
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

      <Modal
        title="关联平台"
        visible={linkVisible}
        onOk={handleLinkSubmit}
        onCancel={() => setLinkVisible(false)}
        maskClosable={false}
      >
        <Form layout="vertical">
          <Form.Select
            field="platformId"
            label="选择平台"
            rules={[{ required: true, message: '请选择平台' }]}
            placeholder="请选择要关联的平台"
            initValue={linkPlatformId}
            onChange={(v) => setLinkPlatformId(v as string)}
          >
            {platforms.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Form.Select>
        </Form>
      </Modal>
    </>
  );
}
