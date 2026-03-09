import React, { createContext, useContext } from 'react';

export interface EditorSelectContextValue {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

const EditorSelectContext = createContext<EditorSelectContextValue | null>(null);

export function EditorSelectProvider({
  value,
  children,
}: {
  value: EditorSelectContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorSelectContext.Provider value={value}>
      {children}
    </EditorSelectContext.Provider>
  );
}

export function useEditorSelect(): EditorSelectContextValue | null {
  return useContext(EditorSelectContext);
}
