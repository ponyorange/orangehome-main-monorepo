# Tasks: 012 Schema JSON 编辑器剪贴板快捷键与跨应用复制粘贴

**Input**: `apps/web_builder/specs/012-schema-json-clipboard/`（plan.md、spec.md、research.md、contracts/、quickstart.md）  
**Prerequisites**: plan.md、spec.md  
**Tests**: 规格未要求自动化测试；以 quickstart.md 手工走查与 `npm run type-check` 为主。

**Organization**: 按用户故事分组；US1（编辑器内快捷键）与 US2（外部粘贴生效）可部分并行；US3（复制到外部）依赖 US1 的复制能力。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、不依赖未完成任务）
- **[Story]**: US1 / US2 / US3
- 路径相对于 monorepo 中的 `apps/web_builder/`

## Path Conventions

Orange Editor：`apps/web_builder/src/extensions/`（features/properties-panel、editing/keyboard-shortcuts）。

---

## Phase 1: Setup（确认基线）

**Purpose**: 确认设计产物与类型基线。

- [x] T001 确认 `apps/web_builder/specs/012-schema-json-clipboard/` 下 plan.md、spec.md、contracts/ 可用，并在 `apps/web_builder` 执行 `npm run type-check` 记录基线

---

## Phase 2: Foundational（Monaco 快捷键注册）

**Purpose**: 在 Monaco 编辑器实例上完成复制/粘贴/剪切命令注册，并确保事件不冒泡到 document。

**⚠️ CRITICAL**: 未完成前，US2/US3 的快捷键行为不可预期。

- [x] T002 在 `apps/web_builder/src/extensions/features/properties-panel/components/MonacoSchemaEditor.tsx` 创建 editor 后，使用 `editor.addCommand`（或 `editor.addAction`）注册复制（Ctrl/⌘+C）、粘贴（Ctrl/⌘+V）、剪切（Ctrl/⌘+X）命令；在回调内确保调用 `e.preventDefault()` 与 `e.stopPropagation()`（或等效阻止冒泡），使事件不触发画布层快捷键
- [x] T003 在 `MonacoSchemaEditor.tsx` 中通过 `navigator.clipboard` 或 Monaco 默认行为完成文本复制/粘贴；若需显式读写剪贴板，提供降级到 `document.execCommand` 的兼容路径，并在失败时仅提示（不破坏编辑器文本）

**Checkpoint**: Monaco 编辑器聚焦时，复制/粘贴/剪切快捷键仅作用于编辑器内文本，且控制台无全局快捷键冲突报错。

---

## Phase 3: User Story 1 — Schema JSON 编辑器内支持复制/粘贴快捷键 (Priority: P1) 🎯 MVP

**Goal**: 编辑器聚焦时，复制/粘贴/剪切快捷键按文本语义工作，且不触发画布层组件复制/粘贴。

**Independent Test**: 见 spec.md US1；在编辑器内选中文本复制粘贴后，画布结构应保持不变。

### Implementation for User Story 1

- [x] T004 [US1] 审阅 `MonacoSchemaEditor.tsx` 实现：确认快捷键回调中已阻止事件冒泡；若 Monaco 默认行为已满足剪贴板读写，可无需额外代码
- [x] T005 [US1] 在 `apps/web_builder/src/extensions/editing/keyboard-shortcuts/components/KeyboardShortcuts.tsx` 的 keydown handler 顶部，增加判断「若 `e.target` 位于 Monaco 编辑器 DOM 内」或「`document.activeElement` 在 Monaco 容器内」则直接 `return`（避免执行画布组件复制/粘贴逻辑）
- [x] T006 [US1] 确保 US1 与 US2 可共用同一 Monaco 命令注册；剪切命令行为应与复制类似（剪切文本到剪贴板，不从画布删除节点）

**Checkpoint**: US1 独立走查通过：编辑器内复制粘贴成功，画布无组件级复制/粘贴副作用。

---

## Phase 4: User Story 2 — 支持外部 JSON 粘贴并生效 (Priority: P1)

**Goal**: 外部粘贴的 JSON 合法且结构有效时同步画布；非法时提示错误且不更新画布。

**Independent Test**: 见 spec.md US2；合法 JSON 粘贴后画布同步；非法粘贴后画布保持上一次有效状态。

### Implementation for User Story 2

