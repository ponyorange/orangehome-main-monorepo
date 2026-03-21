# REQUIREMENTS.md

## v1.0 (MVP) - 核心编辑器功能

### R1: 项目基础架构
- [ ] Vite + React + TypeScript 项目搭建
- [ ] Inversify 依赖注入容器配置
- [ ] 目录结构初始化（core/, extensions/, common/）
- [ ] 构建配置（edenx.config.ts）
- [ ] 类型定义系统（ISchema, IComponent 等）

**验收标准**: 
- 项目能正常 build，无类型错误
- Inversify 容器能正确绑定/解析服务

### R2: 编辑器核心 (OrangeEditor)
- [ ] OrangeEditor 单例类实现
- [ ] 生命周期管理（willMount, didMount, willUnmount）
- [ ] 扩展系统基础（Extension Contribution Provider）
- [ ] 编辑器视图渲染（mount() 方法）

**验收标准**:
- 能创建 Editor 实例并挂载到 DOM
- 生命周期钩子按正确顺序执行

### R3: Schema 数据结构与管理
- [ ] ISchema 类型定义（id, name, type, children, props）
- [ ] SchemaOperator 工具类（CRUD 操作）
- [ ] Schema 树的增删改查
- [ ] 父子节点关系管理

**验收标准**:
- 能创建嵌套的 Schema 树
- SchemaOperator 所有方法测试通过

### R4: 画布基础 (Canvas Extension)
- [ ] 画布容器组件
- [ ] 标尺系统（Ruler Extension）
- [ ] 画布缩放/平移
- [ ] 网格/辅助线显示

**验收标准**:
- 画布能正常显示，有标尺和网格
- 支持鼠标滚轮缩放

### R5: 组件选择与拖拽
- [ ] HoverSelectService - 悬停检测
- [ ] SelectService - 单选/多选逻辑
- [ ] OrangeDrag 拖拽实现
- [ ] 拖拽镜像生成
- [ ] 选中状态高亮显示

**验收标准**:
- 鼠标悬停显示高亮边框
- 点击选中，显示选中框
- 拖拽时有镜像跟随鼠标

### R6: 组件添加与删除
- [ ] 组件面板（左侧组件列表）
- [ ] 拖拽添加组件到画布
- [ ] 点击添加组件
- [ ] 删除选中组件（Delete 键）
- [ ] 复制/粘贴组件

**验收标准**:
- 从面板拖拽组件到画布能添加
- Delete 键删除选中组件
- Ctrl+C/V 复制粘贴

### R7: 组件移动与调整大小
- [ ] 组件位置拖拽移动
- [ ] 拖拽调整大小（8个方向手柄）
- [ ] 对齐辅助线（智能对齐）
- [ ] 键盘方向键微调位置

**验收标准**:
- 拖拽组件改变位置
- 拖拽边角改变大小
- 靠近其他组件时显示对齐线

### R8: 属性面板 (Props Panel)
- [ ] 属性面板容器（右侧面板）
- [ ] 选中组件属性显示
- [ ] 基础原子组件（Input, Select, Switch, Slider）
- [ ] 属性修改实时同步到 Schema

**验收标准**:
- 选中组件右侧显示属性面板
- 修改 Input 值，画布组件实时更新

### R9: 左侧栏 Tab 系统
- [ ] **竖向Tab设计** - 左侧 48px 宽竖向 tab 栏
- [ ] **Tab 可扩展** - 通过 left-panel:tabs 插槽注册新 tab
- [ ] 默认 tabs：组件、图层
- [ ] Tab 切换状态管理（zustand）
- [ ] Tab 内容动态加载

**验收标准**:
- 左侧面板显示竖向 tabs（组件、图层）
- 点击 tab 切换内容
- 新 tab 可通过插槽扩展

### R10: 组件面板 (Component Tab)
- [ ] 作为 tab 注册到 left-panel:tabs
- [ ] 组件分类显示（基础、业务）
- [ ] 组件搜索
- [ ] 拖拽/点击添加组件

**验收标准**:
- 在"组件"tab 中显示组件列表
- 支持拖拽添加组件

### R11: 图层管理 (Layer Tab)
- [ ] 作为 tab 注册到 left-panel:tabs
- [ ] 图层树显示（竖向树形结构）
- [ ] 图层选中同步
- [ ] 图层拖拽排序
- [ ] 显示/隐藏图层
- [ ] 锁定/解锁图层

**验收标准**:
- 在"图层"tab 中显示组件层级
- 拖拽图层改变组件顺序

### R12: Schema 渲染器 (SchemaRenderer)
- [ ] SchemaRenderer 包装组件
- [ ] BaseSchemaRenderer 运行时
- [ ] ComponentManager 组件加载
- [ ] 本地静态组件渲染

**验收标准**:
- Schema 能渲染成实际 UI
- 组件 props 正确传递

### R13: 撤销/重做 (Undo/Redo)
- [ ] 操作历史栈
- [ ] 撤销（Ctrl+Z）
- [ ] 重做（Ctrl+Y/Ctrl+Shift+Z）
- [ ] 历史记录限制（最多50步）

**验收标准**:
- 任何修改都能撤销
- 撤销后能重做

### R14: 预览与导出
- [ ] 预览模式（隐藏编辑 UI）
- [ ] 导出 Schema JSON
- [ ] 导入 Schema JSON
- [ ] 页面渲染（只读模式）

**验收标准**:
- 预览按钮隐藏编辑器 UI，只显示页面
- 导出的 JSON 能正确导入还原

---

## v1.1 - 高级编辑器功能

### R15: 远程组件加载
- [ ] 远程组件配置管理
- [ ] 动态加载远程 JS/CSS
- [ ] 远程组件缓存
- [ ] 组件版本管理

### R16: 高级原子组件
- [ ] ColorPick - 颜色选择器
- [ ] ImageUpload - 图片上传
- [ ] RichText - 富文本编辑器
- [ ] DatePicker - 日期选择
- [ ] ArrayEditor - 数组编辑器
- [ ] BorderConfig - 边框配置

### R17: 事件与动作
- [ ] 事件绑定配置（点击、hover 等）
- [ ] 动作配置（跳转、弹窗、API 调用）
- [ ] event2action 数据结构设计

### R18: API 数据源
- [ ] API 配置面板
- [ ] 数据绑定到组件 props
- [ ] 请求参数配置
- [ ] 响应数据处理

### R19: 国际化 (i18n)
- [ ] 多语言支持
- [ ] StarlingPicker 集成
- [ ] 语言切换

### R20: 性能监控
- [ ] EditorPerfTracker 集成
- [ ] Tea/Slardar 上报
- [ ] 首屏渲染时间追踪

---

## 明确排除 (Out of Scope) - 暂不实现

- ❌ 用户系统/登录
- ❌ 多用户协作编辑
- ❌ 版本历史管理
- ❌ 团队协作功能
- ❌ 云端存储/自动保存
- ❌ 代码编辑器（Monaco 集成）
- ❌ 自定义组件开发工具
- ❌ 响应式布局编辑器

---

## 技术债务/重构

- [ ] 类型定义文件拆分
- [ ] 单元测试覆盖率达到 70%
- [ ] E2E 测试（关键路径）
- [ ] 文档完善（README + API 文档）
