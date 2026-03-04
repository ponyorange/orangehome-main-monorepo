import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import type { Locale } from '@douyinfe/semi-ui/lib/es/locale';

// 动态导入 Semi UI 语言包
const loadSemiLocale = async (lang: string): Promise<Locale> => {
  switch (lang) {
    case 'en-US':
      return (await import('@douyinfe/semi-ui/lib/es/locale/source/en_US')).default;
    case 'zh-CN':
    default:
      return (await import('@douyinfe/semi-ui/lib/es/locale/source/zh_CN')).default;
  }
};

export function useLanguage() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  
  const changeLanguage = async (lang: 'zh-CN' | 'en-US') => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  useEffect(() => {
    // 同步 i18n 和 store 的语言设置
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return {
    language,
    setLanguage: changeLanguage,
    t: i18n.t,
    i18n,
    loadSemiLocale,
  };
}
