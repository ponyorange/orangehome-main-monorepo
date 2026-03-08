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

  const materials = data?.data || [];
  const types = typeData?.data || [];
  const categories = categoryData?.data || [];
  const platforms = platformData?.data || [];
  const businesses = businessData?.data || [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({
      materialName: '',
      materialUid: '',
      description: '',
      typeId: '',
      categoryId: '',
      platformId: '',
      businessId: '',
      icon: '',
    });
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Material) => {
    setEditingId(record.id);
    setFormValues({
      materialName: record.materialName || record.name,
      materialUid: record.materialUid || record.code,
      description: record.description,
      typeId: record.typeId,
      categoryId: record.categoryId,
      platformId: record.platformId || (record.platformIds?.[0] ?? ''),
      businessId: record.businessId || (record.businessIds?.[0] ?? ''),
      icon: record.icon || record.thumbnail,
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
      dataIndex: 'icon',
      render: (icon?: string) => (
        icon ? (
          <Image src={icon} width={48} height={48} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
        )
      ),
    },
    { title: '名称', dataIndex: 'materialName' },
    { title: '编码', dataIndex: 'materialUid' },
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
      title: '最新版本',
      render: (_: unknown, record: Material) => record.latestVersionId || '-',
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
            total: data?.total || 0,
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
            field="materialName"
            label="名称"
            initValue={formValues.materialName}
            onChange={(v) => setFormValues(p => ({ ...p, materialName: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="materialUid"
            label="编码（可选）"
            initValue={formValues.materialUid}
            onChange={(v) => setFormValues(p => ({ ...p, materialUid: v }))}
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
            field="platformId"
            label="适用平台"
            rules={[{ required: true, message: '请选择平台' }]}
            placeholder="请选择平台"
            initValue={formValues.platformId}
            onChange={(v) => setFormValues(p => ({ ...p, platformId: v as string }))}
          >
            {platforms.map((p: { id: string; platformName: string }) => (
              <Option key={p.id} value={p.id}>{p.platformName}</Option>
            ))}
          </Form.Select>
          <Form.Select
            field="businessId"
            label="适用业务线"
            placeholder="请选择业务线（可选）"
            initValue={formValues.businessId}
            onChange={(v) => setFormValues(p => ({ ...p, businessId: v as string }))}
          >
            <Option value="">无</Option>
            {businesses.map((b: { id: string; businessName: string }) => (
              <Option key={b.id} value={b.id}>{b.businessName}</Option>
            ))}
          </Form.Select>
          <Form.Input
            field="icon"
            label="图标URL"
            initValue={formValues.icon}
            onChange={(v) => setFormValues(p => ({ ...p, icon: v }))}
          />
        </Form>
      </Modal>
    </>
  );
}
