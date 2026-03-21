import { injectable } from 'inversify';
import type { IEditorOptions, ISchema } from '../../types/base/index';

/**
 * 编辑器服务
 * 管理编辑器实例的生命周期和核心操作
 */
@injectable()
export class EditorService {
  private schema: ISchema | null = null;
  private options: IEditorOptions = {};
  private isReady = false;

  constructor() {
    console.log('EditorService initialized');
  }

  /**
   * 初始化编辑器
   */
  initialize(options: IEditorOptions): void {
    this.options = options;
    this.isReady = true;
    console.log('Editor initialized with options:', options);
  }

  /**
   * 加载 Schema
   */
  loadSchema(schema: ISchema): void {
    this.schema = schema;
    console.log('Schema loaded:', schema.id);
  }

  /**
   * 获取当前 Schema
   */
  getSchema(): ISchema | null {
    return this.schema;
  }

  /**
   * 检查编辑器是否就绪
   */
  get ready(): boolean {
    return this.isReady;
  }

  /**
   * 获取编辑器配置
   */
  getOptions(): IEditorOptions {
    return this.options;
  }
}
