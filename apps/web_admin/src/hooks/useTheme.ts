import { useEffect } from 'react';
import { useAppStore, type Theme } from '@/store/appStore';

const themeConfig: Record<Theme, string> = {
  light: 'light',
  dark: 'dark',
  'semi-dark': 'light',
};

export function useTheme() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const semiTheme = themeConfig[theme];
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${semiTheme}`);
  }, [theme]);

  return { theme };
}
