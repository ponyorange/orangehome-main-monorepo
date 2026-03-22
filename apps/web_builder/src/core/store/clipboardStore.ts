import { create } from 'zustand';
import type { ISchema } from '../../types/base';
import { generateIdWithPrefix } from '../../utils/id';

function cloneWithNewIds(node: ISchema): ISchema {
  return {
    ...node,
    id: generateIdWithPrefix(node.type.toLowerCase()),
    props: { ...node.props },
    style: node.style ? { ...node.style } : undefined,
    propStyle: node.propStyle ? { ...node.propStyle } : undefined,
    event2action: node.event2action ? [...node.event2action] : undefined,
    api: node.api ? { ...node.api } : undefined,
    children: node.children.map(cloneWithNewIds),
  };
}

interface ClipboardState {
  copiedNodes: ISchema[];
  copy: (nodes: ISchema[]) => void;
  paste: () => ISchema[];
  clear: () => void;
  hasCopied: () => boolean;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  copiedNodes: [],
  copy: (nodes) => set({ copiedNodes: nodes.map((n) => JSON.parse(JSON.stringify(n))) }),
  paste: () => get().copiedNodes.map(cloneWithNewIds),
  clear: () => set({ copiedNodes: [] }),
  hasCopied: () => get().copiedNodes.length > 0,
}));
