import React, { createContext, useContext } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { EditorCoreState } from '../types/store';

const EditorStoreContext = createContext<UseBoundStore<StoreApi<EditorCoreState>> | null>(null);

export function EditorStoreProvider({
  store,
  children,
}: {
  store: UseBoundStore<StoreApi<EditorCoreState>>;
  children: React.ReactNode;
}) {
  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  );
}

export function useEditorStore(): UseBoundStore<StoreApi<EditorCoreState>> {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error('useEditorStore must be used within EditorStoreProvider');
  }
  return store;
}
