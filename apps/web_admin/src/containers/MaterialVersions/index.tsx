import {
  Card,
  Typography,
  Button,
  Table,
  Modal,
  Toast,
  Popconfirm,
  Tag,
  Space,
  Upload,
  Input,
  TextArea,
} from '@douyinfe/semi-ui';
import type { customRequestArgs } from '@douyinfe/semi-ui/lib/es/upload';
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag';
import { IconPlus, IconDelete, IconPlayCircle, IconUpload, IconEdit, IconStop } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialApi } from '@/services/material';
import { materialVersionApi } from '@/services/materialVersion';
import type {
  CreateMaterialVersionParams,
  MaterialVersion,
  UpdateMaterialVersionParams,
} from '@/types/materialVersion';
import type { Material } from '@/types/material';

const { Title, Text } = Typography;

/** 与 GET list 的 status 查询参数一致：0 开发中 1 测试中 2 已发布 */
const versionStatusMap: Record<number, { text: string; color: TagColor }> = {
  0: { text: '开发中', color: 'grey' },
  1: { text: '测试中', color: 'blue' },
  2: { text: '已发布', color: 'green' },
  3: { text: '已下线', color: 'red' },
};

function rowId(record: MaterialVersion): string {
  return String(record.id ?? record._id ?? '');
}

function parseEditorConfigJson(raw: string): Record<string, unknown> | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const parsed = JSON.parse(t) as unknown;
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('editorConfig 须为 JSON 对象，例如 {"uid":"..."}');
  }
  return parsed as Record<string, unknown>;
}

function editorConfigToJson(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') {
    try {
      const o = JSON.parse(v) as unknown;
      return JSON.stringify(o, null, 2);
    } catch {
      return v;
    }
  }
  if (typeof v === 'object') {
    return JSON.stringify(v, null, 2);
  }
  return '';
}

