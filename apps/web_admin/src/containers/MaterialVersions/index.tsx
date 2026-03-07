import { Card, Typography, Button, Table, Modal, Form, Toast, Popconfirm, Tag, Space } from '@douyinfe/semi-ui';
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag';
import { IconPlus, IconDelete, IconPlayCircle } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialApi } from '@/services/material';
import { materialVersionApi } from '@/services/materialVersion';
import type { CreateMaterialVersionParams } from '@/types/materialVersion';

const { Title } = Typography;

const statusMap: Record<string, { text: string; color: TagColor }> = {
  draft: { text: '草稿', color: 'grey' },
  published: { text: '已发布', color: 'green' },
  deprecated: { text: '已废弃', color: 'red' },
};

export function MaterialVersions() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [formValues, setFormValues] = useState<Partial<CreateMaterialVersionParams>>({
    version: '',
    description: '',
    fileUrl: '',
    thumbnail: '',
  });

  const { data: materialData } = useSWR(
    materialId ? ['material', materialId] : null,
    () => materialApi.getById(materialId!),
    { revalidateOnFocus: false }
  );

  const { data, mutate, isLoading } = useSWR(
    materialId ? ['material-versions', materialId] : null,
    () => materialApi.getVersions(materialId!),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: CreateMaterialVersionParams }) => materialVersionApi.create(arg)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.delete(arg)
  );

  const { trigger: publishTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.publish(arg)
  );

  const versions = data?.data?.items || [];
  const material = materialData?.data;

  const handleAdd = useCallback(() => {
    setFormValues({
      version: '',
      description: '',
      fileUrl: '',
      thumbnail: '',
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

  const handlePublish = useCallback(async (id: string) => {
    try {
      await publishTrigger(id);
      Toast.success('发布成功');
      mutate();
    } catch {
      Toast.error('发布失败');
    }
  }, [publishTrigger, mutate]);

  const handleSubmit = useCallback(async () => {
    try {
      if (materialId) {
        await createTrigger({
          ...formValues,
          materialId,
        } as CreateMaterialVersionParams);
        Toast.success('创建成功');
        setVisible(false);
        mutate();
      }
    } catch {
      // error
    }
  }, [materialId, formValues, createTrigger, mutate]);

  const columns = [
    { title: '版本号', dataIndex: 'version' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'grey'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    { title: '发布时间', dataIndex: 'publishedAt' },
    { title: '发布人', dataIndex: 'publishedBy' },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      render: (_: unknown, record: { id: string; status: string }) => (
        <Space>
          {record.status === 'draft' && (
            <Button
              icon={<IconPlayCircle />}
              theme="borderless"
              onClick={() => handlePublish(record.id)}
            />
          )}
          <Popconfirm
            title="确认删除？"
            content="此操作不可恢复"
            onConfirm={() => handleDelete(record.id)}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button onClick={() => navigate('/materials')}>返回</Button>
            <Title heading={5} style={{ margin: 0 }}>
              物料版本 - {material?.name || materialId}
            </Title>
          </div>
          <Button icon={<IconPlus />} type="primary" onClick={handleAdd}>
            新增版本
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={versions}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
      </Card>

      <Modal
        title="新增版本"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        maskClosable={false}
      >
        <Form layout="vertical">
          <Form.Input
            field="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
            placeholder="例如: 1.0.0"
            initValue={formValues.version}
            onChange={(v) => setFormValues(p => ({ ...p, version: v }))}
          />
          <Form.TextArea
            field="description"
            label="版本描述"
            rows={3}
            initValue={formValues.description}
            onChange={(v) => setFormValues(p => ({ ...p, description: v }))}
          />
          <Form.Input
            field="fileUrl"
            label="文件URL"
            rules={[{ required: true, message: '请输入文件URL' }]}
            initValue={formValues.fileUrl}
            onChange={(v) => setFormValues(p => ({ ...p, fileUrl: v }))}
          />
          <Form.Input 
            field="thumbnail" 
            label="缩略图URL" 
            initValue={formValues.thumbnail}
            onChange={(v) => setFormValues(p => ({ ...p, thumbnail: v }))}
          />
        </Form>
      </Modal>
    </>
  );
}
