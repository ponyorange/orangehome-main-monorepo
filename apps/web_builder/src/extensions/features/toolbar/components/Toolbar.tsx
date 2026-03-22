import React, { useRef, useState } from 'react';
import { Button, Toast } from '@douyinfe/semi-ui';
import { IconEyeOpened, IconDownload, IconUpload, IconCopy, IconLink, IconSave } from '@douyinfe/semi-icons';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { usePreviewStore } from '../../../../core/store/previewStore';
import { exportService } from '../../../../core/services/ExportService';
import { importService } from '../../../../core/services/ImportService';
import { saveBuilderPageVersion, useBuilderData, useUserData } from '../../../../data/modules';
import { useEditorPageId } from '../../../../core/context/EditorPageContext';

export const Toolbar: React.FC = () => {
  const primaryColor = 'var(--theme-primary)';
  const { schema, setSchema } = useSchemaStore();
  const openPreview = usePreviewStore((state) => state.openPreview);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const pageId = useEditorPageId();
  const { user } = useUserData();
  const { mutate: mutateBuilder } = useBuilderData(pageId, Boolean(pageId));

  const handleExport = () => {
    exportService.exportToJSON(schema);
    Toast.success('已导出 JSON');
  };

  const handleCopy = async () => {
    try {
      await exportService.copyToClipboard(schema);
      Toast.success('Schema 已复制到剪贴板');
    } catch {
      Toast.error('复制失败');
    }
  };

  const handleShareLink = async () => {
    try {
      const link = exportService.generateShareLink(schema);
      await navigator.clipboard.writeText(link);
      Toast.success('分享链接已复制到剪贴板');
    } catch {
      Toast.error('复制分享链接失败');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importService.importFromFile(file);
      setSchema(imported);
      Toast.success('导入成功');
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '导入失败');
    } finally {
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!pageId) {
      Toast.warning('当前没有 pageId，无法保存');
      return;
    }
    if (!user?.id) {
      Toast.warning('当前用户未登录，无法保存');
      return;
    }

    setSaving(true);
    try {
      const savedVersion = await saveBuilderPageVersion({
        pageId,
        pageSchema: schema,
        userId: user.id,
      });

      await mutateBuilder((current) => current ? {
        ...current,
        pageVersion: savedVersion,
      } : current, false);

      Toast.success(`保存成功，已生成第 ${savedVersion.versionNumber} 个版本`);
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Button
        icon={<IconEyeOpened />}
        type="primary"
        size="small"
        onClick={openPreview}
        style={{
          background: 'var(--theme-gradient-accent)',
          border: 'none',
          color: '#fff',
          borderRadius: 999,
          minWidth: 84,
          height: 34,
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >预览</Button>
      <Button
        icon={<IconSave />}
        type="secondary"
        size="small"
        loading={saving}
        onClick={handleSave}
        style={{
          color: primaryColor,
          borderColor: 'var(--theme-border-glow)',
          background: 'rgba(255,255,255,0.76)',
          borderRadius: 999,
          height: 34,
          boxShadow: 'var(--theme-shadow-sm)',
        }}
      >保存</Button>
      <Button
        icon={<IconDownload />}
        type="secondary"
        size="small"
        onClick={handleExport}
        style={{
          color: primaryColor,
          borderColor: 'var(--theme-border-glow)',
          background: 'rgba(255,255,255,0.68)',
          borderRadius: 999,
          height: 34,
        }}
      >导出</Button>
      <Button icon={<IconUpload />} type="tertiary" size="small" onClick={handleImportClick} style={ghostButtonStyle}>导入</Button>
      <Button icon={<IconCopy />} type="tertiary" size="small" onClick={handleCopy} style={ghostButtonStyle}>复制</Button>
      <Button icon={<IconLink />} type="tertiary" size="small" onClick={handleShareLink} style={ghostButtonStyle}>分享</Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
    </div>
  );
};

const ghostButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  height: 34,
  background: 'rgba(255,255,255,0.62)',
  border: '1px solid var(--theme-border-soft)',
  color: 'var(--theme-text-secondary)',
};
