import React, { useMemo } from 'react';
import type { IEvent2Action, ISchema } from '../../../../types/base';

function runAction(schema: ISchema, action: IEvent2Action): void {
  switch (action.action) {
    case 'navigate':
      if (typeof action.params?.url === 'string') {
        window.open(action.params.url, typeof action.params?.target === 'string' ? action.params.target : '_self');
      }
      return;
    case 'alert':
      window.alert(typeof action.params?.message === 'string' ? action.params.message : `${schema.name} 被点击`);
      return;
    case 'log':
      console.log('[SchemaEvent]', schema.id, action.params ?? {});
      return;
    case 'copyText':
      if (typeof action.params?.text === 'string') {
        void navigator.clipboard.writeText(action.params.text);
      }
      return;
    case 'dispatch':
      if (typeof action.params?.name === 'string') {
        window.dispatchEvent(
          new CustomEvent(action.params.name, {
            detail: action.params?.detail,
          })
        );
      }
      return;
    default:
      console.warn(`未支持的事件动作: ${action.action}`);
  }
}

export function useSchemaEventHandlers(
  schema: ISchema
): Record<string, (event: React.SyntheticEvent<HTMLElement>) => void> {
  return useMemo(() => {
    const handlers: Record<string, (event: React.SyntheticEvent<HTMLElement>) => void> = {};

    for (const binding of schema.event2action ?? []) {
      if (!binding.event) continue;

      handlers[binding.event] = () => {
        runAction(schema, binding);
      };
    }

    return handlers;
  }, [schema]);
}
