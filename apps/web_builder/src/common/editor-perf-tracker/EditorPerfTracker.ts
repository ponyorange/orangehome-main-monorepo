/**
 * 编辑器性能追踪器
 * 占位实现，后续可集成 Tea/Slardar 等监控
 */
export class EditorPerfTracker {
  /**
   * 追踪首次渲染耗时
   */
  trackFirstRender(): void {
    // 占位实现
  }

  /**
   * 追踪操作耗时
   * @param name - 操作名称
   * @param duration - 耗时（毫秒）
   */
  trackOperation(name: string, duration?: number): void {
    // 占位实现
  }

  /**
   * 开始计时
   * @param name - 计时器名称
   * @returns 返回用于结束计时的函数
   */
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      this.trackOperation(name, performance.now() - start);
    };
  }
}
