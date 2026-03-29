# Contract: 编辑器顶栏插槽（Header）

**Consumer**: `Header`（`src/extensions/ui/header/components/Header.tsx`）  
**Producer**: `IExtension` 实现通过 `context.registerSlot`

## 布局

- **header:left**：左侧集群，flex 横向；**视觉顺序**（从左到右）须满足产品约定；本特性要求 **「设置」** 作为明确入口出现在**左侧区域**（与 Logo、Actions 共存时以 `order` 控制）。
- **header:center**：中间标题区（如 Toolbar），本特性不占用。
- **header:right**：右侧集群；本特性要求 **用户头像 + 昵称** 出现在**右侧区域**；**不再**将「主题色点条」常驻于此（主题仅经设置菜单触达）。

## 行为

- **设置下拉**：打开/关闭符合 FR-006；菜单项「切换主题」触达主题切换 UI（实现为居中 **Modal** 内嵌 `ThemeSwitcher`，与规格中的 Popover/SideSheet 同属浮层）且与全局 `themeStore` 一致。
- **用户区**：展示当前登录用户；无头像时使用统一默认头像样式，与 `data-model.md` 回退一致。

## 版本

随特性 `002-settings-theme-user` 迭代；槽位 ID 冲突时以 `SlotRegistry` 合并规则为准。
