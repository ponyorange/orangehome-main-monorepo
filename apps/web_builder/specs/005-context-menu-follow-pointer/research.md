# Research: 005-context-menu-follow-pointer

## R1 — 锚定数据从哪来

- **Decision**：继续使用 `MouseEvent` 的 **`clientX` / `clientY`**（视口坐标），由 `CenterCanvas` 的 `handleContextMenu` 传入 `ContextMenu`。与规格中「当前可见视口」一致。
- **Rationale**：浏览器原生右键事件已提供视口坐标，无需再换算滚动文档坐标；`position: fixed` 与 `client*` 对齐。
- **Alternatives considered**：相对画布容器换算 — 仅在出现实测偏差时引入；当前实现路径下优先保持简单。

## R2 — 边界与翻转算法

- **Decision**：在已知菜单真实宽高 `menuW`×`menuH` 与视口 `vw`×`vh` 时，默认将菜单**左上角**放在 `(clientX, clientY)`；若右侧超出则尝试将菜单放在指针**左侧**（`left = clientX - menuW`）；若仍超出则**夹取**到 `[padding, vw - menuW - padding]`。竖直方向对称：先向下，超出则翻到指针**上方**，再夹取。内边距建议 **8px**（与现有视觉留白一致，可在实现中集中为常量）。
- **Rationale**：满足 FR-002「反方向展开或向内偏移」与 SC-002 边角用例；比单纯 `Math.min(x, vw-200)` 更准确（真实宽高、左右翻转）。
- **Alternatives considered**：引入 **Floating UI / Popper** — 能力强但增加依赖与包体；constitution 要求新依赖需在 Complexity Tracking 说明，本需求用几何计算即可。

## R3 — 何时测量菜单尺寸

- **Decision**：在 `ContextMenu` 内使用 **`useLayoutEffect`**：菜单挂载后读取 `menuRef.current.getBoundingClientRect()`（或 `offsetWidth`/`offsetHeight`），再计算并 `setState` 更新 `left`/`top`。首帧若需避免明显跳动，可先渲染于指针处或 `visibility: hidden` 测量后显示（实现阶段二选一，以可接受闪烁为准）。
- **Rationale**：必须在 DOM 有尺寸后才能正确翻转/夹取；`useLayoutEffect` 在浏览器绘制前同步提交，减少闪烁。
- **Alternatives considered**：固定估算宽高 — 即现状，无法通过 SC-002 中「真实菜单项变化」场景。

## R4 — 多入口一致（Story 3）

- **Decision**：本迭代将 **`resolveContextMenuPlacement`**（或等价纯函数）放在 `src/utils/`，供未来第二处右键菜单复用；**计划内实现范围**仅 **`ContextMenu.tsx` 画布路径**。
- **Rationale**：符合 spec「具体入口在 plan 列出」；先交付主路径，避免无依据扩大范围。
- **Alternatives considered**：抽象 `ContextMenuHost` HOC — 可在出现第三处入口时再提取。

## R5 — 降级（FR-005）

- **Decision**：若测量失败（ref 为空），回退到**当前** `adjustedX`/`adjustedY` 逻辑（`Math.min` + 估算高），并保证 `left`/`top` 非 `NaN`、在 `[0, vw-1]` 等安全范围内。
- **Rationale**：避免静默不显示菜单。
- **Alternatives considered**：Toast 报错 — 对右键菜单过重，不推荐。
