import {
  Card,
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Toast,
  Popconfirm,
  Select,
  Tag,
  Image,
  Space,
  Input,
  Upload,
} from '@douyinfe/semi-ui';
import type { customRequestArgs, FileItem } from '@douyinfe/semi-ui/lib/es/upload';
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag';
import { IconPlus, IconEdit, IconDelete, IconList, IconUpload } from '@douyinfe/semi-icons';
import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '@/services/material';
import { materialTypeApi } from '@/services/materialType';
import { materialCategoryApi } from '@/services/materialCategory';
import { platformApi } from '@/services/platform';
import { businessApi } from '@/services/business';
import type { Material, CreateMaterialParams, UpdateMaterialParams } from '@/types/material';
import type { MaterialCategoryTree } from '@/types/materialCategory';
import { uploadAdminFile } from '@/services/upload';

const { Title, Text } = Typography;
const { Option } = Select;

const statusMap: Record<string, { text: string; color: TagColor }> = {
  draft: { text: '草稿', color: 'grey' },
  published: { text: '已发布', color: 'green' },
  archived: { text: '已归档', color: 'red' },
};

const visibilityMap: Record<string, { text: string; color: TagColor }> = {
  private: { text: '私有', color: 'grey' },
  public: { text: '公开', color: 'green' },
};

/** 弹窗表单状态（含 DTO 字段 + 仅展示用） */
interface MaterialFormValues {
  materialName: string;
  materialUid: string;
  description: string;
  icon: string;
  platformId: string;
  typeId: string;
  categoryId: string;
  businessId: string;
  status: string;
  visibility: string;
  sortOrder: number;
  /** 原始 JSON 文本，对应 Create/Update 的 config 字符串 */
  config: string;
}

const emptyForm = (): MaterialFormValues => ({
  materialName: '',
  materialUid: '',
  description: '',
  icon: '',
  platformId: '',
  typeId: '',
  categoryId: '',
  businessId: '',
  status: 'draft',
  visibility: 'private',
  sortOrder: 0,
  config: '',
});

function flattenCategoryTree(
  nodes: MaterialCategoryTree[] | undefined,
  depth = 0
): Array<{ id: string; label: string }> {
  if (!nodes?.length) return [];
  const out: Array<{ id: string; label: string }> = [];
  for (const n of nodes) {
    const id = String((n as { id?: string }).id ?? (n as { _id?: string })._id ?? '');
    if (!id) continue;
    const name = n.categoryName || n.name || id;
    const pad = '\u3000'.repeat(depth);
    out.push({ id, label: `${pad}${name}` });
    if (n.children?.length) {
      out.push(...flattenCategoryTree(n.children, depth + 1));
    }
  }
  return out;
}

function parseConfigJson(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  try {
    JSON.parse(t);
    return t;
  } catch {
    throw new Error('扩展配置须为合法 JSON');
  }
}

function buildCreatePayload(v: MaterialFormValues): CreateMaterialParams {
  const sort = Math.round(Number(v.sortOrder));
  const payload: CreateMaterialParams = {
    materialName: v.materialName.trim(),
    platformId: v.platformId,
    typeId: v.typeId,
    categoryId: v.categoryId,
    status: v.status || 'draft',
    visibility: v.visibility || 'private',
    sortOrder: Number.isFinite(sort) ? Math.max(0, sort) : 0,
  };
  const uid = v.materialUid.trim();
  if (uid) payload.materialUid = uid;
  const desc = v.description.trim();
  if (desc) payload.description = desc;
  const ic = v.icon.trim();
  if (ic) payload.icon = ic;
  if (v.businessId) payload.businessId = v.businessId;
  const cfg = parseConfigJson(v.config);
  if (cfg !== undefined) payload.config = cfg;
  return payload;
}

