# GSD + Cursor 工作流指南

## 目录结构

```
workspace/
├── .planning/               # GSD 规划文件
│   ├── PROJECT.md           # 项目愿景
│   ├── REQUIREMENTS.md      # 需求文档
│   ├── ROADMAP.md           # 路线图
│   ├── STATE.md             # 当前状态
│   ├── 1-CONTEXT.md         # 阶段 1 上下文
│   ├── 1-RESEARCH.md        # 阶段 1 调研
│   ├── 1-1-PLAN.md          # 阶段 1 计划 1
│   ├── 1-2-PLAN.md          # 阶段 1 计划 2
│   ├── research/            # 调研资料
│   ├── todos/               # 待办事项
│   └── archive/             # 归档
└── [你的项目代码]
```

---

## 工作流步骤

### Step 0: 项目初始化

1. **填写 PROJECT.md**
   - 描述项目是什么、解决什么问题
   - 确定技术栈

2. **填写 REQUIREMENTS.md**
   - 区分 v1.0 MVP 和后续版本
   - 明确 Out of Scope

3. **填写 ROADMAP.md**
   - 将需求拆分成阶段
   - 每个阶段应该是可交付的功能单元

### Step 1: 讨论阶段 (/gsd:discuss-phase)

**手动操作**: 自己思考或和 AI 讨论以下问题

打开 `1-CONTEXT.md`，填写：
- 本阶段要实现什么？
- 视觉/布局有什么要求？
- 交互逻辑是怎样的？
- API/数据如何设计？
- 有什么约束条件？

**提示词模板**（可发给 AI 讨论）：
```
我正在规划一个功能，请帮我梳理实现细节：

项目背景: [简述]
本阶段目标: [目标]

请问我需要考虑哪些方面？包括：
1. 视觉和布局
2. 用户交互
3. 数据结构
4. API 设计
5. 错误处理
6. 性能考虑
```

### Step 2: 规划阶段 (/gsd:plan-phase)

**手动操作**: 调研 + 制定计划

1. **调研 (1-RESEARCH.md)**
   - 搜索技术方案
   - 对比不同选项
   - 记录决策理由

2. **制定计划 (1-1-PLAN.md)**
   - 每个计划应该是原子化的（小到 30 分钟内完成）
   - 明确文件变更
   - 写明验证方法

**提示词模板**：
```
请帮我制定实现计划。

项目: [PROJECT.md 内容]
阶段目标: [CONTEXT.md 内容]

请输出：
1. 需要创建/修改哪些文件？
2. 实现步骤（详细的）
3. 如何验证功能正常？
4. 潜在风险和注意事项
```

### Step 3: Cursor 执行 (/gsd:execute-phase)

**核心流程**：

1. **打开 Cursor**，进入项目目录

2. **让 Cursor 读取规划**：
   ```
   请读取以下文件了解项目背景：
   - .planning/PROJECT.md
   - .planning/1-CONTEXT.md
   - .planning/1-1-PLAN.md
   
   然后按照计划实现功能。
   ```

3. **或使用 Composer (Cmd+I)**：
   - 把 PLAN.md 的内容粘贴进去
   - Cursor 会自动执行多步骤操作

4. **验证**：
   - 运行计划中写的验证命令
   - 手动测试功能

5. **提交**：
   ```bash
   git add .
   git commit -m "feat(1-1): [功能描述]"
   ```

### Step 4: 验证 (/gsd:verify-work)

**检查清单**：

- [ ] 功能是否按预期工作？
- [ ] 代码是否符合项目规范？
- [ ] 是否有测试覆盖？
- [ ] 是否更新了文档？

如有问题，在 Cursor 中：
```
功能有问题：[描述问题]

预期行为: 
实际行为: 

请修复。
```

### Step 5: 更新状态

1. **更新 ROADMAP.md**：标记阶段为 ✅ 已完成
2. **更新 STATE.md**：记录当前位置和决策
3. **进入下一阶段**：重复 Step 1-5

---

## 常用命令速查

### GSD 命令（手动等效）

| GSD 命令 | 手动操作 |
|---------|---------|
| `/gsd:new-project` | 填写 PROJECT.md, REQUIREMENTS.md, ROADMAP.md |
| `/gsd:discuss-phase 1` | 填写 1-CONTEXT.md |
| `/gsd:plan-phase 1` | 填写 1-RESEARCH.md 和 1-1-PLAN.md |
| `/gsd:execute-phase 1` | Cursor 执行 PLAN.md |
| `/gsd:verify-work 1` | 手动测试 + 更新 STATE.md |
| `/gsd:progress` | 查看 ROADMAP.md |
| `/gsd:add-todo` | 在 todos/ 下创建文件 |

### Cursor 提示词模板

**开始实现**：
```
请实现以下功能。先读取 .planning/PROJECT.md 和 .planning/[X]-CONTEXT.md 了解背景。

计划详情：
[粘贴 PLAN.md 内容]

要求：
1. 遵循项目现有代码风格
2. 每个步骤完成后简要说明
3. 遇到问题及时反馈
4. 完成后运行验证步骤
```

**修复 Bug**：
```
发现以下问题需要修复：

问题描述: 
复现步骤: 
预期结果: 
实际结果: 

请诊断并修复。先查看相关代码，再动手修改。
```

**重构代码**：
```
请重构以下代码，保持功能不变：

[粘贴代码]

重构目标：
- [目标 1]
- [目标 2]

注意：
1. 先理解现有逻辑
2. 逐步重构，每一步都可验证
3. 保持现有测试通过
```

---

## 最佳实践

1. **保持规划文件更新**
   - 决策变了？更新 CONTEXT.md
   - 发现新问题？添加到 STATE.md
   - 完成阶段？更新 ROADMAP.md

2. **小步快跑**
   - 每个 PLAN 控制在 30 分钟内完成
   - 频繁提交，原子化 commit
   - 有问题及时回滚

3. **善用 Cursor Agent**
   - 复杂任务用 Composer (Cmd+I)
   - 简单修改用 Chat (Cmd+L)
   - 多文件重构用 Cmd+Shift+L 选择多个文件

4. **文档即代码**
   - PLAN.md 写得越详细，Cursor 执行越准确
   - 验收标准要明确、可测试
   - 上下文文件帮助 Cursor 理解全局

---

## 示例工作流

假设你要做一个 Todo App：

1. **初始化** → 填写 PROJECT.md (Todo 管理工具，React + Node.js)

2. **需求** → REQUIREMENTS.md
   - v1.0: 增删改查 Todo
   - v1.1: 分类、标签
   - Out: 用户系统

3. **路线图** → ROADMAP.md
   - 阶段 1: 后端 API
   - 阶段 2: 前端界面
   - 阶段 3: 样式优化

4. **讨论阶段 1** → 1-CONTEXT.md
   - API 设计: RESTful
   - 数据库: SQLite
   - 字段: id, title, completed, created_at

5. **规划阶段 1** → 1-RESEARCH.md + 1-1-PLAN.md
   - 计划 1: 创建 Express 项目结构
   - 计划 2: 实现 CRUD API
   - 计划 3: 添加测试

6. **Cursor 执行**
   - 打开 Cursor，导入 PLAN.md
   - 逐个执行计划
   - 每个计划完成后 commit

7. **验证** → 测试 API，更新 STATE.md

8. **重复** → 进入阶段 2

---

*配置完成！现在你可以开始使用 GSD + Cursor 的混合工作流了。*