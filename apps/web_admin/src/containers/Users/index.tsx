import {
  Card,
  Typography,
  Button,
  Table,
  Modal,
  Input,
  Toast,
  Popconfirm,
  Tag,
  Avatar,
  Space,
} from '@douyinfe/semi-ui';
import { IconPlus, IconClose } from '@douyinfe/semi-icons';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { userApi } from '@/services/user';
import type { UserListItem } from '@/types/user';

const { Title } = Typography;

export function Users() {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    emailKeyword: '',
  });
  const [addIdentityVisible, setAddIdentityVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [identityName, setIdentityName] = useState('');

  const { data, mutate, isLoading } = useSWR(
    ['users', queryParams],
    () => userApi.getList(queryParams),
    { revalidateOnFocus: false }
  );

  const { trigger: addIdentityTrigger } = useSWRMutation(
    'users',
    (_, { arg }: { arg: { userId: string; identityName: string } }) =>
      userApi.addIdentity(arg.userId, arg.identityName)
  );

  const { trigger: removeIdentityTrigger } = useSWRMutation(
    'users',
    (_, { arg }: { arg: { userId: string; identityName: string } }) =>
      userApi.removeIdentity(arg.userId, arg.identityName)
  );

  const users = data?.data || [];
  const total = data?.total ?? 0;

  const handleAddIdentity = useCallback((record: UserListItem) => {
    setSelectedUser(record);
    setIdentityName('');
    setAddIdentityVisible(true);
  }, []);

  const handleAddIdentitySubmit = useCallback(async () => {
    if (!selectedUser || !identityName.trim()) {
      Toast.warning('请输入身份名称');
      return;
    }
    try {
      await addIdentityTrigger({ userId: selectedUser.id, identityName: identityName.trim() });
      Toast.success('添加成功');
      setAddIdentityVisible(false);
      mutate();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : '添加失败');
    }
  }, [selectedUser, identityName, addIdentityTrigger, mutate]);

  const handleRemoveIdentity = useCallback(
    async (userId: string, identityName: string) => {
      try {
        await removeIdentityTrigger({ userId, identityName });
        Toast.success('移除成功');
        mutate();
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '移除失败');
      }
    },
    [removeIdentityTrigger, mutate]
  );

  const formatDate = (v?: number | string) => {
    if (v === undefined || v === null || v === '') return '-';

    const toDate = (input: number | string): Date | null => {
      // number: 10-digit seconds or 13-digit milliseconds (best-effort)
      if (typeof input === 'number' && Number.isFinite(input)) {
        const ms = input > 1e12 ? input : input * 1000;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d;
      }

      const raw = String(input).trim();
      if (!raw) return null;

      // numeric string: seconds or milliseconds
      if (/^\d+$/.test(raw)) {
        const n = Number(raw);
        if (!Number.isFinite(n)) return null;
        const ms = raw.length >= 13 ? n : n * 1000;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d;
      }

      // ISO / RFC / other parseable date string
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const d = toDate(v);
    if (!d) return '-';

    // local timezone formatting (current OS timezone)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  };

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      width: 64,
      render: (url: string, record: UserListItem) => (
        <Avatar
          size="small"
          src={url}
          style={{ backgroundColor: 'var(--semi-color-primary)' }}
        >
          {(record.nickname || record.email || 'U').charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    { title: '邮箱', dataIndex: 'email', width: 200 },
    { title: '昵称', dataIndex: 'nickname', width: 120, render: (v: string) => v || '-' },
    {
      title: '身份',
      dataIndex: 'identities',
      render: (identities: string[], record: UserListItem) => (
        <Space wrap>
          {(identities || []).map((name) => (
            <Tag key={name} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {name}
              <Popconfirm
                title="确认移除该身份？"
                onConfirm={() => handleRemoveIdentity(record.id, name)}
              >
                <IconClose
                  size="small"
                  style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Tag>
          ))}
          {(!identities || identities.length === 0) && (
            <span style={{ color: 'var(--semi-color-text-3)' }}>-</span>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: number | string) => formatDate(v),
    },
    {
      title: '操作',
      width: 120,
      render: (_: unknown, record: UserListItem) => (
        <Button
          icon={<IconPlus />}
          size="small"
          theme="borderless"
          onClick={() => handleAddIdentity(record)}
        >
          添加身份
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title heading={5}>用户列表</Title>
          <Input
            placeholder="搜索邮箱"
            value={queryParams.emailKeyword}
            onChange={(v) =>
              setQueryParams((p) => ({ ...p, emailKeyword: String(v), page: 1 }))
            }
            style={{ width: 200 }}
            showClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{
            currentPage: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            onPageChange: (page) => setQueryParams((p) => ({ ...p, page })),
            onPageSizeChange: (size) =>
              setQueryParams((p) => ({ ...p, pageSize: size, page: 1 })),
          }}
        />
      </Card>

      <Modal
        title="添加身份"
        visible={addIdentityVisible}
        onOk={handleAddIdentitySubmit}
        onCancel={() => setAddIdentityVisible(false)}
        maskClosable={false}
        okButtonProps={{ disabled: !identityName.trim() }}
      >
        <div style={{ marginBottom: 16 }}>
          {selectedUser && (
            <div style={{ marginBottom: 12, color: 'var(--semi-color-text-2)' }}>
              用户：{selectedUser.nickname || '-'} ({selectedUser.email})
            </div>
          )}
          <Input
            placeholder="请输入身份名称，如：admin、vip"
            value={identityName}
            onChange={setIdentityName}
            onPressEnter={handleAddIdentitySubmit}
          />
        </div>
      </Modal>
    </>
  );
}
