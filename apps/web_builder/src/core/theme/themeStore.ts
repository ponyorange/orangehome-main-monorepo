import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, getThemeById, DEFAULT_THEME_ID } from './theme-config';

interface ThemeState {
  /** 当前主题ID */
  currentThemeId: string;
  /** 当前主题配置 */
  currentTheme: Theme;
  /** 设置主题 */
  setTheme: (themeId: string) => void;
  /** 获取当前主题颜色 */
  getColors: () => Theme['colors'];
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: DEFAULT_THEME_ID,
      currentTheme: getThemeById(DEFAULT_THEME_ID),

      setTheme: (themeId: string) => {
        const theme = getThemeById(themeId);
        set({
          currentThemeId: themeId,
          currentTheme: theme,
        });
        // 应用CSS变量到document
        applyThemeToCSS(theme);
        // 触发自定义事件通知组件主题已变化
        window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
      },

      getColors: () => get().currentTheme.colors,
    }),
    {
      name: 'orange-editor-theme',
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
      onRehydrateStorage: () => (state) => {
        // 持久化恢复后应用主题
        if (state) {
          const theme = getThemeById(state.currentThemeId);
          applyThemeToCSS(theme);
        }
      },
    }
  )
);

/**
 * 将主题应用到CSS变量
 */
function applyThemeToCSS(theme: Theme) {
  const { colors } = theme;
  const root = document.documentElement;

  // 设置CSS变量
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-hover', colors.primaryHover);
  root.style.setProperty('--theme-primary-active', colors.primaryActive);
  root.style.setProperty('--theme-primary-light', colors.primaryLight);
  root.style.setProperty('--theme-primary-light-bg', colors.primaryLightBg);
  root.style.setProperty('--theme-primary-text', colors.primaryText);

  root.style.setProperty('--theme-text-secondary', colors.textSecondary);
  root.style.setProperty('--theme-text-primary', colors.textPrimary);
  root.style.setProperty('--theme-text-disabled', colors.textDisabled);

  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-background-card', colors.backgroundCard);
  root.style.setProperty('--theme-background-hover', colors.backgroundHover);

  root.style.setProperty('--theme-border', colors.border);
  root.style.setProperty('--theme-divider', colors.divider);

  root.style.setProperty('--theme-success', colors.success);
  root.style.setProperty('--theme-warning', colors.warning);
  root.style.setProperty('--theme-error', colors.error);
  root.style.setProperty('--theme-info', colors.info);

  // 同时更新Semi Design的CSS变量
  root.style.setProperty('--semi-color-primary', colors.primary);
  root.style.setProperty('--semi-color-primary-hover', colors.primaryHover);
  root.style.setProperty('--semi-color-primary-active', colors.primaryActive);
  root.style.setProperty('--semi-color-primary-light', colors.primaryLight);
  root.style.setProperty('--semi-color-link', colors.primary);
  root.style.setProperty('--semi-color-link-hover', colors.primaryHover);
  root.style.setProperty('--semi-color-info', colors.info);
}

/**
 * 初始化主题
 * 在应用启动时调用
 */
export function initTheme() {
  const store = useThemeStore.getState();
  applyThemeToCSS(store.currentTheme);
}
