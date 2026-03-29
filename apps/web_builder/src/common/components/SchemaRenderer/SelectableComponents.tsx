import React, { useRef, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import type { ISchema } from '../../../types/base';
import { getResolvedInlineStyle } from '../../base/schemaOperator';
import { useMaterialBundleStore } from '../../../core/store/materialBundleStore';
import { mergeRemoteDefinition, RemoteSchemaNode } from './BaseComponents';
import { useSchemaEventHandlers } from './utils/eventActions';
import { canvasSchemaHostRegistry } from './CanvasSchemaHostRegistry';

function queryHostInCanvas(schemaId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.querySelector('[data-canvas-area="true"]');
  if (!canvas) return null;
  try {
    return canvas.querySelector(`[id="${CSS.escape(schemaId)}"]`) as HTMLElement | null;
  } catch {
    return null;
  }
}

export interface SelectableSchemaNodeProps {
  schema: ISchema;
  selectable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
}

/**
 * 可选择的 Schema 叶节点：仅渲染物料宿主并登记真实 DOM；选中框 / hover 由 CanvasInteractionChrome + HostRegistry 负责。
 */
export const SelectableSchemaNode: React.FC<SelectableSchemaNodeProps> = ({
  schema,
  selectable = true,
  isSelected = false,
  isHovered: _isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}) => {
  const [hostEl, setHostEl] = useState<HTMLElement | null>(null);
  const setHostRef = useCallback((node: HTMLElement | null) => {
    setHostEl(node);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      onClick?.(schema.id, e);
    },
    [schema.id, onClick, selectable],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      onMouseEnter?.(schema.id);
    },
    [schema.id, onMouseEnter, selectable],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      onMouseLeave?.();
    },
    [onMouseLeave, selectable],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(schema.id, e);
    },
    [schema.id, onContextMenu, selectable],
  );

  const bundleUrl = useMaterialBundleStore((s) => s.bundles[schema.type]);
  const remoteDefinition = useMemo(() => mergeRemoteDefinition(schema, bundleUrl), [schema, bundleUrl]);

  useLayoutEffect(() => {
    let cancelled = false;
    let rafAttempts = 0;
    const maxRafAttempts = 12;

    const sync = () => {
      if (cancelled) return;
      const el = (hostEl?.isConnected ? hostEl : null) ?? queryHostInCanvas(schema.id);
      if (el) {
        canvasSchemaHostRegistry.register(schema.id, el);
        return;
      }
      canvasSchemaHostRegistry.unregister(schema.id);
      if (rafAttempts < maxRafAttempts) {
        rafAttempts += 1;
        requestAnimationFrame(sync);
      }
    };

    sync();
    return () => {
      cancelled = true;
      canvasSchemaHostRegistry.unregister(schema.id);
    };
  }, [hostEl, schema.id, bundleUrl, remoteDefinition]);

  /** 不写 position：避免在 RemoteSchemaNode 的 mergedStyle 里盖住 schema 的 absolute/relative */
  const hostStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-block',
      verticalAlign: 'top',
      cursor: selectable ? (isSelected ? 'move' : onClick ? 'pointer' : 'default') : 'default',
    }),
    [selectable, isSelected, onClick],
  );

  const hostInteractiveProps = useMemo(
    () => ({
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onContextMenu: handleContextMenu,
    }),
    [handleClick, handleMouseEnter, handleMouseLeave, handleContextMenu],
  );

  if (!remoteDefinition) {
    return (
      <div
        ref={setHostRef as React.Ref<HTMLDivElement>}
        key={schema.id}
        id={schema.id}
        style={{
          ...(getResolvedInlineStyle(schema) as React.CSSProperties),
          ...hostStyle,
          color: '#999',
          fontSize: 12,
        }}
        {...hostInteractiveProps}
      >
        [未知组件: {schema.type}]
      </div>
    );
  }

  return (
    <RemoteSchemaNode
      schema={schema}
      hostRef={setHostRef}
      hostStyle={hostStyle}
      hostInteractiveProps={hostInteractiveProps}
    />
  );
};

export interface SelectableContainerProps {
  schema: ISchema;
  selectable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const SelectableContainer: React.FC<SelectableContainerProps> = ({
  schema,
  selectable = true,
  isSelected,
  isHovered: _isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  children,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const eventHandlers = useSchemaEventHandlers(schema);

  useLayoutEffect(() => {
    const el = nodeRef.current;
    if (!el) return undefined;
    canvasSchemaHostRegistry.register(schema.id, el);
    return () => canvasSchemaHostRegistry.unregister(schema.id);
  }, [schema.id]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      const eventClick = eventHandlers.onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
      eventClick?.(e as React.MouseEvent<HTMLElement>);
      onClick?.(schema.id, e);
    },
    [eventHandlers, schema.id, onClick, selectable],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      onMouseEnter?.(schema.id);
    },
    [schema.id, onMouseEnter, selectable],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.stopPropagation();
      onMouseLeave?.();
    },
    [onMouseLeave, selectable],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!selectable) return;
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(schema.id, e);
    },
    [schema.id, onContextMenu, selectable],
  );

  const style = getResolvedInlineStyle(schema) as React.CSSProperties;
  const rawPos = style.position;
  const position: React.CSSProperties['position'] =
    rawPos !== undefined && rawPos !== null && !(typeof rawPos === 'string' && rawPos.trim() === '')
      ? rawPos
      : 'relative';

  return (
    <div
      ref={nodeRef}
      style={{
        ...style,
        position,
        cursor: selectable ? (isSelected ? 'move' : onClick ? 'pointer' : 'default') : 'default',
      }}
      id={schema.id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  );
};
