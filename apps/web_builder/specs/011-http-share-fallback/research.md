# Research: 011 HTTP 分享与复制兜底

## R1 — 非安全上下文下 `navigator.clipboard`

**Decision**：将 **`navigator.clipboard.writeText`** 作为**首选**；在 `try/catch` 失败或 `navigator.clipboard` 不可用时进入下一层。

**Rationale**：规范要求安全上下文的 Clipboard API 在 `http://`（非 localhost）常不可用或抛错，这是当前错误的根因。

**Alternatives considered**：仅提示用户改用 HTTPS — 与 FR-001/SC-003 冲突，放弃。

---

## R2 — HTTP 下的同步复制兜底

**Decision**：使用 **`document.execCommand('copy')`** 配合程序创建的 **`textarea`**（`position: fixed; opacity: 0`）、`select()`、执行 `copy`、再 `remove()`。

**Rationale**：在大量非安全上下文浏览器中仍可用，满足本地/内网 HTTP 调试；实现成本低。

**Alternatives considered**：仅 Modal 不尝试第二层 — 损害「一键复制成功」比例；放弃。

---

## R3 — 第二层仍失败时的 UX

**Decision**：**Semi `Modal`** 展示完整 URL；主按钮 **「在新标签页打开」** 调用 `window.open(url, '_blank', 'noopener,noreferrer')`；次要操作为关闭；可选「再试复制」按钮（若实现简单可调用同一 robust 函数）。

**Rationale**：满足 FR-002/FR-003；`noopener` 降低 `window.open` 风险。

**Alternatives considered**：`prompt()` — 体验差；放弃。

---

## R4 — 成功路径不打扰

**Decision**：任一复制策略成功 → **仅 Toast**，**不**打开 Modal（FR-004）。

**Rationale**：与现有成功反馈一致。

---

## R5 — `window.open` 被拦截

**Decision**：`const w = window.open(...); if (!w || w.closed)` 时 **Toast.warning/error** 提示可能被浏览器拦截，引导用户用 Modal 内链接手动操作或允许弹窗。

**Rationale**：对齐 spec Edge「浏览器禁止弹窗」。
