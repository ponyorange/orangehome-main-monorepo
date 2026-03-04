import { useEffect } from 'react';
import { useAppStore, type Theme } from '@/store/appStore';

// 主题对应的 Semi Design 配置
const themeConfig: Record<Theme, { className: string; semiTheme: string }> = {
  light: {
    className: 'theme-light',
    semiTheme: 'light',
  },
  dark: {
    className: 'theme-dark',
    semiTheme: 'dark',
  },
  'semi-dark': {
    className: 'theme-semi-dark',
    semiTheme: 'light', // Semi UI 的半深色通常基于 light 主题配合自定义样式
  },
};

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useAppStore();

  useEffect(() => {
    const config = themeConfig[theme];
    const html = document.documentElement;
    
    // 移除旧主题类
    Object.values(themeConfig).forEach(({ className }) => {
      html.classList.remove(className);
    });
    
    // 添加新主题类
    html.classList.add(config.className);
    
    // 设置 data-theme 属性（供 CSS 变量使用）
    html.setAttribute('data-theme', theme);
    
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    themeConfig: themeConfig[theme],
  };
}
