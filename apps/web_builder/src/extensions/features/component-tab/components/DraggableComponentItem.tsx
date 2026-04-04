import React, { useRef, useCallback } from 'react';
import { OrangeDrag } from '../../../../common/base/OrangeDrag';
import type { ComponentCatalogItem } from '../catalog';
import { useSchemaStore } from '../../../../core/store/schemaStore';
import { useSelectionStore } from '../../../../core/store/selectionStore';
import { useMaterialBundleStore } from '../../../../core/store/materialBundleStore';
import { addChild, findById } from '../../../../common/base/schemaOperator';
import { generateIdWithPrefix } from '../../../../utils/id';
import { withDefaultFloatingLayerStyleForNewNode } from '../../../../common/base/editorLayerStyle';
import { isBuiltInLayoutContainerType } from '../../../../common/base/schemaLayout';
import type { ISchema } from '../../../../types/base';

interface Props {
  item: ComponentCatalogItem;
}

function isDropContainerNode(node: ISchema): boolean {
  if (isBuiltInLayoutContainerType(node.type)) return true;
  const caps = useMaterialBundleStore.getState().editorConfigs[node.type]?.editorCapabilities;
  return caps?.isContainer === true;
}

function findNonOverlappingPosition(containerNode: ISchema): { top: number; left: number } {
  const baseTop = 20;
  const baseLeft = 20;
  const step = 20;
  const children = containerNode.children || [];

  let top = baseTop;
  let left = baseLeft;

  // 检查位置是否被占用（使用 style.top/left）
  const isPositionOccupied = (pt: number, pl: number): boolean => {
    return children.some((child) => {
      const ct = (child.style?.top as number) ?? 0;
      const cl = (child.style?.left as number) ?? 0;
      // 简化检查：如果位置接近则认为被占用
      return Math.abs(ct - pt) < step && Math.abs(cl - pl) < step;
    });
  };

  // 递增查找空位
  while (isPositionOccupied(top, left)) {
    left += step;
    // 限制最大偏移，避免无限循环
    if (left > 200) {
      top += step;
      left = baseLeft;
    }
    if (top > 200) {
      top = baseTop + Math.floor(Math.random() * 50);
      left = baseLeft + Math.floor(Math.random() * 50);
      break;
    }
  }

  return { top, left };
}

export const DraggableComponentItem: React.FC<Props> = ({ item }) => {
  const hasDraggedRef = useRef(false);
  const { schema, setSchema } = useSchemaStore();
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const setSelectedIds = useSelectionStore((s) => s.setSelectedIds);

  // 使用自定义拖拽回调来跟踪拖拽状态
  const dragRefWithCallbacks = useRef(
    new OrangeDrag({
      onDragStart: () => {
        hasDraggedRef.current = true;
      },
    })
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 重置拖拽标志
    hasDraggedRef.current = false;
    // 拖拽开始时阻止文本选择
    e.preventDefault();
    dragRefWithCallbacks.current.start(e.nativeEvent, {
      type: 'add-component',
      componentType: item.type,
      componentName: item.name,
      defaultSchema: item.createSchema(),
    });
  }, [item]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // 如果发生了拖拽，则不处理单击
    if (hasDraggedRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    // 确定目标容器
    let targetId = schema.id; // 默认为根容器
    const firstSelectedId = selectedIds[0];

    if (firstSelectedId) {
      const selectedNode = findById(schema, firstSelectedId);
      if (selectedNode && isDropContainerNode(selectedNode)) {
        targetId = firstSelectedId;
      }
    }

    const targetNode = findById(schema, targetId);
    if (!targetNode) return;

    // 计算非重叠位置
    const position = findNonOverlappingPosition(targetNode);

    // 创建新组件
    const idPrefix = item.type.toLowerCase().replace(/\W/g, '') || 'node';
    const newSchemaBase: ISchema = {
      ...item.createSchema(),
      id: generateIdWithPrefix(idPrefix),
    };
    // 先应用默认浮动样式，然后覆盖top/left
    const withDefaults = withDefaultFloatingLayerStyleForNewNode(newSchemaBase);
    const newSchema: ISchema = {
      ...withDefaults,
      style: {
        ...withDefaults.style,
        top: position.top,
        left: position.left,
      },
    };

    // 添加到目标容器
    const updated = addChild(schema, targetId, newSchema);
    setSchema(updated);

    // 自动选中新组件
    setSelectedIds([newSchema.id]);
  }, [item, schema, setSchema, selectedIds, setSelectedIds]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '14px 8px',
        borderRadius: 20,
        border: '1px solid var(--theme-border-soft)',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.18s ease',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)',
        boxShadow: 'var(--theme-shadow-sm)',
        backdropFilter: 'blur(var(--theme-backdrop-blur))',
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        t.style.background = 'var(--theme-gradient-panel)';
        t.style.borderColor = 'var(--theme-border-glow)';
        t.style.boxShadow = 'var(--theme-shadow-md)';
        t.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)';
        t.style.borderColor = 'var(--theme-border-soft)';
        t.style.boxShadow = 'var(--theme-shadow-sm)';
        t.style.transform = 'translateY(0)';
      }}
    >
      {item.iconUrl ? (
        <img
          src={item.iconUrl}
          alt=""
          draggable={false}
          style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
        />
      ) : (
        <span style={{ fontSize: 22, lineHeight: 1, color: 'var(--theme-primary)' }}>{item.icon || '📦'}</span>
      )}
      <span style={{ fontSize: 12, color: 'var(--theme-text-secondary)', fontWeight: 600 }}>{item.name}</span>
    </div>
  );
};
