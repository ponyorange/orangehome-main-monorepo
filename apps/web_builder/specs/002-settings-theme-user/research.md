# Research: 设置内主题切换与右上角用户展示

## R1 — 设置菜单与「切换主题」的交互形态

**Decision**: 使用 **Semi `Dropdown`**，`trigger` 为带 `aria-label`/文案的「设置」图标按钮；菜单项「切换主题」点击后打开 **`Popover`（`trigger="custom"` + `visible` 状态）** 或 **`SideSheet`**，内容区渲染现有 **`<ThemeSwitcher />`**（完整色点条），关闭浮层后主题已切换即满足 FR-003。

**Rationale**: 规格要求一级菜单仅一项「切换主题」，二级再展开多主题选择与现状 `ThemeSwitcher` 一致；Popover 比再嵌套一层 Dropdown 更易保持键盘焦点与可访问性说明。

**Alternatives considered**:

- 菜单项内直接嵌套子 Dropdown：Semi 支持但交互略重 → 可选，非首选。  
- 路由跳转到专门主题页：超出「编辑器顶栏」范围 → 不采纳。

## R2 — 从 `header:right` 迁出主题后的槽位分配

**Decision**: **`ThemeSwitcherExtension` 不再 `registerSlot('header:right', …)`**；新建 **`UserProfileExtension`（或与设置合并为单扩展多槽注册）** 独占或优先占据 **`header:right`**（`order` 高于其它若有）。**`header:left`** 在现有 `LogoExtension`（order 1）、`ActionsExtension`（order 2）之前或之后插入 **设置按钮**（建议 **`order: 0`** 或 **`order: 3`** 按产品要的左右顺序微调；规格要「左上角设置」，通常 **Logo 旁最左** → **order 小于 Logo** 或 **与 Logo 同组 flex 内顺序**）。

**Rationale**: 当前 `ThemeSwitcherExtension` 已占 `header:right`（见 `theme-switcher/index.ts`）；右上角需用户区，必须腾出并合并逻辑。

**Alternatives considered**:

- 保留主题在 right 与用户并排：违反 spec「主题进设置」→ 拒绝。

## R3 — 头像默认值与加载失败

**Decision**: 使用 **`Avatar`**：`src={user.avatar}` 有值且 `onError` 时清空 `src` 或切换为 `children` 占位；无 URL 时直接使用 **`children`**：圆形 **CSS 渐变背景** + **昵称/邮箱首字符**（大写）或 **Semi `IconUser`**，尺寸与顶栏高度匹配（如 32–36px）。

**Rationale**: Semi Avatar 与现有设计体系统一；渐变 + 首字母符合「简洁有品质」默认头像。

**Alternatives considered**:

- 外链通用占位图服务：依赖网络与隐私 → 不采纳。  
- 纯灰框：不符合「高级」→ 不采纳。

## R4 — 用户数据来源

**Decision**: 在顶栏组件内调用 **`useUserData()`**，使用 **`user.nickname ?? user.email` 前缀** 作为显示名回退；仅在 `user` 存在时渲染 profile（编辑器主界面已在登录后，与 `EditorBootstrap` 一致）。

**Rationale**: 与 `spec` Assumptions 及现有 `UserInfo` 字段一致，无需新 API。
