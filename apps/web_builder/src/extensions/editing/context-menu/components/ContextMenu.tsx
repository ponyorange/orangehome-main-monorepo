import React, { useEffect, useRef, useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelectionContext } from '../../../../common/components/SchemaRenderer/SelectableSchemaRenderer';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { useClipboardStore } from '../../../../core/store/clipboardStore';
import {
  removeById,
  findById,
  findParentById,
  addChild,
  duplicateNode,
} from '../../../../common/base/schemaOperator';
import {
  resolveContextMenuPlacement,
  fallbackContextMenuDimensions,
} from '../../../../utils/contextMenuPlacement';

interface ContextMenuProps {
  x: number;
  y: number;
  targetId: string;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  shortcut: string;
  action: () => void;
  disabled?: boolean;
  dividerAfter?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetId, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number }>(() => ({ left: x, top: y }));
  const { selectedIds, clearSelection } = useSelectionContext();
  const { schema, setSchema } = useSchemaStore();
  const { copy, paste, hasCopied } = useClipboardStore();
  const clipboardHasContent = hasCopied();

  const hasSelection = selectedIds.length > 0;

  const handleCopy = useCallback(() => {
    const ids = hasSelection ? selectedIds : [targetId];
    const nodes = ids
      .map((id) => findById(schema, id))
      .filter((n): n is NonNullable<typeof n> => n !== null);
    if (nodes.length > 0) copy(nodes);
    onClose();
  }, [hasSelection, selectedIds, targetId, schema, copy, onClose]);

  const handlePaste = useCallback(() => {
    if (!clipboardHasContent) return;
    const newNodes = paste();
    if (newNodes.length === 0) return;

    let updated = schema;
    const pasteTargetId = hasSelection
      ? findParentById(schema, selectedIds[0])?.id ?? schema.id
      : schema.id;

    const pastedIds: string[] = [];
    for (const node of newNodes) {
      updated = addChild(updated, pasteTargetId, node);
      pastedIds.push(node.id);
    }
    setSchema(updated);
    if (pastedIds.length > 0) {
      useSelectionStore.getState().setSelectedIds(pastedIds);
    }
    onClose();
  }, [schema, selectedIds, hasSelection, setSchema, paste, clipboardHasContent, onClose]);

  const handleCut = useCallback(() => {
    const ids = hasSelection ? selectedIds : [targetId];
    const nodes = ids
      .map((id) => findById(schema, id))
      .filter((n): n is NonNullable<typeof n> => n !== null);
    if (nodes.length > 0) copy(nodes);

    let updated = schema;
    for (const id of ids) {
      updated = removeById(updated, id);
    }
    setSchema(updated);
    clearSelection();
    onClose();
  }, [hasSelection, selectedIds, targetId, schema, copy, setSchema, clearSelection, onClose]);

  const handleDelete = useCallback(() => {
    const ids = hasSelection ? selectedIds : [targetId];
    let updated = schema;
    for (const id of ids) {
      updated = removeById(updated, id);
    }
    setSchema(updated);
    clearSelection();
    onClose();
  }, [hasSelection, selectedIds, targetId, schema, setSchema, clearSelection, onClose]);

  const handleDuplicate = useCallback(() => {
    const ids = hasSelection ? selectedIds : [targetId];
    let updated = schema;
    for (const id of ids) {
      const result = duplicateNode(updated, id);
      if (result) updated = result;
    }
    setSchema(updated);
    onClose();
  }, [hasSelection, selectedIds, targetId, schema, setSchema, onClose]);

  const menuItems: MenuItem[] = [
    { label: '复制', shortcut: 'Ctrl+C', action: handleCopy },
    { label: '粘贴', shortcut: 'Ctrl+V', action: handlePaste, disabled: !clipboardHasContent, dividerAfter: true },
    { label: '剪切', shortcut: 'Ctrl+X', action: handleCut },
    { label: '复制一份', shortcut: 'Ctrl+D', action: handleDuplicate, dividerAfter: true },
    { label: '删除', shortcut: 'Delete', action: handleDelete },
  ];

  const menuItemCount = menuItems.length;

  useLayoutEffect(() => {
    const el = menuRef.current;
    let mw = el?.offsetWidth ?? 0;
    let mh = el?.offsetHeight ?? 0;
    if (mw < 1 || mh < 1) {
      const fb = fallbackContextMenuDimensions(menuItemCount);
      mw = fb.width;
      mh = fb.height;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPlacement(resolveContextMenuPlacement({
      clientX: x,
      clientY: y,
      menuWidth: mw,
      menuHeight: mh,
      viewportWidth: vw,
      viewportHeight: vh,
    }));
  }, [x, y, targetId, clipboardHasContent, menuItemCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  /**
   * 挂到 document.body：画布所在 <main> 使用 backdrop-filter 时，会在部分浏览器中为 fixed
   * 建立新的包含块，导致仍按视口 clientX/Y 计算的 left/top 与鼠标位置错位。
   */
  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: placement.left,
        top: placement.top,
        zIndex: 10000,
        background: 'var(--theme-gradient-panel)',
        border: '1px solid var(--theme-border-soft)',
        borderRadius: 18,
        boxShadow: 'var(--theme-shadow-lg)',
        backdropFilter: 'blur(var(--theme-backdrop-blur))',
        padding: '6px',
        minWidth: 204,
        fontSize: 13,
        userSelect: 'none',
      }}
    >
      {menuItems.map((item, i) => (
        <React.Fragment key={item.label}>
          <div
            onClick={item.disabled ? undefined : item.action}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? 'var(--theme-text-disabled)' : 'var(--theme-text-primary)',
              background: 'transparent',
              borderRadius: 12,
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.76)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--theme-shadow-sm)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: 'var(--theme-text-secondary)', fontSize: 12, marginLeft: 24 }}>{item.shortcut}</span>
          </div>
          {item.dividerAfter && i < menuItems.length - 1 && (
            <div style={{ height: 1, background: 'var(--theme-divider)', margin: '6px 8px' }} />
          )}
        </React.Fragment>
      ))}
    </div>,
    document.body,
  );
};
