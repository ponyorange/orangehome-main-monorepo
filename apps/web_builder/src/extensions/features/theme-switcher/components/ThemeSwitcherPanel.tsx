import React from 'react';
import { ThemeSwitcher } from '../../../../core/theme';

export const ThemeSwitcherPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <ThemeSwitcher />
    </div>
  );
};
