import React from 'react';
import { OrangeEditor } from '../core/editor';

/**
 * 测试页面：实例化 OrangeEditor 并挂载
 * 用于验证扩展是否正常加载
 */
export function Demo() {
  try {
    const editor = OrangeEditor.getInstance();
    return editor.mount();
  } catch (err) {
    return (
      <div style={{ padding: 24, color: '#c41', fontFamily: 'monospace' }}>
        <h2>加载错误</h2>
        <pre>{(err as Error).message}</pre>
        <pre>{(err as Error).stack}</pre>
      </div>
    );
  }
}
