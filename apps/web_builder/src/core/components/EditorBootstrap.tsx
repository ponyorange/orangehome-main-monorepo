import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Spin, Typography } from '@douyinfe/semi-ui';
import { useSchemaStore } from '../store/schemaStore';
import { useBuilderData, useUserData } from '../../data/modules';
import { ApiError } from '../../data/api/client';
import { LoginPage } from '../../features/auth/components/LoginPage';

interface EditorBootstrapProps {
  children: React.ReactNode;
}

function getPageIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('pageId');
}

export const EditorBootstrap: React.FC<EditorBootstrapProps> = ({ children }) => {
  const pageId = useMemo(() => getPageIdFromLocation(), []);
  const [appliedVersionId, setAppliedVersionId] = useState<string | null>(null);
  const setSchema = useSchemaStore((state) => state.setSchema);
  const { user, hasToken, isLoading: userLoading, error: userError, login } = useUserData();
  const { data, error, isLoading, mutate } = useBuilderData(pageId, hasToken);

  const unauthorizedMessage = useMemo(() => {
    const authError = userError instanceof ApiError && userError.status === 401 ? userError.message : null;
    const builderError = error instanceof ApiError && error.status === 401 ? error.message : null;
    return authError || builderError;
  }, [error, userError]);

  useEffect(() => {
    if (!data?.pageVersion.pageSchema) return;
    if (appliedVersionId === data.pageVersion.id) return;

    setSchema(data.pageVersion.pageSchema, { record: false });
    setAppliedVersionId(data.pageVersion.id);
  }, [appliedVersionId, data?.pageVersion.id, data?.pageVersion.pageSchema, setSchema]);

  if (!hasToken || unauthorizedMessage) {
    return <LoginPage loading={userLoading} message={unauthorizedMessage} onLogin={login} />;
  }

  if (pageId && (isLoading || (data && appliedVersionId !== data.pageVersion.id))) {
    return (
      <FullPageState
        title="正在加载编辑器数据"
        description="正在获取项目、页面和最新页面版本，请稍候..."
        extra={<Spin spinning />}
      />
    );
  }

  if (pageId && error) {
    return (
      <FullPageState
        title="编辑器初始化失败"
        description={error.message || 'builder/init 请求失败'}
        extra={(
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={() => void mutate()}>重试</Button>
            <Typography.Text type="tertiary" style={{ maxWidth: 320 }}>
              {user ? `当前用户：${user.nickname || user.email}` : '当前未获取到登录用户，请确认已登录并存在可用 token。'}
            </Typography.Text>
          </div>
        )}
      />
    );
  }

  return <>{children}</>;
};

interface FullPageStateProps {
  title: string;
  description: string;
  extra?: React.ReactNode;
}

const FullPageState: React.FC<FullPageStateProps> = ({ title, description, extra }) => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--theme-gradient-page)',
      padding: 24,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        width: 420,
        maxWidth: '100%',
        padding: 28,
        borderRadius: 28,
        background: 'var(--theme-gradient-panel)',
        border: '1px solid var(--theme-border-soft)',
        boxShadow: 'var(--theme-shadow-lg)',
        backdropFilter: 'blur(var(--theme-backdrop-blur))',
      }}
    >
      <Empty
        image={null}
        title={title}
        description={description}
        style={{ padding: 0 }}
      />
      {extra ? <div style={{ marginTop: 16 }}>{extra}</div> : null}
    </div>
  </div>
);
