import 'reflect-metadata';
import { Container, injectable } from 'inversify';
import {
  RuntimeContextService,
  createRuntimeContextService,
} from '../../services/RuntimeContextService';
import { createStore } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import {
  bindContributionProvider,
  type IContributionProvider,
} from '../../container';
import type {
  EditorCoreState,
  LayoutState,
  CanvasState,
  ConfigState,
  EditorUIState,
} from '../../types/store';

/** Store 服务标识 */
export const StoreService = Symbol('StoreService');

/** Store 贡献接口：允许扩展贡献状态片段 */
export interface IStoreContribution {
  getInitialState?(): Partial<EditorCoreState>;
}

export const StoreContribution = Symbol('StoreContribution');

export interface IStoreService {
  getStore(): UseBoundStore<StoreApi<EditorCoreState>>;
  dispatch: StoreApi<EditorCoreState>['setState'];
}

const createInitialState = (): EditorCoreState => ({
  selectedNodeId: null,
  schema: null,
  pageName: '',
  pageId: '',
  history: [],
  historyIndex: -1,
  layouts: {} as LayoutState,
  canvas: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    backgroundColor: '#f5f5f5',
    width: 0,
    height: 0,
  },
  config: {
    readOnly: false,
    gridSize: 8,
    showGrid: true,
  },
  editor: {
    selectedNodeId: null,
    hoveredNodeId: null,
  },
});

function createEditorStore(
  contributionProvider?: IContributionProvider<IStoreContribution>
): UseBoundStore<StoreApi<EditorCoreState>> {
  let initialState = createInitialState();
  if (contributionProvider) {
    for (const contrib of contributionProvider.getContributions()) {
      if (contrib.getInitialState) {
        const partial = contrib.getInitialState();
        initialState = { ...initialState, ...partial };
      }
    }
  }
  return createStore<EditorCoreState>(() => initialState);
}

@injectable()
export class StoreServiceImpl implements IStoreService {
  private _store!: UseBoundStore<StoreApi<EditorCoreState>>;

  initialize(
    contributionProvider?: IContributionProvider<IStoreContribution>
  ): void {
    this._store = createEditorStore(contributionProvider);
  }

  getStore(): UseBoundStore<StoreApi<EditorCoreState>> {
    return this._store;
  }

  get dispatch(): StoreApi<EditorCoreState>['setState'] {
    return this._store.setState.bind(this._store);
  }
}

/** Store 扩展模块 */
export function createStoreModule(container: Container): void {
  bindContributionProvider(container, StoreContribution);
  container
    .bind(StoreService)
    .toDynamicValue((ctx) => {
      const service = new StoreServiceImpl();
      let provider: IContributionProvider<IStoreContribution> | undefined;
      try {
        const providerId = Symbol.for(
          `ContributionProvider:${String(StoreContribution)}`
        );
        if (ctx.container.isBound(providerId)) {
          provider = ctx.container.get(providerId);
        }
      } catch {
        // ignore
      }
      service.initialize(provider);
      return service;
    })
    .inSingletonScope();

  container
    .bind(RuntimeContextService)
    .toDynamicValue((ctx) => {
      const storeService = ctx.container.get<IStoreService>(StoreService);
      return createRuntimeContextService(storeService.getStore());
    })
    .inSingletonScope();
}

/** Store 扩展 */
export const storeExtension = {
  id: 'store',
  init(container: Container): void {
    console.log('[storeExtension] init');
    createStoreModule(container);
  },
};
