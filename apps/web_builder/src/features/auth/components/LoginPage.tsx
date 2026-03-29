import React, { useMemo, useState } from 'react';
import { Button, Input, Toast, Typography } from '@douyinfe/semi-ui';
import { IconLock, IconMail, IconArrowRight, IconLightningStroked } from '@douyinfe/semi-icons';
import type { LoginParams } from '../../../data/modules';

interface LoginPageProps {
  loading?: boolean;
  message?: string | null;
  onLogin: (params: LoginParams) => Promise<unknown>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ loading = false, message, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const disabled = useMemo(() => !email.trim() || !password.trim() || submitting || loading, [email, loading, password, submitting]);

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onLogin({
        email: email.trim(),
        password,
      });
      Toast.success('登录成功，正在进入编辑器');
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        background: 'var(--theme-gradient-page)',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <ColorBlob top={64} left={48} size={180} colors="linear-gradient(135deg, rgba(255, 133, 162, 0.35), rgba(255, 215, 120, 0.15))" />
        <ColorBlob top={210} left={280} size={240} colors="linear-gradient(135deg, rgba(129, 140, 248, 0.28), rgba(56, 189, 248, 0.12))" />
        <ColorBlob top={420} left={120} size={220} colors="linear-gradient(135deg, rgba(244, 114, 182, 0.18), rgba(192, 132, 252, 0.20))" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'var(--theme-surface-glass)',
              color: 'var(--theme-primary)',
              fontWeight: 700,
              backdropFilter: 'blur(var(--theme-backdrop-blur))',
              boxShadow: 'var(--theme-shadow-sm)',
              border: '1px solid var(--theme-border-soft)',
            }}
          >
            <IconLightningStroked />
            Orange Editor
          </div>

          <Typography.Title
            heading={1}
            style={{
              marginTop: 28,
              marginBottom: 0,
              fontSize: 52,
              lineHeight: 1.15,
              color: 'var(--theme-text-primary)',
              maxWidth: 560,
            }}
          >
            登录后，继续你的
            <br />
            手机 H5 搭建之旅
          </Typography.Title>

          <Typography.Paragraph
            style={{
              marginTop: 20,
              fontSize: 17,
              lineHeight: 1.9,
              color: 'var(--theme-text-secondary)',
              maxWidth: 560,
            }}
          >
            从欢迎页、营销页到品牌官网，一套可视化编辑体验帮你把页面灵感快速落地。登录后将自动拉取项目、页面与最新版本内容。
          </Typography.Paragraph>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <FeatureCard title="可视化搭建" description="拖拽、对齐、图层与属性面板联动。" />
          <FeatureCard title="移动端优先" description="默认就是 H5 风格和手机预览尺寸。" />
          <FeatureCard title="一键发布" description="一键发布到线上环境。" />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 430,
            maxWidth: '100%',
            padding: 32,
            borderRadius: 30,
            background: 'var(--theme-gradient-panel)',
            border: '1px solid var(--theme-border-soft)',
            boxShadow: 'var(--theme-shadow-lg)',
            backdropFilter: 'blur(var(--theme-backdrop-blur))',
          }}
        >
          <Typography.Title heading={3} style={{ marginTop: 0, marginBottom: 8, color: 'var(--theme-text-primary)' }}>
            欢迎回来
          </Typography.Title>
          <Typography.Text style={{ color: 'var(--theme-text-secondary)' }}>
            使用你的账号登录，进入 Builder 编辑器。
          </Typography.Text>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              size="large"
              prefix={<IconMail />}
              value={email}
              onChange={setEmail}
              placeholder="请输入邮箱"
              style={inputStyle}
            />
            <Input
              size="large"
              mode="password"
              prefix={<IconLock />}
              value={password}
              onChange={setPassword}
              placeholder="请输入密码"
              style={inputStyle}
              onEnterPress={handleSubmit}
            />
          </div>

          <div
            style={{
              marginTop: 14,
              minHeight: 22,
              fontSize: 13,
              color: message ? 'var(--theme-error)' : 'var(--theme-text-secondary)',
            }}
          >
            {message || '未登录或登录已过期，请重新登录后继续编辑。'}
          </div>

          <Button
            theme="solid"
            type="primary"
            size="large"
            block
            loading={submitting || loading}
            disabled={disabled}
            icon={<IconArrowRight />}
            style={{
              marginTop: 18,
              height: 48,
              border: 'none',
              borderRadius: 18,
              background: 'var(--theme-gradient-accent)',
              boxShadow: 'var(--theme-shadow-md)',
              fontWeight: 700,
            }}
            onClick={handleSubmit}
          >
            登录并进入编辑器
          </Button>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  height: 48,
  borderRadius: 16,
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid var(--theme-border-soft)',
  boxShadow: 'var(--theme-shadow-sm)',
};

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div
    style={{
      padding: '18px 18px 16px',
      borderRadius: 22,
      background: 'var(--theme-surface-glass)',
      border: '1px solid var(--theme-border-soft)',
      boxShadow: 'var(--theme-shadow-md)',
      backdropFilter: 'blur(var(--theme-backdrop-blur))',
    }}
  >
    <Typography.Text style={{ display: 'block', fontSize: 16, fontWeight: 800, color: 'var(--theme-text-primary)' }}>
      {title}
    </Typography.Text>
    <Typography.Paragraph style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.8, color: 'var(--theme-text-secondary)' }}>
      {description}
    </Typography.Paragraph>
  </div>
);

const ColorBlob: React.FC<{ top: number; left: number; size: number; colors: string }> = ({ top, left, size, colors }) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width: size,
      height: size,
      borderRadius: '50%',
      background: colors,
      filter: 'blur(6px)',
      zIndex: 0,
    }}
  />
);
