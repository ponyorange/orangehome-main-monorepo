/**
 * 主题配置系统
 * 定义5个内置主题的配色方案
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryLightBg: string;
  primaryText: string;
  textSecondary: string;
  textPrimary: string;
  textDisabled: string;
  background: string;
  backgroundCard: string;
  backgroundHover: string;
  border: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  surfaceBase: string;
  surfacePanel: string;
  surfacePanelSolid: string;
  surfaceGlass: string;
  surfaceOverlay: string;
  surfaceAccent: string;
  borderSoft: string;
  borderStrong: string;
  borderGlow: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  gradientPage: string;
  gradientPanel: string;
  gradientAccent: string;
  gridLine: string;
  rulerBg: string;
  scrollbarThumb: string;
  backdropBlur: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

function createTheme(theme: {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryLightBg: string;
  gradientPage: string;
  gradientPanel: string;
  gradientAccent: string;
}): Theme {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    colors: {
      primary: theme.primary,
      primaryHover: theme.primaryHover,
      primaryActive: theme.primaryActive,
      primaryLight: theme.primaryLight,
      primaryLightBg: theme.primaryLightBg,
      primaryText: theme.primary,
      textSecondary: '#667085',
      textPrimary: '#101828',
      textDisabled: '#98a2b3',
      background: '#f5f7fb',
      backgroundCard: '#ffffff',
      backgroundHover: 'rgba(255,255,255,0.88)',
      border: 'rgba(148, 163, 184, 0.18)',
      divider: 'rgba(148, 163, 184, 0.16)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: theme.primary,
      surfaceBase: 'rgba(255, 255, 255, 0.72)',
      surfacePanel: 'rgba(255, 255, 255, 0.78)',
      surfacePanelSolid: 'rgba(255, 255, 255, 0.94)',
      surfaceGlass: 'rgba(255, 255, 255, 0.62)',
      surfaceOverlay: 'rgba(255, 255, 255, 0.84)',
      surfaceAccent: theme.primaryLightBg,
      borderSoft: 'rgba(255, 255, 255, 0.55)',
      borderStrong: 'rgba(148, 163, 184, 0.26)',
      borderGlow: theme.primaryLight,
      shadowSm: '0 10px 30px rgba(15, 23, 42, 0.06)',
      shadowMd: '0 18px 48px rgba(30, 41, 59, 0.10)',
      shadowLg: '0 28px 80px rgba(51, 65, 85, 0.15)',
      gradientPage: theme.gradientPage,
      gradientPanel: theme.gradientPanel,
      gradientAccent: theme.gradientAccent,
      gridLine: 'rgba(255, 255, 255, 0.8)',
      rulerBg: 'rgba(255, 255, 255, 0.70)',
      scrollbarThumb: 'rgba(148, 163, 184, 0.34)',
      backdropBlur: '18px',
    },
  };
}

export const builtInThemes: Theme[] = [
  createTheme({
    id: 'warm-orange',
    name: '温暖橙',
    description: '柔和日出感的科技浅橙风格',
    primary: '#f48c45',
    primaryHover: '#fb9b5a',
    primaryActive: '#e6732d',
    primaryLight: 'rgba(244, 140, 69, 0.20)',
    primaryLightBg: 'rgba(244, 140, 69, 0.10)',
    gradientPage: 'radial-gradient(circle at top left, rgba(255, 187, 153, 0.72), transparent 32%), radial-gradient(circle at top right, rgba(255, 226, 178, 0.55), transparent 24%), linear-gradient(180deg, #fff9f3 0%, #f6f7ff 52%, #f7fbff 100%)',
    gradientPanel: 'linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,247,240,0.78) 100%)',
    gradientAccent: 'linear-gradient(135deg, #ffb380 0%, #ff7d6b 48%, #ff6ca8 100%)',
  }),
  createTheme({
    id: 'fresh-green',
    name: '清新绿',
    description: '通透自然的薄荷科技风格',
    primary: '#3fbf94',
    primaryHover: '#4fd1a4',
    primaryActive: '#32a883',
    primaryLight: 'rgba(63, 191, 148, 0.18)',
    primaryLightBg: 'rgba(63, 191, 148, 0.10)',
    gradientPage: 'radial-gradient(circle at top left, rgba(135, 242, 203, 0.48), transparent 28%), radial-gradient(circle at top right, rgba(187, 247, 208, 0.48), transparent 28%), linear-gradient(180deg, #f2fff9 0%, #f6fbff 52%, #f9fffd 100%)',
    gradientPanel: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(240,255,249,0.80) 100%)',
    gradientAccent: 'linear-gradient(135deg, #63e6be 0%, #4ac0a8 48%, #5ebef4 100%)',
  }),
  createTheme({
    id: 'deep-blue',
    name: '深邃蓝',
    description: '理性未来感的科技浅蓝风格',
    primary: '#4f7cff',
    primaryHover: '#618cff',
    primaryActive: '#3f6ef6',
    primaryLight: 'rgba(79, 124, 255, 0.18)',
    primaryLightBg: 'rgba(79, 124, 255, 0.10)',
    gradientPage: 'radial-gradient(circle at top left, rgba(129, 169, 255, 0.50), transparent 30%), radial-gradient(circle at top right, rgba(117, 221, 255, 0.36), transparent 24%), linear-gradient(180deg, #f5f8ff 0%, #f4fbff 48%, #f8fbff 100%)',
    gradientPanel: 'linear-gradient(135deg, rgba(255,255,255,0.87) 0%, rgba(243,247,255,0.80) 100%)',
    gradientAccent: 'linear-gradient(135deg, #7ea7ff 0%, #5b8cff 48%, #62d7ff 100%)',
  }),
  createTheme({
    id: 'elegant-purple',
    name: '优雅紫',
    description: '高级柔光感的未来紫调风格',
    primary: '#8b5cf6',
    primaryHover: '#9b72ff',
    primaryActive: '#7c4df0',
    primaryLight: 'rgba(139, 92, 246, 0.20)',
    primaryLightBg: 'rgba(139, 92, 246, 0.10)',
    gradientPage: 'radial-gradient(circle at top left, rgba(196, 181, 253, 0.54), transparent 28%), radial-gradient(circle at top right, rgba(251, 191, 246, 0.38), transparent 26%), linear-gradient(180deg, #faf7ff 0%, #f7f8ff 54%, #fff9fe 100%)',
    gradientPanel: 'linear-gradient(135deg, rgba(255,255,255,0.87) 0%, rgba(250,245,255,0.80) 100%)',
    gradientAccent: 'linear-gradient(135deg, #b08cff 0%, #8b5cf6 48%, #f472b6 100%)',
  }),
  createTheme({
    id: 'passion-red',
    name: '热情红',
    description: '高能品牌感的珊瑚红风格',
    primary: '#f45d6f',
    primaryHover: '#fb7284',
    primaryActive: '#e64a5d',
    primaryLight: 'rgba(244, 93, 111, 0.18)',
    primaryLightBg: 'rgba(244, 93, 111, 0.10)',
    gradientPage: 'radial-gradient(circle at top left, rgba(255, 186, 193, 0.56), transparent 28%), radial-gradient(circle at top right, rgba(254, 215, 170, 0.40), transparent 26%), linear-gradient(180deg, #fff7f7 0%, #fff9fb 52%, #fffdf9 100%)',
    gradientPanel: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,245,246,0.80) 100%)',
    gradientAccent: 'linear-gradient(135deg, #ff9a8b 0%, #f45d6f 48%, #ffb347 100%)',
  }),
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
