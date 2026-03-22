import { useEffect, useCallback } from 'react';
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
  getResolvedInlineStyle,
  updateInlineStyle,
} from '../../../../common/base/schemaOperator';

export const KeyboardShortcuts: React.FC = () => {
  const { selectedIds, clearSelection } = useSelectionContext();
  const { schema, setSchema, undo, redo } = useSchemaStore();
  const { copy, paste, hasCopied } = useClipboardStore();

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    let updated = schema;
    for (const id of selectedIds) {
      updated = removeById(updated, id);
    }
    setSchema(updated);
    clearSelection();
  }, [selectedIds, schema, setSchema, clearSelection]);

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const nodes = selectedIds
      .map((id) => findById(schema, id))
      .filter((n): n is NonNullable<typeof n> => n !== null);
    if (nodes.length > 0) copy(nodes);
  }, [selectedIds, schema, copy]);

  const handlePaste = useCallback(() => {
    if (!hasCopied()) return;
    const newNodes = paste();
    if (newNodes.length === 0) return;

    let updated = schema;

    if (selectedIds.length > 0) {
      const parentNode = findParentById(schema, selectedIds[0]);
      const targetParentId = parentNode ? parentNode.id : schema.id;
      for (const node of newNodes) {
        updated = addChild(updated, targetParentId, node);
      }
    } else {
      for (const node of newNodes) {
        updated = addChild(updated, schema.id, node);
      }
    }

    setSchema(updated);
    if (newNodes.length > 0) {
      useSelectionStore.getState().setSelectedIds(newNodes.map((n) => n.id));
    }
  }, [schema, selectedIds, setSchema, paste, hasCopied]);

  const handleCut = useCallback(() => {
    handleCopy();
    handleDelete();
  }, [handleCopy, handleDelete]);

  const handleDuplicate = useCallback(() => {
    if (selectedIds.length === 0) return;
    let updated = schema;
    for (const id of selectedIds) {
      const result = duplicateNode(updated, id);
      if (result) updated = result;
    }
    setSchema(updated);
  }, [selectedIds, schema, setSchema]);

  const handleNudge = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    if (selectedIds.length === 0) return;
    let updated = schema;
    for (const id of selectedIds) {
      const node = findById(updated, id);
      if (!node) continue;
      const currentStyle = getResolvedInlineStyle(node);
      const mt = typeof currentStyle.marginTop === 'number' ? currentStyle.marginTop : 0;
      const ml = typeof currentStyle.marginLeft === 'number' ? currentStyle.marginLeft : 0;

      let newMt = mt;
      let newMl = ml;
      if (direction === 'up') newMt -= amount;
      else if (direction === 'down') newMt += amount;
      else if (direction === 'left') newMl -= amount;
      else if (direction === 'right') newMl += amount;

      updated = updateInlineStyle(updated, id, {
        ...currentStyle,
        marginTop: newMt,
        marginLeft: newMl,
      });
    }
    setSchema(updated);
  }, [selectedIds, schema, setSchema]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const amount = e.shiftKey ? 10 : 1;

      if (isCtrl && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (isCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudge('up', amount);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudge('down', amount);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudge('left', amount);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudge('right', amount);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (isCtrl && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (isCtrl && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (isCtrl && e.key === 'x') {
        e.preventDefault();
        handleCut();
      } else if (isCtrl && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleDelete, handleCopy, handlePaste, handleCut, handleDuplicate, handleNudge, undo, redo]);

  return null;
};
