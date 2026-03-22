import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker?: (_workerId: string, label: string) => Worker;
    };
  }
}

window.MonacoEnvironment = {
  ...(window.MonacoEnvironment ?? {}),
  getWorker(_workerId, label) {
    switch (label) {
      case 'json':
        return new JsonWorker();
      default:
        return new EditorWorker();
    }
  },
};

interface MonacoSchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MonacoSchemaEditor: React.FC<MonacoSchemaEditorProps> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const changeDisposableRef = useRef<monaco.IDisposable | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language: 'json',
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: 'on',
      fontSize: 12,
    });

    changeDisposableRef.current = editor.onDidChangeModelContent(() => {
      onChangeRef.current(editor.getValue());
    });

    editorRef.current = editor;

    return () => {
      changeDisposableRef.current?.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.getValue() !== value) {
      editor.setValue(value);
    }
  }, [value]);

  return <div ref={containerRef} style={{ height: 420, border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden' }} />;
};
