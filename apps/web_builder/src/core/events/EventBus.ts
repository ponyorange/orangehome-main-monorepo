import { injectable } from 'inversify';
import { EventEmitter2 } from 'eventemitter2';

/**
 * 事件总线
 * 基于 EventEmitter2 的发布订阅模式，支持通配符
 */
@injectable()
export class EventBus {
  private emitter: EventEmitter2;

  constructor() {
    this.emitter = new EventEmitter2({
      wildcard: true,
      maxListeners: 100,
      delimiter: ':',
    });
  }

  /**
   * 订阅事件
   */
  on(event: string, handler: (...args: any[]) => void): void {
    this.emitter.on(event, handler);
  }

  /**
   * 取消订阅事件
   */
  off(event: string, handler: (...args: any[]) => void): void {
    this.emitter.off(event, handler);
  }

  /**
   * 一次性订阅事件
   */
  once(event: string, handler: (...args: any[]) => void): void {
    this.emitter.once(event, handler);
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.emitter.removeAllListeners();
  }
}
