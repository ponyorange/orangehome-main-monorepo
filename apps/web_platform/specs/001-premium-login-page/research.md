# Research: 登录页品牌与布局升级

**Feature**: `001-premium-login-page` | **Date**: 2025-03-27

## R1 — 响应式断点（左右分栏 ↔ 纵向堆叠）

**Decision**: 视口宽度 **≥ 1024px** 时采用左右分栏（左约 45%～50%，右为表单区）；**< 768px** 时单列纵向堆叠，顺序为 **先品牌与介绍（含静态橙子形象），后登录表单**。768px～1023px 可采用与窄屏相同堆叠或弱分栏，以实现成本最低为准（推荐与 `<768px` 一致以减少分支）。

**Rationale**: 与规格中「典型桌面宽屏」与「窄视口纵向堆叠」一致；1024 为常见 laptop 安全宽度。

**Alternatives considered**: 固定 1440 才分栏 — 在 1280 笔记本上体验差；全程分栏 — 移动端不可用。

## R2 — 「减少动态效果」与触摸环境

**Decision**:

- 使用 `window.matchMedia('(prefers-reduced-motion: reduce)')`：为真时 **不** 运行指针驱动的眼部追踪，改为 **静态眼睛**（或单次入场动画后静止），左栏信息与要点完整保留。
- 使用 `window.matchMedia('(pointer: fine)')` 为假（或仅 coarse）时，**不** 绑定 `mousemove` 追踪，避免触摸设备无意义耗电与抖动。

**Rationale**: 满足 spec Edge Cases 与 SC-004；避免在不可行输入设备上假装「跟随」。

**Alternatives considered**: 始终追踪 — 违背无障碍与触摸体验；仅用 UA 判断 — 不如媒体查询准确。

## R3 — 橙子角色与视线跟随实现

**Decision**: 使用 **内联 SVG**（或单文件 React 组件）绘制橙子简形 + 两只眼睛（独立 `g` 或 `circle`）；瞳孔/高光位置根据指针相对吉祥物容器的坐标用 **`atan2`** 计算角度或限制在椭圆范围内平移，通过 **`transform`** 更新；监听区域限定在 **左栏容器** 内，使用 **`requestAnimationFrame` 合并更新** 或 16ms 节流，避免每事件 setState。

**Rationale**: 无额外 npm 依赖，符合宪章「简单性」；与 React 18 兼容。

**Alternatives considered**: Lottie/Rive — 视差大、依赖与导出成本高，非本需求必选；纯 CSS 无法实现精确「跟鼠标」。

## R4 — 暖橙主题与子页对齐（FR-008）

**Decision**: 新增 `src/styles/auth-theme.scss`，定义 CSS 变量（例如 `--auth-bg`, `--auth-primary`, `--auth-primary-soft`, `--auth-text`, `--auth-card-bg`），在 **`Login` 全页** 使用完整变量集；**`Register` / `ResetPassword`** 仅替换背景渐变/主色链接/按钮主题色引用同一变量文件，**不** 引入左栏布局类名、不挂载 `OrangeMascot`。

**Rationale**: 单源配色，满足「配色与字体气质对齐」且控制范围。

**Alternatives considered**: 每页复制色值 — 易漂移；Semi 全局主题覆盖 — 影响面过大，本特性优先局部认证域。

## R5 — i18n 与现有 `pages/Login` 硬编码文案

**Decision**: 登录页上所有用户可见字符串（标题、副标题、要点、链接、Toast 成功/失败若属本页专属）迁入 **`zh-CN.json` / `en-US.json`**，与项目现有 `useTranslation` 用法一致；**产品要点** 使用键名如 `login.marketing.bullet1` …（或数组结构若 i18n 配置支持），便于运营改文案。

**Rationale**: 满足 FR-007 与宪章 IV；与 `LoginForm`/`Register` 未来收敛路径一致。

**Alternatives considered**: 仅中文硬编码 — 直接违宪。
