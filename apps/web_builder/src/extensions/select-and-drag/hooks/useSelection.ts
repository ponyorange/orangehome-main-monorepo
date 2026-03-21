import { useState, useEffect, useCallback, useRef } from 'react';
import { HoverSelectService } from '../services/HoverSelectService';
import { useSelectionStore } from '../../../core/store/selectionStore';

/**
 * 选择状态 Hook
 * 封装 HoverSelectService 的状态和事件处理
 */
export function useSelection(service: HoverSelectService | null) {
  // 当前悬停的 ID
  const [hoverId, setHoverId] = useState<string | null>(null);
  
  // 当前选中的 ID 列表
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // 避免重复渲染的引用
  const serviceRef = useRef(service);
  serviceRef.current = service;
  
  // 监听悬停变化
  useEffect(() => {
    if (!service) return;
    
    const handleHoverChange = (event: { prevId: string | null; currentId: string | null }) => {
      setHoverId(event.currentId);
    };
    
    service.onHoverChange(handleHoverChange);
    
    // 初始化状态
    setHoverId(service.getHoverId());
    
    return () => {
      service.off('hover.change', handleHoverChange);
    };
  }, [service]);
  
  // 监听选中变化
  useEffect(() => {
    if (!service) return;
    
    const handleSelectChange = (event: { 
      prevIds: string[]; 
      currentIds: string[];
    }) => {
      setSelectedIds(event.currentIds);
    };
    
    service.onSelectChange(handleSelectChange);
    
    // 初始化状态
    setSelectedIds(service.getSelectedIds());
    
    return () => {
      service.off('select.change', handleSelectChange);
    };
  }, [service]);
  
  /**
   * 处理点击事件
   * @param id 组件 ID
   * @param event 鼠标事件
   */
  const handleClick = useCallback((id: string, event: React.MouseEvent) => {
    if (!serviceRef.current) return;
    
    // Ctrl/Cmd + 点击 = 多选
    const isMulti = event.ctrlKey || event.metaKey;
    serviceRef.current.select(id, isMulti);
  }, []);
  
  /**
   * 处理悬停事件
   */
  const handleMouseEnter = useCallback((id: string) => {
    if (!serviceRef.current) return;
    serviceRef.current.hover(id);
  }, []);
  
  /**
   * 处理离开事件
   */
  const handleMouseLeave = useCallback(() => {
    if (!serviceRef.current) return;
    serviceRef.current.clearHover();
  }, []);
  
  /**
   * 清除所有选中
   */
  const clearSelection = useCallback(() => {
    if (!serviceRef.current) return;
    serviceRef.current.clear();
  }, []);
  
  /**
   * 检查组件是否被选中
   */
  const isSelected = useCallback((id: string) => {
    return serviceRef.current?.isSelected(id) ?? false;
  }, []);
  
  /**
   * 检查组件是否被悬停
   */
  const isHovered = useCallback((id: string) => {
    return serviceRef.current?.isHovered(id) ?? false;
  }, []);
  
  return {
    hoverId,
    selectedIds,
    isSelected,
    isHovered,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    clearSelection,
  };
}

/**
 * 简化版选择 Hook（不需要 service 实例时使用）
 * 用于组件内部管理选择状态
 */
export function useSimpleSelection() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const selectedIds = useSelectionStore((state) => state.selectedIds);
  const setSelectedIds = useSelectionStore((state) => state.setSelectedIds);
  const clearSelectedIds = useSelectionStore((state) => state.clearSelectedIds);
  
  const handleClick = useCallback((id: string, event: React.MouseEvent) => {
    const isMulti = event.ctrlKey || event.metaKey;
    
    if (!isMulti) {
      setSelectedIds([id]);
    } else {
      setSelectedIds(
        selectedIds.includes(id)
          ? selectedIds.filter((currentId) => currentId !== id)
          : [...selectedIds, id]
      );
    }
  }, [selectedIds, setSelectedIds]);
  
  const handleMouseEnter = useCallback((id: string) => {
    setHoverId(id);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setHoverId(null);
  }, []);
  
  const clearSelection = useCallback(() => {
    clearSelectedIds();
  }, [clearSelectedIds]);
  
  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);
  
  const isHovered = useCallback((id: string) => {
    return hoverId === id;
  }, [hoverId]);
  
  return {
    hoverId,
    selectedIds,
    isSelected,
    isHovered,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    clearSelection,
  };
}
