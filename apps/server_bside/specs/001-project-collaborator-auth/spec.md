# Feature Specification: 项目协作者鉴权

**Feature Branch**: `001-project-collaborator-auth`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "新增鉴权模块：1. 项目列表接口，只返回用户是owner或者是collaborators 的列表。2. 项目管理和页面管理相关的接口也要先查询用户是不是该项目的owner或者是collaborators 才可操作，否则返回没有权限。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 仅列出有权限的项目 (Priority: P1)

已登录用户打开「我的项目」或等价入口时，系统只展示该用户作为 **所有者（owner）** 或 **协作者（collaborator）** 参与的项目；用户看不到自己未参与的项目。

**Why this priority**: 这是数据隔离的基础；列表错误会直接导致越权浏览他人项目信息。

**Independent Test**: 准备三个项目（用户 A 仅为项目 1 的 owner、仅为项目 2 的 collaborator、与项目 3 无任何关系）；以 A 身份请求项目列表，仅应出现项目 1 与 2，且不应出现项目 3。

**Acceptance Scenarios**:

1. **Given** 用户是项目 P 的 owner，**When** 该用户请求项目列表，**Then** 列表中包含 P。
2. **Given** 用户是项目 P 的 collaborator（非 owner），**When** 该用户请求项目列表，**Then** 列表中包含 P。
3. **Given** 用户与项目 P 既非 owner 也非 collaborator，**When** 该用户请求项目列表，**Then** 列表中不包含 P。

---

### User Story 2 - 项目管理操作需成员身份 (Priority: P2)

已登录用户对某一项目执行 **项目管理** 类操作（创建/更新/删除项目级设置、成员、元数据等，以产品已定义的「项目管理」范围为准）时，系统仅在当前用户为该项目的 owner 或 collaborator 时允许执行；否则拒绝并给出 **无权限** 的明确结果。

**Why this priority**: 防止未授权用户篡改项目配置或结构，与列表过滤形成完整访问控制闭环。

**Independent Test**: 使用非成员用户携带有效项目标识尝试一项典型的项目管理写操作，应被拒绝；使用 owner 与 collaborator 分别重试，均应成功（在业务规则允许的前提下）。

**Acceptance Scenarios**:

1. **Given** 用户是目标项目的 owner 或 collaborator，**When** 执行允许范围内的项目管理操作，**Then** 操作按业务规则成功或按校验失败（非权限原因）。
2. **Given** 用户既不是 owner 也不是 collaborator，**When** 对该项目执行任意项目管理类操作，**Then** 系统拒绝并返回无权限结果，且不执行业务变更。
3. **Given** 用户未建立有效登录身份，**When** 尝试项目管理操作，**Then** 系统拒绝（按现有未认证策略处理，不得当作已授权成员）。

---

### User Story 3 - 页面管理操作需成员身份 (Priority: P3)

已登录用户对某一项目下的 **页面** 执行管理类操作（创建/更新/删除/排序等页面级能力，以产品已定义的「页面管理」范围为准）时，系统仅在当前用户为该项目的 owner 或 collaborator 时允许执行；否则拒绝并给出 **无权限** 的明确结果。

**Why this priority**: 页面资源属于项目内资产，需与项目成员关系一致，避免跨项目篡改页面。

**Independent Test**: 非成员用户对某项目下页面执行写操作应被拒绝；owner 与 collaborator 在权限策略一致的前提下应可执行同等页面管理操作（若未来区分只读协作者，以届时规则为准，见假设）。

**Acceptance Scenarios**:

1. **Given** 用户是项目成员（owner 或 collaborator），**When** 对该项目下页面执行页面管理操作，**Then** 操作按业务规则成功或按非权限类校验失败。
2. **Given** 用户不是该项目成员，**When** 对该项目下任一页面执行页面管理操作，**Then** 系统拒绝并返回无权限结果。
3. **Given** 目标页面所属项目与用户请求中标识的项目不一致（若存在此类标识组合），**When** 执行页面管理操作，**Then** 系统以实际资源所属项目的成员关系为准进行判定，非成员不得操作。

### Edge Cases

