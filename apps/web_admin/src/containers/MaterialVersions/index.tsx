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
import { IconPlus, IconDelete, IconPlayCircle, IconUpload } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { materialApi } from '@/services/material';
import { materialVersionApi } from '@/services/materialVersion';
import type { CreateMaterialVersionParams, MaterialVersion } from '@/types/materialVersion';
import type { Material } from '@/types/material';

const { Title, Text } = Typography;

/** 与 GET list 的 status 查询参数一致：0 开发中 1 测试中 2 已发布 */
const versionStatusMap: Record<number, { text: string; color: TagColor }> = {
  0: { text: '开发中', color: 'grey' },
  1: { text: '测试中', color: 'blue' },
  2: { text: '已发布', color: 'green' },
};

function rowId(record: MaterialVersion): string {
  return String(record.id ?? record._id ?? '');
}

export function MaterialVersions() {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [fileObjectKey, setFileObjectKey] = useState('');
  const [formValues, setFormValues] = useState<{
    version: string;
    changelog: string;
  }>({
    version: '',
    changelog: '',
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

  const { trigger: deleteTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.delete(arg)
  );

  const { trigger: publishTrigger } = useSWRMutation(
    'versions',
    (_, { arg }: { arg: string }) => materialVersionApi.publish(arg)
  );

  const versions = data?.data ?? [];
  const materialTitle = materialData?.materialName || materialData?.name || materialId;

  const resetForm = useCallback(() => {
    setFormValues({ version: '', changelog: '' });
    setFileObjectKey('');
    setUploadResetKey((k) => k + 1);
  }, []);

  const handleAdd = useCallback(() => {
    resetForm();
    setVisible(true);
  }, [resetForm]);

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
        onSuccess(res as unknown as object);
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '上传失败');
        onError({ status: 500 });
      }
    },
    [materialId, formValues.version]
  );

  const handleSubmit = useCallback(async () => {
    if (!materialId) return;
    const ver = formValues.version?.trim();
    if (!ver) {
      Toast.error('请输入版本号');
      return;
    }
    if (!fileObjectKey) {
      Toast.error('请上传 JS 文件');
      return;
    }
    try {
      await createTrigger({
        materialId,
        version: ver,
        changelog: formValues.changelog?.trim() || undefined,
        fileObjectKey,
      });
      Toast.success('创建成功');
      setVisible(false);
      resetForm();
      mutate();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '创建失败');
    }
  }, [materialId, formValues, fileObjectKey, createTrigger, mutate, resetForm]);

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
    { title: '发布时间', dataIndex: 'releaseTime' },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      render: (_: unknown, record: MaterialVersion) => {
        const id = rowId(record);
        return (
          <Space>
            {record.status === 0 && (
              <Button
                icon={<IconPlayCircle />}
                theme="borderless"
                onClick={() => handlePublish(id)}
              />
            )}
            <Popconfirm
              title="确认删除？"
              content="此操作不可恢复"
              onConfirm={() => handleDelete(id)}
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
        title="新增版本"
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
              onChange={(v) => {
                setFormValues((p) => ({ ...p, version: v }));
                setFileObjectKey('');
                setUploadResetKey((k) => k + 1);
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
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              JS 构建产物
            </Text>
            <Upload
              key={uploadResetKey}
              draggable
              accept=".js,application/javascript,text/javascript"
              limit={1}
              disabled={!formValues.version?.trim()}
              customRequest={handleJsUpload}
              onRemove={() => {
                setFileObjectKey('');
                return true;
              }}
            >
              <IconUpload size="extra-large" />
              <Text type="tertiary" size="small">
                请先填写版本号；将文件直传到 MinIO，创建版本时提交 objectKey（与 api-docs 一致）
              </Text>
            </Upload>
            {fileObjectKey ? (
              <Text type="secondary" size="small" style={{ display: 'block', marginTop: 8 }}>
                已上传，objectKey: {fileObjectKey}
              </Text>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
