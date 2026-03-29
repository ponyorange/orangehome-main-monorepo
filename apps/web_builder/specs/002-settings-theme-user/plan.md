# Implementation Plan: 设置内主题切换与右上角用户展示

**Branch**: `002-settings-theme-user` | **Date**: 2026-03-27 | **Spec**: `D:/ai_coding/orangehome/main-monorepo/apps/web_builder/specs/002-settings-theme-user/spec.md`  
**Input**: Feature specification from `specs/002-settings-theme-user/spec.md`

## Summary

在编辑器顶栏（`Header` 三栏 `header:left` / `center` / `right`）实现：**左上角**增加「设置」入口，使用 **Semi Design `Dropdown`** 展示菜单，首项「**切换主题**」点击后打开 **Popover / SideSheet**（或等价浮层）内嵌现有 **`ThemeSwitcher`**（`src/core/theme/ThemeSwitcher.tsx`），从 **`header:right` 移除**当前仅承载主题的 `ThemeSwitcherExtension`；**右上角**新增 **用户头像 + 显示名**，数据来自现有 **`useUserData()`**（`UserInfo.avatar` / `nickname` / `email`），无头像或加载失败时用 **Semi `Avatar` 占位**（渐变底 + 首字母或图标）满足「默认高级头像」观感。新逻辑以 **IExtension + `registerSlot`** 落地，优先新增扩展文件于 `src/extensions/features/`，并调整 `src/core/editor.ts` 扩展列表与 `ThemeSwitcherExtension` 注册槽位。

## Technical Context

**Language/Version**: TypeScript 5.x, Node >=18 (Rush)  
**Primary Dependencies**: React 18, `@douyinfe/semi-ui`（Dropdown、Dropdown.Menu、Avatar、Popover 等）, SWR（`useUserData`）  
**Storage**: `localStorage`（主题已由 `themeStore` 使用；本特性不新增持久化字段）  
**Testing**: Vitest（可选组件快照/交互）；本特性以手工走查为主  
**Target Platform**: 桌面浏览器，Orange Editor（`apps/web_builder` Vite）  
**Project Type**: Rush 包 `@orangehome/web_builder` 内编辑器扩展  
**Performance Goals**: 顶栏交互无感知卡顿；头像加载失败快速降级  
**Constraints**: 不破坏 `ISchema`/公开包 API；登录前不展示编辑器顶栏（沿用 `EditorBootstrap`）  
**Scale/Scope**: 约 2 个扩展（或 1 个合并扩展）+ 主题扩展注册调整 + 可选小颗粒子组件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|--------|
| Extensions | Pass | 新 UI 走 `IExtension` + `header:*` 插槽，不绕过 `SlotRegistry` |
| Schema | Pass | 无 schema 变更 |
| DI | Pass | 无新业务服务；可继续用 hooks 取用户数据 |
| State & data | Pass | 用户数据仍经 `useUserData` / `src/data/api` |
| Public API | Pass | 不修改 `src/index.ts` 导出除非刻意对外暴露（本特性不需要） |
| Quality | Pass | `rushx type-check`、`rushx lint` |

**Post-Phase-1**: 仍满足上表。

## Project Structure

### Documentation (this feature)

```text
specs/002-settings-theme-user/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── header-toolbar-ui.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (planned touchpoints)

```text
apps/web_builder/src/
├── core/
│   └── editor.ts                          # 扩展加载顺序；注册新扩展
├── extensions/features/
│   ├── theme-switcher/index.ts            # 改为不再占用 header:right（或移除该注册）
│   └── editor-settings/  (或拆为 settings + user-profile)
│       ├── index.ts
│       └── components/EditorSettingsMenu.tsx
│       └── components/UserProfileChip.tsx
├── core/theme/ThemeSwitcher.tsx           # 复用，不强制改 API
└── extensions/ui/header/components/Header.tsx  # 通常无需改网格；仅插槽内容变
```

**Structure Decision**: 在 `extensions/features/` 新增扩展；主题切换 UI 复用 `ThemeSwitcher`，仅搬迁入口。

## Complexity Tracking

无宪法违规，无豁免行。

## Phase 0 & Phase 1 Outputs

- **research.md**: Semi 下拉与主题浮层组合、头像降级策略（见该文件）。
- **data-model.md**: 顶栏展示用用户视图字段与回退规则。
- **contracts/header-toolbar-ui.md**: 三栏插槽职责与顺序约定。
- **quickstart.md**: 手工验收步骤。
