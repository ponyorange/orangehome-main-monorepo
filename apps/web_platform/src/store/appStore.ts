import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'semi-dark';
export type Language = 'zh-CN' | 'en-US';

interface AppState {
  // 主题
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // 语言
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  
  // 侧边栏状态
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // 用户信息（仅存储基础信息）
  userInfo: {
    id?: string;
    username?: string;
    avatar?: string;
  } | null;
  setUserInfo: (info: AppState['userInfo']) => void;
  clearUserInfo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 主题
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const themes: Theme[] = ['light', 'dark', 'semi-dark'];
        const currentIndex = themes.indexOf(get().theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        set({ theme: nextTheme });
      },
      
      // 语言
      language: 'zh-CN',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => {
        const newLang = get().language === 'zh-CN' ? 'en-US' : 'zh-CN';
        set({ language: newLang });
      },
      
      // 侧边栏
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      // 用户信息
      userInfo: null,
      setUserInfo: (userInfo) => set({ userInfo }),
      clearUserInfo: () => set({ userInfo: null }),
    }),
    {
      name: 'orangehome-app-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
