/**
 * SelectAndDrag 扩展：选中/悬停 + 画布拖拽与移动（参考文档 4.2、4.3 节）
 */
import 'reflect-metadata';
import { Container, injectable } from 'inversify';
import EventEmitter2 from 'eventemitter2';
import { StoreService } from '../store';
import {
  HoverSelectService,
  HoverSelectServiceImpl,
  type IHoverSelectService,
} from './HoverSelectService';
import { OrangeDrag } from '../../common/base/OrangeDrag';

export const SelectAndDragEvents = {
  Select: 'Select',
  Hover: 'Hover',
} as const;

/** 全局事件总线，供画布/组件面板发送 Select、Hover */
let _eventBus: EventEmitter2 | null = null;

export function getSelectAndDragEventBus(): EventEmitter2 {
  if (!_eventBus) _eventBus = new EventEmitter2();
  return _eventBus;
}

export function setSelectAndDragEventBus(bus: EventEmitter2 | null): void {
  _eventBus = bus;
}

@injectable()
export class SelectAndDragServiceImpl {
  constructor(
    private _hoverSelect: IHoverSelectService,
    private _bus: EventEmitter2
  ) {}

  getHoverSelect(): IHoverSelectService {
    return this._hoverSelect;
  }

  getEventBus(): EventEmitter2 {
    return this._bus;
  }

  /** 供画布/组件面板调用：发送选中 */
  emitSelect(nodeId: string | null): void {
    this._hoverSelect.select(nodeId);
    this._bus.emit(SelectAndDragEvents.Select, nodeId);
  }

  /** 供画布/组件面板调用：发送悬停 */
  emitHover(nodeId: string | null): void {
    this._hoverSelect.hover(nodeId);
    this._bus.emit(SelectAndDragEvents.Hover, nodeId);
  }
}

export const SelectAndDragService = Symbol('SelectAndDragService');

export const selectAndDragExtension = {
  id: 'select-and-drag',
  init(container: Container): void {
    const store = container.get(StoreService).getStore();
    const hoverSelect = new HoverSelectServiceImpl(store);
    container.bind(HoverSelectService).toConstantValue(hoverSelect);
    const bus = getSelectAndDragEventBus();
    container
      .bind(SelectAndDragService)
      .toDynamicValue(() => new SelectAndDragServiceImpl(hoverSelect, bus))
      .inSingletonScope();
  },
};

export { OrangeDrag };
