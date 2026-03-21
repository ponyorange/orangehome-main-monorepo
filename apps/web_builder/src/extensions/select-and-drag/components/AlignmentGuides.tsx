import React from 'react';
import type { AlignLine } from '../services/AlignmentService';

interface AlignmentGuidesProps {
  lines: AlignLine[];
  canvasWidth: number;
  canvasHeight: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ lines, canvasWidth, canvasHeight }) => {
  if (lines.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      {lines.map((line, i) => {
        if (line.type === 'horizontal') {
          return (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                top: line.position,
                left: 0,
                width: canvasWidth,
                height: 0,
                borderTop: '1px dashed var(--theme-primary, #e07a3f)',
                opacity: 0.95,
                filter: 'drop-shadow(0 0 8px var(--theme-primary-light))',
              }}
            />
          );
        }
        return (
          <div
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: line.position,
              top: 0,
              height: canvasHeight,
              width: 0,
              borderLeft: '1px dashed var(--theme-primary, #e07a3f)',
              opacity: 0.95,
              filter: 'drop-shadow(0 0 8px var(--theme-primary-light))',
            }}
          />
        );
      })}
    </div>
  );
};
