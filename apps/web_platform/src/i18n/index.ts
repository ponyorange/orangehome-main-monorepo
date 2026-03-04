import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

// 语言资源
const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

i18n
  // 使用浏览器语言检测
  .use(LanguageDetector)
  // 绑定 react-i18next
  .use(initReactI18next)
  // 初始化配置
  .init({
    resources,
    fallbackLng: 'zh-CN',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React 已经做了 XSS 防护
    },
    
    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存到 localStorage 的 key
      lookupLocalStorage: 'i18nextLng',
      // 缓存语言选择
      caches: ['localStorage'],
    },
  });

export default i18n;
