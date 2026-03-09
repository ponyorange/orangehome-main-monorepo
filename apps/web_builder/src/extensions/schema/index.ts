import 'reflect-metadata';
import { Container, injectable } from 'inversify';
import EventEmitter2 from 'eventemitter2';
import { bindContributionProvider } from '../../container';
import {
  updateNodePropsById,
  readNodeById,
  deleteNodeById,
  addChildNode,
} from '../../common/base/schemaOperator';
import type { ISchema } from '../../types/base';
import { StoreService } from '../store';

/** Schema 服务标识 */
export const SchemaService = Symbol('SchemaService');

/** Schema 贡献接口：允许扩展监听 schema 变化 */
export interface ISchemaContribution {
  onSchemaChange?(schema: ISchema | null): void;
}

export const SchemaContribution = Symbol('SchemaContribution');

export interface ISchemaService {
  getSchema(): ISchema | null;
  setSchema(schema: ISchema | null): void;
  updateNode(id: string, props: Partial<Record<string, unknown>>): void;
  getNode(id: string): ISchema | null;
  removeNode(id: string): void;
  addNode(parentId: string, node: ISchema, index?: number): void;
}

@injectable()
export class SchemaServiceImpl implements ISchemaService {
  private _storeService!: { getStore: () => { getState: () => { schema: ISchema | null }; setState: (fn: (s: { schema: ISchema | null }) => void) => void } };
  private _eventBus = new EventEmitter2();

  constructor() {
    // StoreService 在 store 扩展加载后可用，延迟解析
  }

  private _getStoreService(): typeof this._storeService {
    return this._storeService;
  }

  setStoreService(storeService: { getStore: () => { getState: () => { schema: ISchema | null }; setState: (fn: (s: { schema: ISchema | null }) => void) => void } }): void {
    this._storeService = storeService;
  }

  getSchema(): ISchema | null {
    return this._getStoreService().getStore().getState().schema;
  }

  setSchema(schema: ISchema | null): void {
    this._getStoreService().getStore().setState({ schema });
    this._emitSchemaChange(schema);
  }

  private _emitSchemaChange(schema: ISchema | null): void {
    this._eventBus.emit('schema:change', schema);
  }

  updateNode(id: string, props: Partial<Record<string, unknown>>): void {
    const store = this._getStoreService().getStore();
    const current = store.getState().schema;
    const next = updateNodePropsById(current, id, props);
    if (next !== null) {
      store.setState({ schema: next });
      this._emitSchemaChange(next);
    }
  }

  getNode(id: string): ISchema | null {
    return readNodeById(this.getSchema(), id);
  }

  removeNode(id: string): void {
    const store = this._getStoreService().getStore();
    const current = store.getState().schema;
    const next = deleteNodeById(current, id);
    store.setState({ schema: next });
    this._emitSchemaChange(next);
  }

  addNode(parentId: string, node: ISchema, index?: number): void {
    const store = this._getStoreService().getStore();
    const current = store.getState().schema;
    const next = addChildNode(current, parentId, node, index);
    if (next !== null) {
      store.setState({ schema: next });
      this._emitSchemaChange(next);
    }
  }

  onSchemaChange(cb: (schema: ISchema | null) => void): () => void {
    this._eventBus.on('schema:change', cb);
    return () => this._eventBus.off('schema:change', cb);
  }
}

/** Schema 扩展 */
export const schemaExtension = {
  id: 'schema',
  init(container: Container): void {
    console.log('[schemaExtension] init');
    bindContributionProvider(container, SchemaContribution);
    container
      .bind(SchemaService)
      .toDynamicValue((ctx) => {
        const schemaService = new SchemaServiceImpl();
        const storeService = ctx.container.get(StoreService);
        schemaService.setStoreService(storeService);
        return schemaService;
      })
      .inSingletonScope();
  },
};