export function MaterialVersions() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [fileObjectKey, setFileObjectKey] = useState('');
  /** 进入编辑时的 objectKey，用于取消替换文件 */
  const [baselineFileObjectKey, setBaselineFileObjectKey] = useState('');
  const [fileReplaced, setFileReplaced] = useState(false);
  const [ssrFileObjectKey, setSsrFileObjectKey] = useState('');
  const [baselineSsrFileObjectKey, setBaselineSsrFileObjectKey] = useState('');
  const [ssrFileReplaced, setSsrFileReplaced] = useState(false);
  const [formValues, setFormValues] = useState<{
    version: string;
    changelog: string;
    editorConfigJson: string;
  }>({
    version: '',
    changelog: '',
    editorConfigJson: '',
  });

  const { data: materialData } = useSWR<Material>(
    materialId ? ['material', materialId] : null,
    () => materialApi.getById(materialId!) as unknown as Promise<Material>,
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

  const { trigger: updateTrigger } = useSWRMutation(
    'versions-update',
    (_, { arg }: { arg: { id: string; data: UpdateMaterialVersionParams } }) =>
      materialVersionApi.update(arg.id, arg.data)
  );

  const { trigger: deleteTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.delete(arg)
  );

  const { trigger: publishTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.publish(arg)
  );

  const { trigger: offlineTrigger } = useSWRMutation(
    'versions-offline',
    (_, { arg }: { arg: string }) => materialVersionApi.offline(arg)
  );

  const versions = data?.data ?? [];
  const materialTitle = materialData?.materialName || materialData?.name || materialId;
  const isEditing = !!editingVersionId;

  const resetForm = useCallback(() => {
    setEditingVersionId(null);
    setFormValues({ version: '', changelog: '', editorConfigJson: '' });
    setFileObjectKey('');
    setBaselineFileObjectKey('');
    setFileReplaced(false);
    setSsrFileObjectKey('');
    setBaselineSsrFileObjectKey('');
    setSsrFileReplaced(false);
    setUploadResetKey((k) => k + 1);
  }, []);

  const handleAdd = useCallback(() => {
    resetForm();
    setVisible(true);
  }, [resetForm]);

  const handleEdit = useCallback((record: MaterialVersion) => {
    if (record.status !== 0) return;
    const id = rowId(record);
    setEditingVersionId(id);
    setBaselineFileObjectKey(record.fileObjectKey || '');
    setFileReplaced(false);
    setFileObjectKey(record.fileObjectKey || '');
    setBaselineSsrFileObjectKey(record.ssrFileObjectKey || '');
    setSsrFileReplaced(false);
    setSsrFileObjectKey(record.ssrFileObjectKey || '');
    setFormValues({
      version: record.version || '',
      changelog: record.changelog || '',
      editorConfigJson: editorConfigToJson((record as { editorConfig?: unknown }).editorConfig),
    });
    setUploadResetKey((k) => k + 1);
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

  const handlePublish = useCallback(
    async (id: string) => {
      try {
        await publishTrigger(id);
        Toast.success('发布成功');
        mutate();
      } catch {
        Toast.error('发布失败');
      }
    },
    [publishTrigger, mutate]
  );

  const handleOffline = useCallback(
    async (id: string) => {
      try {
        await offlineTrigger(id);
        Toast.success('已下线');
        mutate();
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '下线失败');
      }
    },
    [offlineTrigger, mutate]
  );

  const handleJsUpload = useCallback(
    async ({ fileInstance, onSuccess, onError }: customRequestArgs) => {
      try {
        if (!materialId || !formValues.version?.trim()) {
          Toast.error('请先填写版本号再上传 JS');
          onError({ status: 400 });
          return;
        }
        const presigned = await materialApi.getPresignedUploadUrl({
          materialId,
          version: formValues.version.trim(),
          filename: fileInstance.name || 'index.js',
          bundle: 'browser',
        });
        const res = await fetch(presigned.url, {
          method: 'PUT',
          body: fileInstance,
          headers: {
            'Content-Type': fileInstance.type || 'application/javascript',
          },
        });
        if (!res.ok) {
          throw new Error(`上传失败 (${res.status})`);
        }
        setFileObjectKey(presigned.objectKey);
        if (editingVersionId) setFileReplaced(true);
        onSuccess(res as unknown as object);
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '上传失败');
        onError({ status: 500 });
      }
    },
    [materialId, formValues.version, editingVersionId]
  );

  const handleSsrUpload = useCallback(
    async ({ fileInstance, onSuccess, onError }: customRequestArgs) => {
      try {
        if (!materialId || !formValues.version?.trim()) {
          Toast.error('请先填写版本号再上传 SSR 产物');
          onError({ status: 400 });
          return;
        }
        const presigned = await materialApi.getPresignedUploadUrl({
          materialId,
          version: formValues.version.trim(),
          filename: fileInstance.name || 'index.cjs',
          bundle: 'ssr',
        });
        const res = await fetch(presigned.url, {
          method: 'PUT',
          body: fileInstance,
          headers: {
            'Content-Type': fileInstance.type || 'application/javascript',
          },
        });
        if (!res.ok) {
          throw new Error(`上传失败 (${res.status})`);
        }
        setSsrFileObjectKey(presigned.objectKey);
        if (editingVersionId) setSsrFileReplaced(true);
        onSuccess(res as unknown as object);
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '上传失败');
        onError({ status: 500 });
      }
    },
    [materialId, formValues.version, editingVersionId]
  );

  const handleSubmit = useCallback(async () => {
    if (!materialId) return;
    const ver = formValues.version?.trim();
    if (!ver) {
      Toast.error('请输入版本号');
      return;
    }

    let editorConfig: Record<string, unknown> | undefined;
    try {
      editorConfig = parseEditorConfigJson(formValues.editorConfigJson);
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : 'editorConfig 格式错误');
      return;
    }

    if (isEditing && editingVersionId) {
      try {
        const body: UpdateMaterialVersionParams = {
          changelog: formValues.changelog.trim(),
        };
        if (editorConfig !== undefined) body.editorConfig = editorConfig;
        if (fileReplaced && fileObjectKey) body.fileObjectKey = fileObjectKey;
        if (ssrFileReplaced && ssrFileObjectKey) body.ssrFileObjectKey = ssrFileObjectKey;
        await updateTrigger({ id: editingVersionId, data: body });
        Toast.success('更新成功');
        setVisible(false);
        resetForm();
        mutate();
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '更新失败');
      }
      return;
    }

    if (!fileObjectKey) {
      Toast.error('请上传 JS 文件');
      return;
    }
    if (!ssrFileObjectKey) {
      Toast.error('请上传 SSR 构建产物（CJS）');
      return;
    }
    try {
      await createTrigger({
        materialId,
        version: ver,
        changelog: formValues.changelog?.trim() || undefined,
        fileObjectKey,
        ssrFileObjectKey,
        ...(editorConfig !== undefined ? { editorConfig } : {}),
      });
      Toast.success('创建成功');
      setVisible(false);
      resetForm();
      mutate();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '创建失败');
    }
  }, [
    materialId,
    formValues,
    fileObjectKey,
    ssrFileObjectKey,
    isEditing,
    editingVersionId,
    fileReplaced,
    ssrFileReplaced,
    createTrigger,
    updateTrigger,
    mutate,
    resetForm,
  ]);

  const columns = [
    { title: '版本号', dataIndex: 'version' },
    { title: '变更说明', dataIndex: 'changelog' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => (
        <Tag color={versionStatusMap[status]?.color || 'grey'}>
          {versionStatusMap[status]?.text ?? String(status)}
        </Tag>
      ),
    },
    {
      title: '文件',
      dataIndex: 'fileUrl',
      render: (_: unknown, record: MaterialVersion) =>
        record.fileUrl ? (
          <Text link={{ href: record.fileUrl, target: '_blank' }}>下载 / 打开</Text>
        ) : (
          <Text type="tertiary">{record.fileObjectKey || '—'}</Text>
        ),
    },
    {
      title: 'SSR',
      dataIndex: 'ssrFileUrl',
      render: (_: unknown, record: MaterialVersion) =>
        record.ssrFileUrl ? (
          <Text link={{ href: record.ssrFileUrl, target: '_blank' }}>下载 / 打开</Text>
        ) : (
          <Tag color="grey">未配置</Tag>
        ),
    },
    { title: '发布时间', dataIndex: 'releaseTime' },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      render: (_: unknown, record: MaterialVersion) => {
        const id = rowId(record);
        return (
          <Space>
            {record.status === 0 && (
              <>
                <Button icon={<IconEdit />} theme="borderless" onClick={() => handleEdit(record)} />
                <Button
                  icon={<IconPlayCircle />}
                  theme="borderless"
                  onClick={() => handlePublish(id)}
                />
              </>
            )}
            {record.status === 2 && (
              <Popconfirm
                title="确认下线该版本？"
                content="下线后状态变为「已下线」；若当前为物料最新版本，将自动回退到其他已发布版本或清空"
                onConfirm={() => handleOffline(id)}
              >
                <Button icon={<IconStop />} theme="borderless" type="warning" />
              </Popconfirm>
            )}
            {record.status === 0 && (
              <Popconfirm
                title="确认删除？"
                content="此操作不可恢复"
                onConfirm={() => handleDelete(id)}
              >
                <Button icon={<IconDelete />} theme="borderless" type="danger" />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button onClick={() => navigate('/materials')}>返回</Button>
            <Title heading={5} style={{ margin: 0 }}>
              物料版本 - {materialTitle}
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
          rowKey={(record) => (record ? rowId(record) : '')}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑版本（仅开发中）' : '新增版本'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => {
          setVisible(false);
          resetForm();
        }}
        maskClosable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              版本号
            </Text>
            <Input
              placeholder="例如: 1.0.0"
              value={formValues.version}
              disabled={isEditing}
              onChange={(v) => {
                setFormValues((p) => ({ ...p, version: v }));
                if (!isEditing) {
                  setFileObjectKey('');
                  setSsrFileObjectKey('');
                  setUploadResetKey((k) => k + 1);
                }
              }}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              变更说明
            </Text>
            <TextArea
              rows={3}
              placeholder="选填，对应接口字段 changelog"
              value={formValues.changelog}
              onChange={(v) => setFormValues((p) => ({ ...p, changelog: v }))}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              编辑器配置 editorConfig（可选，JSON 对象）
            </Text>
            <TextArea
              rows={5}
              placeholder='例如 {"uid":"xxx","dependencies":[],"props":[]}'
              value={formValues.editorConfigJson}
              onChange={(v) => setFormValues((p) => ({ ...p, editorConfigJson: v }))}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              JS 构建产物{isEditing ? '（可选重新上传替换）' : ''}
            </Text>
            <Upload
              key={uploadResetKey}
              draggable
              accept=".js,application/javascript,text/javascript"
              limit={1}
              disabled={!formValues.version?.trim()}
              customRequest={handleJsUpload}
              onRemove={() => {
                if (isEditing) {
                  setFileObjectKey(baselineFileObjectKey);
                  setFileReplaced(false);
                } else {
                  setFileObjectKey('');
                }
                return true;
              }}
            >
              <IconUpload size="extra-large" />
              <Text type="tertiary" size="small">
                {isEditing
                  ? '当前版本已绑定文件；可重新上传替换（将调用更新接口写入新 objectKey）'
                  : '请先填写版本号；将文件直传到 MinIO，创建版本时提交 objectKey'}
              </Text>
            </Upload>
            {fileObjectKey ? (
              <Text type="secondary" size="small" style={{ display: 'block', marginTop: 8 }}>
                {fileReplaced ? '新 objectKey: ' : 'objectKey: '}
                {fileObjectKey}
              </Text>
            ) : null}
          </div>
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              SSR 构建产物（CJS）{isEditing ? '（可选重新上传替换）' : ''}
            </Text>
            <Upload
              key={`ssr-${uploadResetKey}`}
              draggable
              accept=".cjs,.js,application/javascript,text/javascript"
              limit={1}
              disabled={!formValues.version?.trim()}
              customRequest={handleSsrUpload}
              onRemove={() => {
                if (isEditing) {
                  setSsrFileObjectKey(baselineSsrFileObjectKey);
                  setSsrFileReplaced(false);
                } else {
                  setSsrFileObjectKey('');
                }
                return true;
              }}
            >
              <IconUpload size="extra-large" />
              <Text type="tertiary" size="small">
                {isEditing
                  ? '当前版本已绑定 SSR 产物时可重新上传替换'
                  : '请先填写版本号；默认文件名 index.cjs，直传至 MinIO 的 ssr/ 路径'}
              </Text>
            </Upload>
            {ssrFileObjectKey ? (
              <Text type="secondary" size="small" style={{ display: 'block', marginTop: 8 }}>
                {ssrFileReplaced ? '新 SSR objectKey: ' : 'SSR objectKey: '}
                {ssrFileObjectKey}
              </Text>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
