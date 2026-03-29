import React from 'react';
import styles from './inspector.module.css';

export interface InspectorShellProps {
  title: string;
  subtitle: string;
  /** 顶部分段；为 null 时不渲染（空态） */
  segmented: React.ReactNode | null;
  children: React.ReactNode;
  /** 供 aside 使用 */
  'aria-label'?: string;
}

export const InspectorShell: React.FC<InspectorShellProps> = ({
  title,
  subtitle,
  segmented,
  children,
  'aria-label': ariaLabel = '组件配置',
}) => (
  <aside className={styles.shell} aria-label={ariaLabel}>
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
    {segmented}
    <div className={styles.body}>{children}</div>
  </aside>
);