- [x] T007 [US2] 确认 `PropertiesPanel.tsx` 中的 `handleSchemaChange` 已包含 `JSON.parse` + `validate` + `setSchema` 链路；确保 Monaco 粘贴导致 `onChange` 回调后走同一路径
- [x] T008 [US2] 验证非法 JSON（解析失败或 `validate` 返回 false）时，`setSchemaError` 被设置且未调用 `setSchema`，从而画布保持上一次有效状态（与 spec FR-003/SC-002 一致）

**Checkpoint**: US2 独立走查通过：合法粘贴 → 画布更新；非法粘贴 → 错误提示 + 画布不变。

---

## Phase 5: User Story 3 — 支持从编辑器复制到外部 (Priority: P2)

**Goal**: 编辑器内复制的内容可粘贴到外部应用。

**Independent Test**: 见 spec.md US3；外部应用获得的文本与编辑器选区一致。

### Implementation for User Story 3

- [x] T009 [US3] 确认 US1 中已注册的复制命令（或 Monaco 默认复制行为）能将选区文本写入系统剪贴板；在 VS Code/记事本/浏览器地址栏等外部区域粘贴验证文本一致性

**Checkpoint**: US3 走查通过：外部应用粘贴结果与编辑器选区一致。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 文档与质量闸门。

- [x] T010 按 `apps/web_builder/specs/012-schema-json-clipboard/quickstart.md` 执行手工场景（含大文本粘贴不卡死、焦点不在编辑器时画布快捷键正常）
- [x] T011 [P] 在 `apps/web_builder` 运行 `npm run type-check`（及仓库惯用的 lint 命令，若本地可执行）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → 无前置  
- **Phase 2** → 依赖 Phase 1；**阻塞** Phase 3–5  
- **Phase 3 (US1)** → 依赖 Phase 2  
- **Phase 4 (US2)** → 依赖 Phase 3（共用 Monaco 命令与 `handleSchemaChange` 链路）  
- **Phase 5 (US3)** → 依赖 Phase 3（复制能力）  
- **Phase 6** → 依赖 Phase 3–5 完成  

### User Story Dependencies

```
Foundational (T002–T003)
        │
        ▼
US1 快捷键防劫持 (T004–T006)
        │
        ├──► US2 外部粘贴生效 (T007–T008)
        │
        └──► US3 复制到外部 (T009)
```

### Parallel Opportunities

- **T011 [P]**：与 T010 文档任务可并行（不同职责）。  
- US1 完成后，US2 与 US3 理论上可并行验证，但因都依赖同一 Monaco 实例，建议顺序执行或同一人完成。

### Within-Story Order

- **US1**：T004（Monaco 命令） → T005（全局兜底） → T006（剪切与边界）  
- **US2**：T007（复用链路确认） → T008（非法路径验证）  
- **US3**：T009（外部粘贴验证，依赖 US1 复制能力）  

---

## Parallel Example: User Story 1

```text
Task: "Monaco 命令注册与 stopPropagation (T002)"
Task: "全局 KeyboardShortcuts 兜底防护 (T005)"
```

---

## Implementation Strategy

### MVP First（US1 完成即可初步交付）

1. Phase 1（T001）  
2. Phase 2（T002–T003）  
3. Phase 3（T004–T006）  
4. **停止并走查 US1**：编辑器聚焦时快捷键不误触画布  
5. 继续 Phase 4–6  

### 增量交付

- MVP（US1）→ 合并/演示：编辑器内快捷键可用  
- 加 US2 → 验证外部粘贴生效  
- 加 US3 → 验证复制到外部  
- Polish（T010–T011）  

### 建议单会话实现顺序

`T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011`

---

## Summary

| 指标 | 值 |
|------|-----|
| **任务总数** | 11 |
| **US1** | 3（T004–T006）+ 奠基 T002–T003 |
| **US2** | 2（T007–T008） |
| **US3** | 1（T009） |
| **Setup / Foundation / Polish** | T001；T002–T003；T010–T011 |
| **可并行** | T011 [P]（与 T010） |
| **格式** | 全部含 `- [ ] Txxx` 与 `apps/web_builder/` 路径 |

---

## Notes

- `KeyboardShortcuts.tsx` 现有逻辑已判断 `input` / `textarea` / `isContentEditable` 时直接 return；Monaco 的 DOM 通常为自定义内容，需额外判断（如检查祖先类名或 data 属性）。  
- 若 Monaco 默认复制/粘贴行为已满足剪贴板需求，可不显式调用 `navigator.clipboard`，只需阻止事件冒泡即可。  
- 非法 JSON 处理复用 `PropertiesPanel.handleSchemaChange`，不引入新校验逻辑。
