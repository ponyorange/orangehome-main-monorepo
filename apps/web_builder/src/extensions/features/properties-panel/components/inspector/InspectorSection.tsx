import React from 'react';
import styles from './inspector.module.css';

export interface InspectorSectionProps {
  title: string;
  titleId?: string;
  children: React.ReactNode;
  className?: string;
}

export const InspectorSection: React.FC<InspectorSectionProps> = ({
  title,
  titleId,
  children,
  className,
}) => (
  <section className={`${styles.section} ${className ?? ''}`.trim()} aria-labelledby={titleId}>
    <h2 className={styles.sectionLabel} id={titleId}>
      {title}
    </h2>
    {children}
  </section>
);