function buildUpdatePayload(v: MaterialFormValues): UpdateMaterialParams {
  const sort = Math.round(Number(v.sortOrder));
  const payload: UpdateMaterialParams = {
    materialName: v.materialName.trim(),
    platformId: v.platformId,
    typeId: v.typeId,
    categoryId: v.categoryId,
    businessId: v.businessId?.trim() ? v.businessId.trim() : '',
    description: v.description.trim() || undefined,
    icon: v.icon.trim() || undefined,
    status: v.status || undefined,
    visibility: v.visibility || undefined,
    sortOrder: Number.isFinite(sort) ? Math.max(0, sort) : undefined,
  };
  const uid = v.materialUid.trim();
  if (uid) payload.materialUid = uid;
  const cfg = parseConfigJson(v.config);
  if (cfg !== undefined) payload.config = cfg;
  return payload;
}

export function Materials() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [iconUploadKey, setIconUploadKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<MaterialFormValues>(emptyForm);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    typeId: '',
    categoryId: '',
    status: '',
    visibility: '',
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

  const { data: categoryFormTree } = useSWR(
    visible && formValues.platformId && formValues.typeId
      ? ['materialCategories-tree-form', formValues.platformId, formValues.typeId]
      : null,
    () =>
      materialCategoryApi.getTreeList({
        platformId: formValues.platformId,
        typeId: formValues.typeId,
      }),
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
    (_, { arg }: { arg: { id: string; data: UpdateMaterialParams } }) => materialApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'materials',
    (_, { arg }: { arg: string }) => materialApi.delete(arg)
  );

  const materials = data?.data || [];
  const types = typeData?.data || [];
  const filterCategories = categoryData?.data || [];
  const platforms = platformData?.data || [];
  const businesses = businessData?.data || [];

  const formCategoryOptions = useMemo(
    () => flattenCategoryTree(categoryFormTree?.data),
    [categoryFormTree?.data]
  );

  const closeModal = useCallback(() => {
    setVisible(false);
    setEditingId(null);
    setFormValues(emptyForm());
    setIconUploadKey((k) => k + 1);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setIconUploadKey((k) => k + 1);
    setFormValues(emptyForm());
    setVisible(true);
  }, []);

  const handleEdit = useCallback((record: Material) => {
    const id = record.id ?? (record as { _id?: string })._id;
    setEditingId(String(id));
    setIconUploadKey((k) => k + 1);
    setFormValues({
      materialName: record.materialName || record.name || '',
      materialUid: record.materialUid || record.code || '',
      description: record.description || '',
      typeId: record.typeId || '',
      categoryId: record.categoryId || '',
      platformId: record.platformId || record.platformIds?.[0] || '',
      businessId: record.businessId || record.businessIds?.[0] || '',
      icon: record.icon || record.thumbnail || '',
      status: record.status || 'draft',
      visibility: record.visibility || 'private',
      sortOrder: record.sortOrder ?? 0,
      config: record.config?.trim() ? record.config : '',
    });
    setVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTrigger(id);
        Toast.success('删除成功');
        mutate();
      } catch {
        Toast.error('删除失败');
      }
    },
    [deleteTrigger, mutate]
  );

  const handleViewVersions = useCallback(
    (record: Material) => {
      const id = record.id ?? (record as { _id?: string })._id;
      navigate(`/materials/${id}/versions`);
    },
    [navigate]
  );

  const handleSubmit: () => void | Promise<void> = useCallback(async () => {
    try {
      if (!formValues.materialName?.trim()) {
        Toast.error('请输入物料名称');
        return;
      }
      let createBody: CreateMaterialParams | undefined;
      let updateBody: UpdateMaterialParams | undefined;
      try {
        if (!formValues.platformId || !formValues.typeId || !formValues.categoryId) {
          Toast.error('请选择平台、物料类别与物料分类');
          return;
        }
        if (editingId) {
          updateBody = buildUpdatePayload(formValues);
        } else {
          createBody = buildCreatePayload(formValues);
        }
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '参数错误');
        return;
      }
      if (editingId && updateBody) {
        await updateTrigger({ id: editingId, data: updateBody });
        Toast.success('更新成功');
      } else if (createBody) {
        await createTrigger(createBody);
        Toast.success('创建成功');
      }
      closeModal();
      mutate();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '保存失败');
    }
  }, [editingId, formValues, createTrigger, updateTrigger, mutate, closeModal]);

  const handleIconUpload = useCallback(async ({ fileInstance, onSuccess, onError }: customRequestArgs) => {
    try {
      const r = await uploadAdminFile(fileInstance);
      let url = r.url;
      let fileKey = r.objectKey;
      if (fileKey?.trim()) {
        url = `http://8.148.251.221:6011/orangehome/${fileKey}`;
      }
      setFormValues((p) => ({ ...p, icon: url }));
      onSuccess({ url: url });
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '上传失败');
      onError({ status: 500 });
    }
  }, []);

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'icon',
      render: (icon?: string) =>
        icon ? (
          <Image src={icon} width={48} height={48} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
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
        <Tag color={statusMap[status]?.color || 'grey'}>{statusMap[status]?.text || status}</Tag>
      ),
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      render: (v: string) => (
        <Tag color={visibilityMap[v]?.color || 'grey'}>{visibilityMap[v]?.text || v}</Tag>
      ),
    },
    {
      title: '最新版本',
      render: (_: unknown, record: Material) => record.latestVersionId || '-',
    },
    {
      title: '操作',
      render: (_: unknown, record: Material) => {
        const id = record.id ?? (record as { _id?: string })._id;
        return (
          <Space>
            <Button icon={<IconEdit />} theme="borderless" onClick={() => handleEdit(record)} />
            <Button icon={<IconList />} theme="borderless" onClick={() => handleViewVersions(record)} />
            <Popconfirm
              title="确认删除？"
              content="此操作不可恢复"
              onConfirm={() => {
                if (id) handleDelete(String(id));
              }}
            >
              <Button icon={<IconDelete />} theme="borderless" type="danger" />
            </Popconfirm>
          </Space>
        );
      },
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
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索名称/编码"
            value={queryParams.keyword}
            onChange={(v) => setQueryParams((p) => ({ ...p, keyword: String(v), page: 1 }))}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择类别"
            value={queryParams.typeId || undefined}
            onChange={(v) => setQueryParams((p) => ({ ...p, typeId: String(v) || '', page: 1 }))}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            {types.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.typeName}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择分类"
            value={queryParams.categoryId || undefined}
            onChange={(v) => setQueryParams((p) => ({ ...p, categoryId: String(v) || '', page: 1 }))}
            style={{ width: 180 }}
          >
            <Option value="">全部</Option>
            {filterCategories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.categoryName || c.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            value={queryParams.status || undefined}
            onChange={(v) => setQueryParams((p) => ({ ...p, status: String(v) || '', page: 1 }))}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Select>
          <Select
            placeholder="可见性"
            value={queryParams.visibility || undefined}
            onChange={(v) => setQueryParams((p) => ({ ...p, visibility: String(v) || '', page: 1 }))}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            <Option value="private">私有</Option>
            <Option value="public">公开</Option>
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
            onPageChange: (page) => setQueryParams((p) => ({ ...p, page })),
          }}
          rowKey={(r) => (r ? String(r.id ?? (r as { _id?: string })._id) : '')}
        />
      </Card>

      <Modal
        title={editingId ? '编辑物料' : '新增物料'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={closeModal}
        maskClosable={false}
        width={640}
      >
        <Form layout="vertical">
          <Form.Input
            field="materialName"
            label="物料名称"
            initValue={formValues.materialName}
            onChange={(v) => setFormValues((p) => ({ ...p, materialName: v }))}
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <Form.Input
            field="materialUid"
            label="物料编码（可选；新建不填则服务端自动生成；编辑修改后将校验唯一性）"
            initValue={formValues.materialUid}
            onChange={(v) => setFormValues((p) => ({ ...p, materialUid: v }))}
          />
          <Form.Input
            field="description"
            label="描述"
            initValue={formValues.description}
            onChange={(v) => setFormValues((p) => ({ ...p, description: v }))}
          />
          <Form.Select
            field="platformId"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
            placeholder="请选择平台"
            initValue={formValues.platformId}
            onChange={(v) =>
              setFormValues((p) => ({
                ...p,
                platformId: v as string,
                categoryId: '',
              }))
            }
          >
            {platforms.map((p: { id: string; platformName: string }) => (
              <Option key={p.id} value={p.id}>
                {p.platformName}
              </Option>
            ))}
          </Form.Select>
          <Form.Select
            field="typeId"
            label="物料类别"
            rules={[{ required: true, message: '请选择类别' }]}
            placeholder="请选择类别"
            initValue={formValues.typeId}
            onChange={(v) =>
              setFormValues((p) => ({
                ...p,
                typeId: v as string,
                categoryId: '',
              }))
            }
          >
            {types.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.typeName}
              </Option>
            ))}
          </Form.Select>
          <Form.Select
            field="categoryId"
            label="物料分类"
            rules={[{ required: true, message: '请选择分类' }]}
            placeholder={
              !formValues.platformId || !formValues.typeId
                ? '请先选择平台与类别'
                : formCategoryOptions.length
                  ? '请选择分类'
                  : '当前筛选下无分类数据'
            }
            initValue={formValues.categoryId}
            onChange={(v) => setFormValues((p) => ({ ...p, categoryId: v as string }))}
            disabled={!formValues.platformId || !formValues.typeId}
          >
            {formCategoryOptions.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.label}
              </Option>
            ))}
          </Form.Select>
          <Form.Select
            field="businessId"
            label="业务线（可选）"
            placeholder="无"
            initValue={formValues.businessId}
            onChange={(v) => setFormValues((p) => ({ ...p, businessId: (v as string) || '' }))}
          >
            <Option value="">无</Option>
            {businesses.map((b: { id: string; businessName: string }) => (
              <Option key={b.id} value={b.id}>
                {b.businessName}
              </Option>
            ))}
          </Form.Select>
          <Form.Select
            field="status"
            label="状态"
            initValue={formValues.status}
            onChange={(v) => setFormValues((p) => ({ ...p, status: v as string }))}
          >
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Form.Select>
          <Form.Select
            field="visibility"
            label="可见性"
            initValue={formValues.visibility}
            onChange={(v) => setFormValues((p) => ({ ...p, visibility: v as string }))}
          >
            <Option value="private">私有</Option>
            <Option value="public">公开</Option>
          </Form.Select>
          <Form.InputNumber
            field="sortOrder"
            label="排序"
            initValue={formValues.sortOrder}
            onChange={(v) => setFormValues((p) => ({ ...p, sortOrder: Number(v) }))}
          />
          <Form.TextArea
            field="config"
            label="扩展配置（JSON 字符串，可选）"
            rows={4}
            placeholder='例如 {"key":"value"}'
            initValue={formValues.config}
            onChange={(v) => setFormValues((p) => ({ ...p, config: v }))}
          />
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              图标
            </Text>
            <Upload
              key={`material-icon-${editingId ?? 'new'}-${iconUploadKey}`}
              listType="picture"
              accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.ico,image/*"
              limit={1}
              maxSize={20480}
              defaultFileList={
                (formValues.icon
                  ? [
                    {
                      uid: 'existing-icon',
                      name: 'icon.png',
                      status: 'success' as const,
                      url: formValues.icon,
                    },
                  ]
                  : []) as FileItem[]
              }
              customRequest={handleIconUpload}
              onRemove={() => {
                setFormValues((p) => ({ ...p, icon: '' }));
                return true;
              }}
            >
              <IconUpload size="extra-large" />
              <Text type="tertiary" size="small">
                上传图片后自动填入图标地址（最大 20MB）
              </Text>
            </Upload>
            {formValues.icon ? (
              <Input
                style={{ marginTop: 8 }}
                value={formValues.icon}
                readOnly
                placeholder="上传后显示 URL"
              />
            ) : null}
          </div>
        </Form>
      </Modal>
    </>
  );
}
