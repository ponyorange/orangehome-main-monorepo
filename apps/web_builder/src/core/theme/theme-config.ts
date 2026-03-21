/**
 * 主题配置系统
 * 定义5个内置主题的配色方案
 */

export interface ThemeColors {
  /** 主色调 - 用于按钮、选中态、强调色 */
  primary: string;
  /** 主色调悬停态 */
  primaryHover: string;
  /** 主色调激活态 */
  primaryActive: string;
  /** 浅色主色调 - 用于背景、边框 */
  primaryLight: string;
  /** 主色调透明白色背景 */
  primaryLightBg: string;
  /** 主色调文字 */
  primaryText: string;

  /** 次要文字颜色 - 灰色系 */
  textSecondary: string;
  /** 主要文字颜色 */
  textPrimary: string;
  /** 禁用文字颜色 */
  textDisabled: string;

  /** 背景色 */
  background: string;
  /** 卡片背景色 */
  backgroundCard: string;
  /** 悬浮背景色 */
  backgroundHover: string;

  /** 边框颜色 */
  border: string;
  /** 分割线颜色 */
  divider: string;

  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

/** 内置主题配置 */
export const builtInThemes: Theme[] = [
  // 1. 温暖橙 - 默认主题，温和亲切
  {
    id: 'warm-orange',
    name: '温暖橙',
    description: '温和亲切的橙色调',
    colors: {
      primary: '#e07a3f',
      primaryHover: '#f08b52',
      primaryActive: '#c96a35',
      primaryLight: 'rgba(224, 122, 63, 0.15)',
      primaryLightBg: 'rgba(224, 122, 63, 0.08)',
      primaryText: '#e07a3f',

      textSecondary: '#666666',
      textPrimary: '#333333',
      textDisabled: '#999999',

      background: '#fafafa',
      backgroundCard: '#ffffff',
      backgroundHover: '#f5f5f5',

      border: '#e0e0e0',
      divider: '#e8e8e8',

      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#e07a3f',
    },
  },

  // 2. 清新绿 - 自然清爽
  {
    id: 'fresh-green',
    name: '清新绿',
    description: '自然清爽的绿色调',
    colors: {
      primary: '#4caf50',
      primaryHover: '#66bb6a',
      primaryActive: '#43a047',
      primaryLight: 'rgba(76, 175, 80, 0.15)',
      primaryLightBg: 'rgba(76, 175, 80, 0.08)',
      primaryText: '#4caf50',

      textSecondary: '#666666',
      textPrimary: '#333333',
      textDisabled: '#999999',

      background: '#fafafa',
      backgroundCard: '#ffffff',
      backgroundHover: '#f5f5f5',

      border: '#e0e0e0',
      divider: '#e8e8e8',

      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#4caf50',
    },
  },

  // 3. 深邃蓝 - 专业沉稳
  {
    id: 'deep-blue',
    name: '深邃蓝',
    description: '专业沉稳的蓝色调',
    colors: {
      primary: '#2196f3',
      primaryHover: '#42a5f5',
      primaryActive: '#1e88e5',
      primaryLight: 'rgba(33, 150, 243, 0.15)',
      primaryLightBg: 'rgba(33, 150, 243, 0.08)',
      primaryText: '#2196f3',

      textSecondary: '#666666',
      textPrimary: '#333333',
      textDisabled: '#999999',

      background: '#fafafa',
      backgroundCard: '#ffffff',
      backgroundHover: '#f5f5f5',

      border: '#e0e0e0',
      divider: '#e8e8e8',

      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#2196f3',
    },
  },

  // 4. 优雅紫 - 高贵典雅
  {
    id: 'elegant-purple',
    name: '优雅紫',
    description: '高贵典雅的紫色调',
    colors: {
      primary: '#9c27b0',
      primaryHover: '#ab47bc',
      primaryActive: '#8e24aa',
      primaryLight: 'rgba(156, 39, 176, 0.15)',
      primaryLightBg: 'rgba(156, 39, 176, 0.08)',
      primaryText: '#9c27b0',

      textSecondary: '#666666',
      textPrimary: '#333333',
      textDisabled: '#999999',

      background: '#fafafa',
      backgroundCard: '#ffffff',
      backgroundHover: '#f5f5f5',

      border: '#e0e0e0',
      divider: '#e8e8e8',

      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#9c27b0',
    },
  },

  // 5. 热情红 - 活力动感
  {
    id: 'passion-red',
    name: '热情红',
    description: '活力动感的红色调',
    colors: {
      primary: '#f44336',
      primaryHover: '#ef5350',
      primaryActive: '#e53935',
      primaryLight: 'rgba(244, 67, 54, 0.15)',
      primaryLightBg: 'rgba(244, 67, 54, 0.08)',
      primaryText: '#f44336',

      textSecondary: '#666666',
      textPrimary: '#333333',
      textDisabled: '#999999',

      background: '#fafafa',
      backgroundCard: '#ffffff',
      backgroundHover: '#f5f5f5',

      border: '#e0e0e0',
      divider: '#e8e8e8',

      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      info: '#f44336',
    },
  },
];

/** 默认主题ID */
export const DEFAULT_THEME_ID = 'warm-orange';

/** 获取主题配置 */
export function getThemeById(themeId: string): Theme {
  const theme = builtInThemes.find((t) => t.id === themeId);
  return theme || builtInThemes[0];
}

/** 获取所有主题列表 */
export function getAllThemes(): Theme[] {
  return builtInThemes;
}