- 用户刚从某项目被移除协作者身份后再次操作：应按 **非成员** 拒绝，不得沿用旧缓存身份过久（具体时效在实现阶段约定，产品层面要求 **最终一致地拒绝**）。
- 项目无协作者、仅 owner：仅 owner 应出现在列表并具备管理权限；其他用户均不可见该项目列表项且不可操作。
- 列表为空：用户无任何项目关系时，返回空集合，不视为错误。
- 「项目管理」与「页面管理」边界不清的接口：以接口所属产品域归类为准；若单接口同时涉及两层资源，**只要触及项目或页面管理语义，均须校验目标项目的成员关系**。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在向已认证用户提供项目列表时，仅包含该用户作为 **owner** 或 **collaborator** 的项目。
- **FR-002**: 系统 MUST 在执行 **项目管理** 类操作前，判定当前用户是否为 **目标项目** 的 owner 或 collaborator；若不是，MUST 拒绝并返回 **无权限** 结果，且不产生授权范围内的业务副作用。
- **FR-003**: 系统 MUST 在执行 **页面管理** 类操作前，判定当前用户是否为 **页面所属项目** 的 owner 或 collaborator；若不是，MUST 拒绝并返回 **无权限** 结果，且不产生授权范围内的业务副作用。
- **FR-004**: owner 与 collaborator 在 **本特性范围内** MUST 享有同等的「可列入列表」与「可执行项目/页面管理」权限；若产品后续引入只读协作者等细分角色，须单独修订本规范。
- **FR-005**: 无权限响应 MUST 对用户可理解（明确表达无权操作），且 MUST 符合现有产品与合规对错误信息的要求（不在此规范中规定具体文案或状态码）。

### Key Entities *(include if feature involves data)*

- **项目（Project）**: 工作空间单元；具有 **所有者** 与可选的 **协作者** 集合；与页面存在包含关系。
- **用户（User）**: 已认证主体；与项目通过 owner 或 collaborator 关系关联。
- **页面（Page）**: 隶属于某一项目；页面管理操作的授权锚点为 **所属项目** 的成员关系。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在受控测试集中，对任意「非成员」测试账号，项目列表中 **100%** 不出现无权项目标识。
- **SC-002**: 在受控测试集中，非成员对项目管理与页面管理典型写操作的 **100%** 被拒绝且无授权范围内的数据变更。
- **SC-003**: owner 与 collaborator 测试账号在各自有权项目上，列表可见性与允许的管理操作 **与验收场景一致**（抽样脚本或清单可重复执行通过）。
- **SC-004**: 权限相关拒绝场景下，用户能在 **单次交互内** 识别为「无权限」（无需猜测为系统故障或网络问题），可通过可用性抽检或支持工单类比验证。

## Constitution Alignment *(mandatory for SpecKit-tracked features)*

- **CA-001**: Success Criteria MUST stay technology-agnostic and measurable (no framework names in SC items).
- **CA-002**: If scope spans multiple Rush packages or services, the spec MUST name them (e.g. `@orangehome/server_bside`, `@orangehome/server_cside`, `web_platform`).
- **CA-003**: User stories MUST remain independently testable per this template; dependencies between stories MUST be explicit in prose.

**Scope note (CA-002)**: 本特性以 **`@orangehome/server_bside`** 对外提供的项目列表、项目管理、页面管理相关能力为主要交付范围；调用方（如 `web_platform`、`web_builder`）须使用已认证用户上下文，其行为须与上述规则一致，但前端改动不在本 spec 强制范围内，除非另行立项。

## Assumptions

- 当前用户身份已由 **既有认证机制** 建立；本特性在「已识别用户」前提下判定 **项目成员关系**。
- 项目中 **owner** 与 **collaborators** 关系已由现有数据模型或等价来源维护；本特性不重新定义成员邀请流程，除非与鉴权判定强绑定。
- 「项目管理」「页面管理」所涵盖的具体接口集合以产品/研发在 **plan** 阶段列出的清单为准；未列入清单的接口默认不在本特性范围，除非明确归类为上述两类。
- collaborator 在本阶段 **不区分** 只读与可写；若业务已有不同角色，默认 **凡称为 collaborator 且参与成员判定的身份** 均与 owner 同等通过本特性的列表与管理校验（细粒度角色另规)。
