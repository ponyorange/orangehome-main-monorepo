import React from 'react';
import styles from './inspector.module.css';

export const InspectorFormGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`${styles.formGrid} ${className ?? ''}`.trim()}>{children}</div>;

export interface InspectorFormRowProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

/** 双列表单项：标签列 + 控件列（与参考稿 form-grid 一致） */
export const InspectorFormRow: React.FC<InspectorFormRowProps> = ({ label, htmlFor, children }) => (
  <>
    <label className={styles.fieldLabel} htmlFor={htmlFor}>
      {label}
    </label>
    <div className={styles.fieldControl}>{children}</div>
  </>
);

/** 占满两列（内嵌子栅格等） */
export const InspectorFormRowFull: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.formRowFull}>{children}</div>
);
