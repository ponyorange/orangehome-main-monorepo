import React, { useMemo, useState } from 'react';
import { Avatar, Spin, Typography } from '@douyinfe/semi-ui';
import { useUserData } from '../../../../data/modules/useUserData';

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, rgba(244, 140, 69, 0.95) 0%, rgba(255, 125, 107, 0.92) 48%, rgba(255, 108, 168, 0.9) 100%)';

function displayInitial(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  const c = t[0];
  return /[a-zA-Z]/.test(c) ? c.toUpperCase() : c;
}

/**
 * 右上角：登录用户头像 + 昵称/邮箱回退；无图或加载失败用渐变占位 + 首字符。
 */
export const UserProfileChip: React.FC = () => {
  const { user, hasToken, isLoading } = useUserData();
  const [imgError, setImgError] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return '用户';
    const n = user.nickname?.trim();
    if (n) return n;
    return user.email || '用户';
  }, [user]);

  const avatarUrl = user?.avatar?.trim();
  const showImage = Boolean(avatarUrl) && !imgError;

  if (!hasToken) {
    return null;
  }

  if (isLoading && !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4 }}>
        <Spin size="small" />
      </div>
    );
  }

  const initial = displayInitial(displayName);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: 220,
        flexShrink: 0,
      }}
    >
      <Avatar
        size="small"
        src={showImage ? avatarUrl : undefined}
        onError={() => setImgError(true)}
        style={{
          flexShrink: 0,
          background: showImage ? undefined : DEFAULT_GRADIENT,
          color: '#fff',
          border: '1px solid var(--theme-border-soft)',
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >
        {!showImage ? (
          <span style={{ fontSize: 13, fontWeight: 700 }}>{initial}</span>
        ) : null}
      </Avatar>
      <Typography.Text
        strong
        ellipsis={{ showTooltip: true }}
        style={{
          fontSize: 13,
          color: 'var(--theme-text-primary)',
          maxWidth: 148,
        }}
      >
        {displayName}
      </Typography.Text>
    </div>
  );
};
