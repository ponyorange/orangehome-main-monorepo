# Research: 010 已保存状态与预览前保存

## R1 — 脏标记与 `setSchema` 的关系

**Decision**：引入显式 **`setSchema` 元数据**（如 `syncSource: 'remote-bootstrap' | 'save-success' | 'user'`），仅在 `remote-bootstrap` / `save-success` 时调用 **`markClean()`**；其余路径在写入后 **`markDirty()`**。不在每次 `setSchema` 内做全树 deep equal（避免性能与历史栈干扰）。

**Rationale**：与现有 `record: false` 正交；Bootstrap 与保存成功必须不标脏；用户编辑、导入必须标脏。

**Alternatives considered**：比较 `JSON.stringify(schema)` 与 lastSaved — 可作为 Phase 2 增强以支持「撤销回到已保存态自动变干净」。

---

## R2 — Undo / Redo

**Decision（MVP）**：`undo` / `redo` 在 `schemaStore` 内更新 schema 后 **一律 `markDirty()`**（除非后续实现快照相等则 `markClean`）。满足 spec「撤销参与脏标记」的最低interpretation：有历史操作即可能相对上次保存不一致。

**Rationale**：实现成本低；避免错误显示「已保存」。

**Alternatives considered**：每次 undo 后与 lastSaved 序列化比较 — 列入后续迭代。

---

## R3 — SWR / `mutateBuilder` 与脏标

**Decision**：仅在 **EditorBootstrap** 首次应用 `data.pageVersion.pageSchema`（`appliedVersionId` 推进）时 `markClean()`。Toolbar 保存成功后的 `mutateBuilder` **不**自动清脏，除非在同一事务内已将本地 schema 视为已持久化并在保存成功回调中 **`markClean()`**（与保存成功语义一致）。

**Rationale**：避免 revalidate 静默覆盖 schema 时误清脏；保存成功路径显式 `markClean()` 即可。

---

## R4 — 预览 loading 挂载点

**Decision**：在 **Toolbar** 预览按钮上使用 **Semi `Button` `loading`**（或并列 `Spin` + 禁用双按钮），与现有保存按钮 `saving` 状态模式一致；必要时提取 `isPreviewBusy` 状态。

**Rationale**：用户明确要求 loading；与现有 `saving` UX 一致。

---

## R5 — 多标签 / 并发编辑

**Decision**：本规格 **不**解决多标签冲突；计划在 Assumptions 中注明「以当前会话最后成功保存为基准」。

**Alternatives considered**：WebSocket 版本向量 — 超出本期。
