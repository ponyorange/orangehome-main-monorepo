import { Card, Typography, Button, Table, Modal, Form, Toast, Popconfirm, Select, Tag, Image, Space, Input } from '@douyinfe/semi-ui';
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag';
import { IconPlus, IconEdit, IconDelete, IconList } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '@/services/material';
import { materialTypeApi } from '@/services/materialType';
import { materialCategoryApi } from '@/services/materialCategory';
import { platformApi } from '@/services/platform';
import { businessApi } from '@/services/business';
import type { Material, CreateMaterialParams } from '@/types/material';

const { Title } = Typography;
const { Option } = Select;

const statusMap: Record<string, { text: string; color: TagColor }> = {
  draft: { text: '草稿', color: 'grey' },
  published: { text: '已发布', color: 'green' },
  archived: { text: '已归档', color: 'red' },
};

export function Materials() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<CreateMaterialParams>>({
    name: '',
    code: '',
    description: '',
    typeId: '',
    categoryId: '',
    platformIds: [],
    businessIds: [],
    thumbnail: '',
    fileUrl: '',
  });
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    typeId: '',
    categoryId: '',
    status: '',
  });

  const { data, mutate, isLoading } = useSWR(
    ['materials', queryParams],
    () => materialApi.getList(queryParams),
    { revalidateOnFocus: false }
  );

  const { data: typeData } = useSWR(
    ['materialTypes-all'],
    () => materialTypeApi.getList(),
    { revalidateOnFocus: false }
  );

  const { data: categoryData } = useSWR(
    ['materialCategories-all'],
    () => materialCategoryApi.getList(),
    { revalidateOnFocus: false }
  );

  const { data: platformData } = useSWR(
    ['platforms-all'],
    () => platformApi.getList({ page: 1, pageSize: 100 }),
    { revalidateOnFocus: false }
  );

  const { data: businessData } = useSWR(
    ['businesses-all'],
    () => businessApi.getList({ page: 1, pageSize: 100 }),
    { revalidateOnFocus: false }
  );

  const { trigger: createTrigger } = useSWRMutation(
    'materials',
    (_, { arg }: { arg: CreateMaterialParams }) => materialApi.create(arg)
  );

  const { trigger: updateTrigger } = useSWRMutation(
    'materials',
    (_, { arg }: { arg: { id: string; data: Partial<CreateMaterialParams> } }) =>
      materialApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'materials',
    (_, { arg }: { arg: string }) => materialApi.delete(arg)
  );

  const materials = data?.data?.items || [];
  const types = typeData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const platforms = platformData?.data?.items || [];
  const businesses = businessData?.data?.items || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({
      name: '',
      code: '',
      description: '',
      typeId: '',
      categoryId: '',
      platformIds: [],
      businessIds: [],
      thumbnail: '',
      fileUrl: '',
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Material) => {
    setEditingId(record.id);
    setFormValues({
      name: record.name,
      code: record.code,
      description: record.description,
      typeId: record.typeId,
      categoryId: record.categoryId,
      platformIds: record.platformIds || [],
      businessIds: record.businessIds || [],
      thumbnail: record.thumbnail,
      fileUrl: record.fileUrl,
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

  const handleViewVersions = useCallback((record: Material) => {
    navigate(`/materials/${record.id}/versions`);
  }, [navigate]);

  const handleSubmit: () => void | Promise<void> = useCallback(async () => {
    try {
      if (editingId) {
        await updateTrigger({ id: editingId, data: formValues });
        Toast.success('更新成功');
      } else {
        await createTrigger(formValues as CreateMaterialParams);
        Toast.success('创建成功');
      }
      setVisible(false);
      mutate();
    } catch {
      // error
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate]);

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      render: (thumbnail?: string) => (
        thumbnail ? (
          <Image src={thumbnail} width={48} height={48} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
        )
      ),
    },
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    {
      title: '类别',
      render: (_: unknown, record: Material) => record.typeName || '-',
    },
    {
      title: '分类',
      render: (_: unknown, record: Material) => record.categoryName || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'grey'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '版本数',
      render: (_: unknown, record: Material) => record.versionCount || 0,
    },
    {
      title: '操作',
      render: (_: unknown, record: Material) => (
        <Space>
          <Button
            icon={<IconEdit />}
            theme="borderless"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<IconList />}
            theme="borderless"
            onClick={() => handleViewVersions(record)}
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
          <Title heading={5}>物料管理</Title>
          <Button icon={<IconPlus />} type="primary" onClick={handleAdd}>
            新增物料
          </Button>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Input
            placeholder="搜索名称/编码"
            value={queryParams.keyword}
            onChange={(v) => setQueryParams(p => ({ ...p, keyword: String(v), page: 1 }))}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择类别"
            value={queryParams.typeId || undefined}
            onChange={(v) => setQueryParams(p => ({ ...p, typeId: String(v) || '', page: 1 }))}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            {types.map(t => (
              <Option key={t.id} value={t.id}>{t.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择分类"
            value={queryParams.categoryId || undefined}
            onChange={(v) => setQueryParams(p => ({ ...p, categoryId: String(v) || '', page: 1 }))}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            {categories.map(c => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            value={queryParams.status || undefined}
            onChange={(v) => setQueryParams(p => ({ ...p, status: String(v) || '', page: 1 }))}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </div>
        <Table
          columns={columns}
          dataSource={materials}
          loading={isLoading}
          pagination={{
            currentPage: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data?.data?.total || 0,
            onPageChange: (page) => setQueryParams(p => ({ ...p, page })),
          }}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingId ? '编辑物料' : '新增物料'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        maskClosable={false}
        width={600}
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
            field="typeId"
            label="物料类别"
            rules={[{ required: true, message: '请选择类别' }]}
            placeholder="请选择类别"
            initValue={formValues.typeId}
            onChange={(v) => setFormValues(p => ({ ...p, typeId: v as string }))}
          >
            {types.map(t => (
              <Option key={t.id} value={t.id}>{t.name}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="categoryId"
            label="物料分类"
            rules={[{ required: true, message: '请选择分类' }]}
            placeholder="请选择分类"
            initValue={formValues.categoryId}
            onChange={(v) => setFormValues(p => ({ ...p, categoryId: v as string }))}
          >
            {categories.map(c => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="platformIds"
            label="适用平台"
            multiple
            placeholder="请选择平台"
            initValue={formValues.platformIds}
            onChange={(v) => setFormValues(p => ({ ...p, platformIds: v as string[] }))}
          >
            {platforms.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="businessIds"
            label="适用业务线"
            multiple
            placeholder="请选择业务线"
            initValue={formValues.businessIds}
            onChange={(v) => setFormValues(p => ({ ...p, businessIds: v as string[] }))}
          >
            {businesses.map(b => (
              <Option key={b.id} value={b.id}>{b.name}</Option>
            ))}
          </Form.Select>
          <Form.Input 
            field="thumbnail" 
            label="缩略图URL" 
            initValue={formValues.thumbnail}
            onChange={(v) => setFormValues(p => ({ ...p, thumbnail: v }))}
          />
          <Form.Input 
            field="fileUrl" 
            label="文件URL" 
            initValue={formValues.fileUrl}
            onChange={(v) => setFormValues(p => ({ ...p, fileUrl: v }))}
          />
        </Form>
      </Modal>
    </>
  );
}
