import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { ISchema } from '../../../types/base';
import { getResolvedInlineStyle } from '../../base/schemaOperator';
import { useMaterialBundleStore } from '../../../core/store/materialBundleStore';
import { mergeRemoteDefinition, RemoteSchemaNode } from './BaseComponents';
import { SelectionBox } from '../../../extensions/select-and-drag/components/SelectionBox';
import type { ResizeDirection } from '../../../extensions/select-and-drag/hooks/useResize';
import { useSchemaEventHandlers } from './utils/eventActions';

export interface SelectableSchemaNodeProps {
  schema: ISchema;
  selectable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
  onMoveStart?: (id: string, clientX: number, clientY: number) => void;
  onResizeStart?: (id: string, direction: ResizeDirection, clientX: number, clientY: number, width: number, height: number) => void;
}

/**
 * 可选择的 Schema 节点
 * 支持点击选中、悬停高亮
 */
export const SelectableSchemaNode: React.FC<SelectableSchemaNodeProps> = ({
  schema,
  selectable = true,
  isSelected = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  onMoveStart,
  onResizeStart,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [boxRect, setBoxRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [localHovered, setLocalHovered] = useState(false);

  // 测量真实组件位置和尺寸
  useEffect(() => {
    if (!nodeRef.current || !contentRef.current) return;

    const wrapperRect = nodeRef.current.getBoundingClientRect();
    const targetEl = (contentRef.current.firstElementChild as HTMLElement | null) ?? contentRef.current;
    const targetRect = targetEl.getBoundingClientRect();

    setBoxRect({
      x: Math.round(targetRect.left - wrapperRect.left),
      y: Math.round(targetRect.top - wrapperRect.top),
      width: Math.round(targetRect.width),
      height: Math.round(targetRect.height),
    });
  }, [isSelected, schema]);

  // 处理点击
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    onClick?.(schema.id, e);
  }, [schema.id, onClick, selectable]);

  // 处理悬停 - 使用本地状态和父状态结合
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setLocalHovered(true);
    onMouseEnter?.(schema.id);
  }, [schema.id, onMouseEnter, selectable]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setLocalHovered(false);
    onMouseLeave?.();
  }, [onMouseLeave, selectable]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(schema.id, e);
  }, [schema.id, onContextMenu, selectable]);

  const handleMoveStart = useCallback((e: React.MouseEvent) => {
    if (!selectable || !isSelected) return;
    e.stopPropagation();
    onMoveStart?.(schema.id, e.clientX, e.clientY);
  }, [schema.id, isSelected, onMoveStart, selectable]);

  const handleResizeStart = useCallback((direction: ResizeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart?.(schema.id, direction, e.clientX, e.clientY, boxRect.width, boxRect.height);
  }, [schema.id, boxRect, onResizeStart]);

  const bundleUrl = useMaterialBundleStore((s) => s.bundles[schema.type]);
  const remoteDefinition = useMemo(() => mergeRemoteDefinition(schema, bundleUrl), [schema, bundleUrl]);

  const showHover = selectable && (isHovered || localHovered);

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    cursor: selectable ? (isSelected ? 'move' : onClick ? 'pointer' : 'default') : 'default',
    display: 'inline-block',
    verticalAlign: 'top',
  };

  const borderStyle: React.CSSProperties = {
    outline: showHover
      ? '1px dashed var(--theme-primary)'
      : 'none',
    outlineOffset: '-1px',
  };

  return (
    <div
      ref={nodeRef}
      key={schema.id}
      data-schema-id={schema.id}
      style={{ ...baseStyle, ...borderStyle }}
      onClick={handleClick}
      onMouseDown={handleMoveStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      <div ref={contentRef} style={{ position: 'relative', display: 'inline-block', verticalAlign: 'top' }}>
        {remoteDefinition ? (
          <RemoteSchemaNode schema={schema} />
        ) : (
          <div style={{ color: '#999', fontSize: 12 }}>[未知组件: {schema.type}]</div>
        )}
      </div>

      {selectable && isSelected && (
        <SelectionBox
          x={boxRect.x}
          y={boxRect.y}
          width={boxRect.width || 100}
          height={boxRect.height || 50}
          componentId={schema.id}
          onMoveStart={handleMoveStart}
          onResizeStart={handleResizeStart}
        />
      )}
    </div>
  );
};

/**
 * 可选择的容器组件
 */
export interface SelectableContainerProps {
  schema: ISchema;
  selectable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
  onContextMenu?: (id: string, event: React.MouseEvent) => void;
  onMoveStart?: (id: string, clientX: number, clientY: number) => void;
  onResizeStart?: (id: string, direction: ResizeDirection, clientX: number, clientY: number, width: number, height: number) => void;
  children?: React.ReactNode;
}

export const SelectableContainer: React.FC<SelectableContainerProps> = ({
  schema,
  selectable = true,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  onMoveStart,
  onResizeStart,
  children,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [localHovered, setLocalHovered] = useState(false);
  const eventHandlers = useSchemaEventHandlers(schema);

  // 测量节点尺寸
  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, [isSelected, schema]);

  // 处理点击
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    const eventClick = eventHandlers.onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    eventClick?.(e as React.MouseEvent<HTMLElement>);
    onClick?.(schema.id, e);
  }, [eventHandlers, schema.id, onClick, selectable]);

  // 处理悬停
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setLocalHovered(true);
    onMouseEnter?.(schema.id);
  }, [schema.id, onMouseEnter, selectable]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setLocalHovered(false);
    onMouseLeave?.();
  }, [onMouseLeave, selectable]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!selectable) return;
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(schema.id, e);
  }, [schema.id, onContextMenu, selectable]);

  const handleMoveStart = useCallback((e: React.MouseEvent) => {
    if (!selectable || !isSelected) return;
    e.stopPropagation();
    onMoveStart?.(schema.id, e.clientX, e.clientY);
  }, [schema.id, isSelected, onMoveStart, selectable]);

  const handleResizeStart = useCallback((direction: ResizeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart?.(schema.id, direction, e.clientX, e.clientY, dimensions.width, dimensions.height);
  }, [schema.id, dimensions, onResizeStart]);

  const style = getResolvedInlineStyle(schema) as React.CSSProperties;

  const showHover = selectable && (isHovered || localHovered);

  const borderStyle: React.CSSProperties = {
    outline: selectable && isSelected
      ? '2px solid var(--theme-primary)'
      : showHover
        ? '1px dashed var(--theme-primary)'
        : 'none',
    outlineOffset: selectable && isSelected ? '-2px' : '-1px',
  };

  return (
    <div
      ref={nodeRef}
      style={{ ...style, position: 'relative', cursor: selectable ? (isSelected ? 'move' : onClick ? 'pointer' : 'default') : 'default', ...borderStyle }}
      data-schema-id={schema.id}
      onClick={handleClick}
      onMouseDown={handleMoveStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      {children}

      {selectable && isSelected && (
        <SelectionBox
          x={0}
          y={0}
          width={dimensions.width || 100}
          height={dimensions.height || 50}
          componentId={schema.id}
          onMoveStart={handleMoveStart}
          onResizeStart={handleResizeStart}
        />
      )}
    </div>
  );
};
