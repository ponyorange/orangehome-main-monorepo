# Feature Specification: Schema JSON 编辑器剪贴板快捷键与跨应用复制粘贴

**Feature Branch**: `012-schema-json-clipboard`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: \"schema json编辑器支持键盘快捷键复制粘贴，并且支持从外部文档复制然后粘贴，也支持从schema json编辑器里复制粘贴到外部文档\"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schema JSON 编辑器内支持复制/粘贴快捷键 (Priority: P1)

作为页面搭建编辑者，我在「编辑 Schema」弹窗里的 Schema JSON 编辑器中编辑 JSON 时，希望能直接使用键盘快捷键复制/粘贴文本（Windows/Linux：Ctrl+C / Ctrl+V；macOS：⌘C / ⌘V），并且这些快捷键不会被画布层「复制组件/粘贴组件」行为劫持。

**Why this priority**：这是 JSON 编辑的基础能力；缺失会显著降低效率并引发误操作。

**Independent Test**：打开「编辑 Schema」→ 在 JSON 编辑器里选中文本 → Ctrl/⌘+C → 在同编辑器内 Ctrl/⌘+V → 文本按预期变化，且画布不应发生组件复制/粘贴导致的结构变化。

**Acceptance Scenarios**:

1. **Given** 已打开「编辑 Schema」弹窗且 Schema JSON 编辑器拥有焦点，**When** 用户选中文本并触发复制快捷键，**Then** 应复制该文本（可在编辑器内粘贴验证），且不触发画布层复制组件。
2. **Given** 已打开「编辑 Schema」弹窗且 Schema JSON 编辑器拥有焦点，**When** 用户触发粘贴快捷键，**Then** 应将剪贴板文本粘贴到当前光标位置（或替换选区），且不触发画布层粘贴组件。

---

### User Story 2 - 支持外部 JSON 粘贴并生效 (Priority: P1)

作为编辑者，我希望能从外部文档/工具复制 JSON 文本，粘贴进 Schema JSON 编辑器；当 JSON 合法且结构有效时，编辑器应将其作为新的 schema 内容并同步到画布；当 JSON 非法或结构无效时，应提示错误但保持画布处于上一次有效状态。

**Why this priority**：真实工作流中 schema 常来自外部来源；没有外部粘贴无法完成快速导入与调整。

**Independent Test**：从外部复制一段合法 JSON → 粘贴进编辑器 → 画布同步；再粘贴非法 JSON → 显示错误且画布不变。

**Acceptance Scenarios**:

1. **Given** 用户从外部复制了 JSON 文本且 Schema JSON 编辑器拥有焦点，**When** 用户粘贴该文本，**Then** 编辑器应接收文本；若 JSON 合法且结构有效，应同步更新画布；若不合法或结构无效，应显示可理解错误并不更新画布。

---

### User Story 3 - 支持从编辑器复制到外部 (Priority: P2)

作为编辑者，我希望能从 Schema JSON 编辑器复制任意选区文本，并粘贴到外部文档中，便于分享、留档与复现问题。

**Why this priority**：这是协作与排障的常用操作，但相对「能粘贴进来」优先级略低。

**Independent Test**：在编辑器中复制一段 JSON → 切换到外部应用粘贴 → 文本一致。

**Acceptance Scenarios**:

1. **Given** Schema JSON 编辑器拥有焦点且用户选中了文本，**When** 用户复制并在外部应用粘贴，**Then** 外部应用应得到与选区一致的文本内容。

---

### Edge Cases

- **焦点不在编辑器**：当焦点在弹窗按钮或其它区域时，快捷键按现有全局规则处理；本规格只约束「编辑器拥有焦点」时按文本语义执行且不劫持。
- **非法 JSON**：粘贴后若解析失败，应提示错误，且不更新画布。
- **结构无效 JSON**：粘贴后若结构校验失败，应提示错误，且不更新画布。
- **大文本粘贴**：允许短暂处理，但不应造成编辑器不可恢复卡死。
- **快捷键差异**：Ctrl 与 ⌘ 都应被视为复制/粘贴意图。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**：当 Schema JSON 编辑器拥有焦点时，系统 MUST 支持复制/粘贴快捷键用于文本编辑，且 MUST 不触发画布层组件复制/粘贴行为。
- **FR-002**：系统 MUST 支持从外部应用复制文本并粘贴进 Schema JSON 编辑器。
- **FR-003**：当粘贴内容为合法且结构有效的 JSON 时，系统 MUST 同步更新画布；当为非法 JSON 或结构无效时，系统 MUST 显示错误提示且 MUST 不更新画布。
- **FR-004**：系统 MUST 支持从 Schema JSON 编辑器复制文本并粘贴到外部应用。
- **FR-005**：本功能 MUST 仅影响 Schema JSON 编辑器焦点态下的快捷键处理；不应改变画布编辑快捷键在其它场景下的既有行为。

### Key Entities *(include if feature involves data)*

- **Schema JSON 编辑器**：用于编辑组件或根节点 schema 的 JSON 文本输入区域。
- **剪贴板文本**：用户在系统剪贴板中复制/粘贴的纯文本内容。

## Orange Editor / web_builder *(conditional)*

- **ARCH-001**：实现须遵循 `.specify/memory/constitution.md`。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**：在 20 次走查中（含 Windows 与 macOS），当 Schema JSON 编辑器拥有焦点时，复制/粘贴快捷键按文本语义成功工作的比例达到 **95%+**。
- **SC-002**：在 10 次「外部复制 → 粘贴到编辑器」走查中：合法且结构有效 JSON 能同步更新画布；非法/结构无效 JSON 产生错误提示且画布保持上一次有效状态；**0 次**出现画布被错误覆盖为无效状态。
- **SC-003**：在 10 次「从编辑器复制 → 粘贴到外部」走查中，外部应用得到的文本与选区一致的比例为 **100%**。

## Assumptions

- 「Schema JSON 编辑器」指当前产品中「编辑 Schema」弹窗内的 JSON 编辑区域（例如 Monaco）。
- 外部应用包括浏览器外的桌面应用，以及同浏览器的其它输入区域。
- 画布层组件复制/粘贴快捷键保持不变；仅在 JSON 编辑器拥有焦点时需让位给文本编辑语义。
