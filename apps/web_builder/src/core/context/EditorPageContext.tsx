import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getPageIdFromLocation } from '../../utils/pageRoute';

const EditorPageContext = createContext<string | null>(null);

export function EditorPageProvider({
  pageIdFromInit,
  children,
}: {
  /** builder/init 成功后的页面 id，用于兜底 URL 未带参等情况 */
  pageIdFromInit?: string | null;
  children: React.ReactNode;
}) {
  const [pageId, setPageId] = useState<string | null>(() => getPageIdFromLocation());

  useEffect(() => {
    const sync = () => setPageId(getPageIdFromLocation());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  useEffect(() => {
    if (pageIdFromInit?.trim()) {
      setPageId((prev) => prev ?? pageIdFromInit.trim());
    }
  }, [pageIdFromInit]);

  const value = useMemo(() => pageId?.trim() || null, [pageId]);

  return <EditorPageContext.Provider value={value}>{children}</EditorPageContext.Provider>;
}

export function useEditorPageId(): string | null {
  return useContext(EditorPageContext);
}
