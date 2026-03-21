import React, { useEffect, useRef, useCallback } from 'react';
import { useSelectionContext } from '../../../../common/components/SchemaRenderer/SelectableSchemaRenderer';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useClipboardStore } from '../../../../core/store/clipboardStore';
import {
  removeById,
  findById,
  findParentById,
  addChild,
  duplicateNode,
} from '../../../../common/base/schemaOperator';

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
  const { selectedIds, clearSelection } = useSelectionContext();
  const { schema, setSchema } = useSchemaStore();
  const { copy, paste, hasCopied } = useClipboardStore();

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
    if (!hasCopied()) return;
    const newNodes = paste();
    if (newNodes.length === 0) return;

    let updated = schema;
    const pasteTargetId = hasSelection
      ? findParentById(schema, selectedIds[0])?.id ?? schema.id
      : schema.id;

    for (const node of newNodes) {
      updated = addChild(updated, pasteTargetId, node);
    }
    setSchema(updated);
    onClose();
  }, [schema, selectedIds, hasSelection, setSchema, paste, hasCopied, onClose]);

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
    { label: '粘贴', shortcut: 'Ctrl+V', action: handlePaste, disabled: !hasCopied(), dividerAfter: true },
    { label: '剪切', shortcut: 'Ctrl+X', action: handleCut },
    { label: '复制一份', shortcut: 'Ctrl+D', action: handleDuplicate, dividerAfter: true },
    { label: '删除', shortcut: 'Delete', action: handleDelete },
  ];

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

  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - menuItems.length * 36 - 16);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 10000,
        background: '#fff',
        borderRadius: 6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        padding: '4px 0',
        minWidth: 180,
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
              padding: '6px 12px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? '#bbb' : '#333',
              background: 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) (e.currentTarget as HTMLDivElement).style.background = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: '#aaa', fontSize: 12, marginLeft: 24 }}>{item.shortcut}</span>
          </div>
          {item.dividerAfter && i < menuItems.length - 1 && (
            <div style={{ height: 1, background: '#eee', margin: '4px 8px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
