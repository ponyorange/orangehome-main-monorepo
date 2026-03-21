import { injectable } from 'inversify';
import { EventEmitter2 } from 'eventemitter2';

/**
 * 悬停与选择服务
 * 管理组件的 hover 和 select 状态
 */
@injectable()
export class HoverSelectService {
  private eventEmitter = new EventEmitter2();
  
  // 当前悬停的组件 ID
  private hoverId: string | null = null;
  
  // 当前选中的组件 ID 集合（支持多选）
  private selectedIds: Set<string> = new Set();
  
  /**
   * 获取当前悬停的组件 ID
   */
  getHoverId(): string | null {
    return this.hoverId;
  }
  
  /**
   * 获取当前选中的组件 ID 列表
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }
  
  /**
   * 检查组件是否被选中
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }
  
  /**
   * 检查组件是否被悬停
   */
  isHovered(id: string): boolean {
    return this.hoverId === id;
  }
  
  /**
   * 设置悬停组件
   */
  hover(id: string | null): void {
    if (this.hoverId === id) return;
    
    const prevHoverId = this.hoverId;
    this.hoverId = id;
    
    // 触发悬停变化事件
    this.eventEmitter.emit('hover.change', {
      prevId: prevHoverId,
      currentId: id,
    });
    
    // 触发单个组件悬停事件
    if (prevHoverId) {
      this.eventEmitter.emit(`hover.leave`, { id: prevHoverId });
    }
    if (id) {
      this.eventEmitter.emit(`hover.enter`, { id });
    }
  }
  
  /**
   * 选中组件
   * @param id 组件 ID
   * @param multi 是否多选（Ctrl+点击）
   */
  select(id: string, multi: boolean = false): void {
    if (!multi) {
      // 单选：清除其他选中
      const prevIds = this.getSelectedIds();
      this.selectedIds.clear();
      this.selectedIds.add(id);
      
      this.eventEmitter.emit('select.change', {
        prevIds,
        currentIds: [id],
        added: [id],
        removed: prevIds.filter(prevId => prevId !== id),
      });
    } else {
      // 多选：切换选中状态
      const prevIds = this.getSelectedIds();
      
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
        this.eventEmitter.emit('select.change', {
          prevIds,
          currentIds: this.getSelectedIds(),
          added: [],
          removed: [id],
        });
      } else {
        this.selectedIds.add(id);
        this.eventEmitter.emit('select.change', {
          prevIds,
          currentIds: this.getSelectedIds(),
          added: [id],
          removed: [],
        });
      }
    }
    
    // 触发单个组件选中事件
    this.eventEmitter.emit(`select.${this.selectedIds.has(id) ? 'add' : 'remove'}`, { id });
  }
  
  /**
   * 清除所有选中
   */
  clear(): void {
    const prevIds = this.getSelectedIds();
    if (prevIds.length === 0) return;
    
    this.selectedIds.clear();
    
    this.eventEmitter.emit('select.change', {
      prevIds,
      currentIds: [],
      added: [],
      removed: prevIds,
    });
    
    this.eventEmitter.emit('select.clear', {});
  }
  
  /**
   * 清除悬停
   */
  clearHover(): void {
    this.hover(null);
  }
  
  /**
   * 监听悬停变化
   */
  onHoverChange(callback: (event: { prevId: string | null; currentId: string | null }) => void): void {
    this.eventEmitter.on('hover.change', callback);
  }
  
  /**
   * 监听选中变化
   */
  onSelectChange(callback: (event: { 
    prevIds: string[]; 
    currentIds: string[]; 
    added: string[]; 
    removed: string[];
  }) => void): void {
    this.eventEmitter.on('select.change', callback);
  }
  
  /**
   * 监听组件进入悬停
   */
  onHoverEnter(callback: (event: { id: string }) => void): void {
    this.eventEmitter.on('hover.enter', callback);
  }
  
  /**
   * 监听组件离开悬停
   */
  onHoverLeave(callback: (event: { id: string }) => void): void {
    this.eventEmitter.on('hover.leave', callback);
  }
  
  /**
   * 取消监听
   */
  off(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }
  
  /**
   * 销毁服务
   */
  destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.selectedIds.clear();
    this.hoverId = null;
  }
}
