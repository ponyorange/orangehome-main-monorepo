import React, { useRef, useState } from 'react';
import { Button, Toast } from '@douyinfe/semi-ui';
import { IconEyeOpened, IconDownload, IconUpload, IconCopy, IconLink, IconSave } from '@douyinfe/semi-icons';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useDocumentSyncStore } from '../../../../core/store/documentSyncStore';
import { usePreviewStore } from '../../../../core/store/previewStore';
import { exportService } from '../../../../core/services/ExportService';
import { importService } from '../../../../core/services/ImportService';
import { saveBuilderPageVersion, useBuilderData, useUserData } from '../../../../data/modules';
import { useEditorPageId } from '../../../../core/context/EditorPageContext';
import { useShareRuntimePreviewLink } from '../../../../common/hooks/useShareRuntimePreviewLink';

export const Toolbar: React.FC = () => {
  const primaryColor = 'var(--theme-primary)';
  const { schema, setSchema } = useSchemaStore();
  const isDirty = useDocumentSyncStore((s) => s.isDirty);
  const openPreview = usePreviewStore((state) => state.openPreview);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [previewPreparing, setPreviewPreparing] = useState(false);
  const pageId = useEditorPageId();
  const { sharePreviewLink, sharePreviewLinkModal } = useShareRuntimePreviewLink(pageId);
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

  const performSave = async (): Promise<boolean> => {
    if (!pageId) {
      Toast.warning('当前没有 pageId，无法保存');
      return false;
    }
    if (!user?.id) {
      Toast.warning('当前用户未登录，无法保存');
      return false;
    }

    const pageSchema = useSchemaStore.getState().schema;

    try {
      const savedVersion = await saveBuilderPageVersion({
        pageId,
        pageSchema,
        userId: user.id,
      });

      await mutateBuilder((current) => current ? {
        ...current,
        pageVersion: savedVersion,
      } : current, false);

      useDocumentSyncStore.getState().markClean();
      Toast.success(`保存成功，已生成第 ${savedVersion.versionNumber} 个版本`);
      return true;
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '保存失败');
      return false;
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await performSave();
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (previewPreparing || saving) return;

    if (!isDirty) {
      openPreview();
      return;
    }

    setPreviewPreparing(true);
    try {
      const ok = await performSave();
      if (ok) openPreview();
    } finally {
      setPreviewPreparing(false);
    }
  };

  return (
    <>
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
        loading={previewPreparing}
        disabled={previewPreparing || saving}
        onClick={() => void handlePreview()}
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
      <Button icon={<IconLink />} type="tertiary" size="small" onClick={() => void sharePreviewLink()} style={ghostButtonStyle}>分享</Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
    </div>
    {sharePreviewLinkModal}
    </>
  );
};

const ghostButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  height: 34,
  background: 'rgba(255,255,255,0.62)',
  border: '1px solid var(--theme-border-soft)',
  color: 'var(--theme-text-secondary)',
};
