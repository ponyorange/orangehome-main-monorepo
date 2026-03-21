# STATE.md

## 当前位置

**当前里程碑**: 里程碑 1: v1.0 MVP

**当前阶段**: 阶段 12 - SchemaRenderer 完善 ✅ 已完成

**当前任务**: 阶段 12-1: 组件管理、远程组件、事件绑定、性能优化 - 已完成

**下一步**: 全部主线阶段已完成

---

## 验收状态

### 阶段 1-1 验收标准

- [x] `rush update` 成功安装依赖
- [x] `rushx type-check` 通过，无 TS 错误
- [x] `vite build` 成功（产物包含 ESM 和 CJS）
- [x] 开发服务器能启动（使用 usePolling 模式避免文件监控限制）

### 阶段 1-2 验收标准

- [x] Inversify 容器能正确创建
- [x] `@injectable()` 装饰器工作正常
- [x] 服务能被正确绑定和解析
- [x] ContributionProvider 模式可用
- [x] 基础类型定义完整（ISchema, IStoreState 等）
- [x] 无 TypeScript 类型错误
- [x] 构建产物包含类型声明

### 阶段 1-3 验收标准

- [x] SlotRegistry 能注册和查询插槽
- [x] SlotRenderer 组件能渲染插槽内容
- [x] ExtensionLoader 能按依赖顺序加载扩展
- [x] EventBus 事件收发正常
- [x] OrangeEditor 能定义核心插槽
- [x] 扩展能通过 context 注册插槽
- [x] 无 TypeScript 错误
- [x] 构建产物符合 Rush 规范
- [x] 基础扩展占位已创建

### 阶段 2-1 验收标准

- [x] SlotRenderer 支持 direction 属性（horizontal/vertical）
- [x] LeftPanel 显示竖向 tab 栏（48px 宽）
- [x] LeftPanel 有独立的状态管理（zustand）
- [x] TabButton 显示图标和文字，有 active 状态
- [x] 点击 tab 可以切换（状态变化）
- [x] Header, RightPanel, CenterCanvas 正常渲染
- [x] EditorView 显示完整的三栏布局
- [x] 无 TypeScript 错误
- [x] 浏览器中能看到竖向 tab 设计

### 阶段 2-2 验收标准

- [x] Logo 显示在 Header 左侧
- [x] Toolbar 显示在 Header 中间
- [x] Actions 显示在 Header 右侧
- [x] **LeftPanel 显示竖向 Tabs**（组件、图层）
- [x] 点击 Tab 可以切换 active 状态
- [x] ComponentTab 注册到 left-panel:tabs
- [x] LayerTab 注册到 left-panel:tabs
- [x] 默认显示组件面板内容
- [x] PropertiesPanel 显示在右侧面板
- [x] 无 TypeScript 错误
- [x] 浏览器中能看到完整的竖向Tab编辑器界面

### 阶段 3-1 验收标准

- [x] ISchema 类型定义完整（含 ICSSRule, IEvent2Action, IApiInSchema）
- [x] SchemaOperator 方法实现正确
- [x] 操作保持不可变性
- [x] findById / findParentById / findPathById 实现
- [x] updateProps / updateStyle 实现
- [x] addChild / removeById 实现
- [x] moveNode / duplicateNode 实现
- [x] flatten / validate / serialize / deserialize 实现
- [x] 无 TypeScript 错误

### 阶段 3-2 验收标准

- [x] SchemaRenderer 组件实现
- [x] ComponentManager 组件映射
- [x] 基础组件 (Text, Image, Container) 注册
- [x] Schema 能渲染到画布
- [x] 画布显示示例 Schema 内容

### 阶段 4-1 验收标准

- [x] 画布能正确显示 Schema 内容
- [x] 支持缩放按钮（+ / - / 重置）
- [x] 支持 Ctrl/Cmd + 滚轮缩放
- [x] 网格背景显示（虚线网格）
- [x] 显示当前缩放比例（100%）
- [x] 画布尺寸显示（375x667）
- [x] 画布带阴影边框，美观展示

### 阶段 4-2 验收标准

- [x] 顶部水平标尺显示正确（0, 50, 100... 刻度）
- [x] 左侧垂直标尺显示正确（0, 50, 100... 刻度）
- [x] 标尺随画布缩放同步变化
- [x] 刻度清晰可读
- [x] 左上角空白区域正确
- [x] TypeScript 编译通过

### 阶段 5-2 验收标准

- [x] 组件面板显示 3 个基础组件卡片（文本、图片、容器）
- [x] 拖拽时显示半透明镜像
- [x] 拖拽距离阈值(5px)生效
- [x] 释放在画布上时添加组件到 Schema 树
- [x] 释放在画布外时不添加组件
- [x] 新增组件自动选中
- [x] 多次拖入同类型组件 ID 唯一
- [x] TypeScript 编译通过

---

## 决策记录

| 日期 | 决策 | 原因 |
|-----|------|------|
| 2026-03-12 | 使用 GSD + Cursor 混合工作流 | 系统规划 + AI 执行效率最高 |
| 2026-03-12 | 选择 Inversify 做依赖注入 | 成熟的 IoC 容器，支持装饰器 |
| 2026-03-12 | 使用 Semi Design UI 库 | 字节跳动开源，组件丰富 |
| 2026-03-12 | Schema 驱动架构 | 页面结构完全由 JSON 描述，编辑器只操作数据 |
| 2026-03-16 | Tab 内容动态注册 | 延迟加载，性能优化 |
| 2026-03-16 | Schema 操作不可变性 | 便于撤销重做，避免副作用 |
| 2026-03-17 | 标尺对齐画布左上角 | 画布水平居中，垂直偏移 50px，标尺 0 点对齐画布左上角 |

---

## 阻塞项

暂无

---

## 待确认事项

- [ ] 是否需要 SSR 支持？
- [ ] 远程组件加载的 CORS 策略？
- [ ] 是否使用 pnpm workspace？

---

## 笔记

### 架构要点

1. **Extension 系统** 是核心 - 所有功能都应该是 Extension，Editor Core 只负责调度和生命周期

2. **Schema 是单一数据源** - 任何 UI 变化都要先修改 Schema，然后 UI 响应 Schema 变化

3. **不可变性原则** - 所有 Schema 操作返回新对象，不修改原对象，便于实现撤销重做

4. **性能考虑** - 
   - Schema 树可能很深，遍历时要注意性能
   - 拖拽时要做节流
   - 属性面板修改可能很频繁，要做防抖

5. **类型安全** - 所有 props 都要严格类型定义，避免运行时错误

### 参考实现

- 类似项目: formilyjs/designable, lowcode-engine
- 拖拽参考: react-dnd, @dnd-kit
- 状态管理: Zustand 足够轻量，不需要 Redux Toolkit 的复杂场景

---

## 阶段 1-1 完成情况

**日期**: 2026-03-14
**位置**: `/workspace/projects/workspace/main-monorepo/`

**完成任务**:
1. ✅ 创建 `main-monorepo/apps/web_builder/` 目录结构
2. ✅ 初始化所有配置文件（package.json, tsconfig.json, vite.config.ts, modern.config.ts）
3. ✅ 创建入口文件（index.ts, main.tsx, vite-env.d.ts）
4. ✅ 创建 index.html 开发页面
5. ✅ 更新 rush.json 添加项目
6. ✅ 创建核心文件占位实现（Editor, SlotRegistry, ExtensionLoader, EventBus）
7. ✅ 复制 `.planning` 目录到 main-monorepo

**验收结果**:
- ✅ `rush update` 成功安装依赖
- ✅ `rushx type-check` 通过，无 TS 错误
- ✅ `rushx dev` 启动成功，服务器运行于 http://localhost:5173
- ⚠️ React 组件渲染有运行时问题（不影响阶段 1-1 完成，后续阶段修复）

---

## 阶段 1-2 完成情况

**日期**: 2026-03-14
**位置**: `/workspace/projects/workspace/main-monorepo/apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/core/container/index.ts` - 默认容器配置
2. ✅ 创建 `src/core/container/decorators.ts` - 装饰器导出
3. ✅ 创建 `src/core/types/contribution.ts` - 贡献点类型系统
4. ✅ 创建 `src/core/services/EditorService.ts` - 编辑器服务
5. ✅ 创建 `src/core/services/StoreService.ts` - 状态服务
6. ✅ 创建 `src/types/base/index.ts` - 基础类型定义（ISchema, IComponentNode, IEditorOptions 等）
7. ✅ 创建 `src/types/store/index.ts` - 状态类型定义（IStoreState, IEditorState 等）
8. ✅ 创建 `src/types/extension/index.ts` - 扩展类型定义（IExtension, IExtensionContext 等）
9. ✅ 修复 `src/index.ts` 导出配置
10. ✅ 修复类型冲突（删除重复的 base.ts 文件）

---

## 阶段 1-3 完成情况

**日期**: 2026-03-14
**位置**: `/workspace/projects/workspace/main-monorepo/apps/web_builder/`

**完成任务**:
1. ✅ 更新 `src/core/slots/types.ts` - 添加 order、weight、parent 字段
2. ✅ 更新 `src/core/slots/SlotRegistry.ts` - 添加 @injectable(), defineSlot, registerContent, unregisterContent, hasSlot 方法
3. ✅ 创建 `src/core/slots/SlotRenderer.tsx` - 插槽渲染组件
4. ✅ 更新 `src/core/extensions/types.ts` - 添加 dependencies, activate, deactivate, 完整 IExtensionContext
5. ✅ 更新 `src/core/extensions/ExtensionLoader.ts` - 添加依赖拓扑排序、activateAll、deactivateAll、destroyAll
6. ✅ 更新 `src/core/events/EventBus.ts` - 添加 @injectable()
7. ✅ 更新 `src/core/editor.ts` - 添加 defineCoreSlots、getExtensions、完整生命周期管理
8. ✅ 删除旧的 `src/core/editor.tsx`
9. ✅ 创建扩展占位
10. ✅ 创建工具文件（id.ts, clone.ts, SchemaOperator）
11. ✅ 更新 `src/index.ts` 导出
12. ✅ 修复类型错误

---

## 阶段 2-1 完成情况

**日期**: 2026-03-16
**位置**: `/workspace/projects/workspace/main-monorepo/apps/web_builder/`

**完成任务**:
1. ✅ 更新 SlotRenderer 组件 - 添加 direction 属性支持竖向布局
2. ✅ 创建左侧栏状态管理 store.ts
3. ✅ 创建 TabButton 组件
4. ✅ 创建 LeftPanel 组件
5. ✅ 创建 Header、RightPanel、CenterCanvas 组件
6. ✅ 创建 EditorView 组件
7. ✅ 更新 editor.ts 集成 EditorView

---

## 阶段 2-2 完成情况

**日期**: 2026-03-16
**位置**: `/workspace/projects/workspace/main-monorepo/apps/web_builder/`

**完成任务**:
1. ✅ Logo 扩展
2. ✅ Toolbar 扩展
3. ✅ Actions 扩展
4. ✅ ComponentTab 扩展（含组件面板）
5. ✅ LayerTab 扩展（含图层树）
6. ✅ PropertiesPanel 扩展
7. ✅ 添加 tab 切换事件
8. ✅ 配置默认扩展列表

---

## 阶段 3-1 完成情况

**日期**: 2026-03-16
**位置**: `/workspace/projects/workspace/main-monorepo/apps/web_builder/`

**完成任务**:
1. ✅ 完善 ISchema 类型定义
   - 添加 ICSSRule 接口（CSS 样式规则）
   - 添加 IEvent2Action 接口（事件动作绑定）
   - 添加 IApiInSchema 接口（API 数据配置）
   - 更新 ISchema 接口，包含所有新字段
2. ✅ 实现 SchemaOperator 工具
   - findById - 递归查找节点
   - findParentById - 查找父节点
   - findPathById - 查找节点路径
   - updateProps - 不可变更新属性
   - updateStyle - 不可变更新样式
   - addChild - 添加子节点
   - removeById - 删除节点
   - moveNode - 移动节点
   - duplicateNode - 复制节点
   - flatten - 展平 Schema
   - validate - 验证 Schema
   - serialize / deserialize - 序列化/反序列化
3. ✅ 已有工具文件检查
   - id.ts - 已有 generateId / generateIdWithPrefix
   - clone.ts - 已有 deepClone

**验收结果**:
- ✅ `rushx type-check` 通过，无 TS 错误
- ✅ SchemaOperator 所有方法实现完成
- ✅ 所有操作保持不可变性
- ✅ 完整类型导出

**技术决策**:
- 所有 Schema 操作方法都是纯函数，不修改原对象
- 使用递归实现树操作，简单直观
- cloneSchema 辅助函数确保深拷贝

---

## 阶段 4-2 完成情况

**日期**: 2026-03-17
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/extensions/ruler/hooks/useRuler.ts` - 标尺刻度计算 Hook
2. ✅ 创建 `src/extensions/ruler/components/Ruler.tsx` - 基础标尺组件（Canvas 绘制）
3. ✅ 创建 `src/extensions/ruler/components/RulerX.tsx` - 水平标尺组件
4. ✅ 创建 `src/extensions/ruler/components/RulerY.tsx` - 垂直标尺组件
5. ✅ 创建 `src/extensions/ruler/index.ts` - 标尺模块导出
6. ✅ 修改 `src/extensions/ui/center-canvas/components/CenterCanvas.tsx`
   - 集成水平标尺（顶部）
   - 集成垂直标尺（左侧）
   - 标尺随缩放同步变化

**修复记录**:
- ✅ 修复标尺随缩放更新问题（使用 ResizeObserver）
- ✅ 修复标尺与画布对齐问题（画布左上角对齐标尺 0 点）
- ✅ 添加滚动边距支持（CANVAS_MARGIN = 200px）
- ✅ 画布水平居中布局（动态计算偏移量）
- ✅ 画布垂直偏移 50px（VERTICAL_OFFSET = 50）
- ✅ 标尺精确对齐画布左上角（scrollX/scrollY 减去偏移量）
- ✅ 画布末尾刻度显示（375, 667）用蓝色突出标记

**验收结果**:
- ✅ 顶部水平标尺显示刻度（0, 50, 100...）
- ✅ 左侧垂直标尺显示刻度（0, 50, 100...）
- ✅ 标尺随画布缩放同步更新
- ✅ 画布水平居中显示
- ✅ 画布左上角对齐标尺 0 点
- ✅ 画布垂直距离标尺 50px
- ✅ 支持滚动画布查看更大区域
- ✅ TypeScript 编译通过

---

## 阶段 4-1 完成情况

**日期**: 2026-03-17
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/extensions/canvas/hooks/useZoom.ts` - 画布缩放 Hook
   - zoom 状态管理（0.25x - 3.0x）
   - zoomIn / zoomOut / resetZoom / setZoom 方法
   - Ctrl/Cmd + 滚轮缩放支持
2. ✅ 创建 `src/extensions/canvas/components/Grid.tsx` - 网格组件
   - SVG 虚线网格
   - 根据画布尺寸动态生成
3. ✅ 创建 `src/extensions/canvas/components/Ruler.tsx` - 标尺组件
   - 水平和垂直方向支持
   - 显示刻度数值
4. ✅ 修改 `src/extensions/ui/center-canvas/components/CenterCanvas.tsx`
   - 集成缩放控制按钮（+ / - / 重置）
   - 集成网格背景
   - 集成 Schema 渲染
   - 画布尺寸 375x667（iPhone 8 尺寸）
   - 显示缩放比例和画布尺寸

**验收结果**:
- ✅ 画布正确显示 Schema 内容（"欢迎使用 Orange Editor" / "这是一个低代码编辑器"）
- ✅ 缩放按钮正常工作
- ✅ 网格背景显示
- ✅ TypeScript 编译通过

---

## 阶段 3-2 完成情况

**日期**: 2026-03-17
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/common/components/SchemaRenderer/index.tsx` - Schema 渲染器
2. ✅ 创建 `src/common/components/SchemaRenderer/ComponentManager.ts` - 组件映射管理
3. ✅ 创建 `src/common/components/SchemaRenderer/BaseComponents.tsx` - 基础组件 (Text, Image, Container)
4. ✅ 创建 `src/core/store/schemaStore.ts` - Schema 状态管理 (zustand)
5. ✅ 集成 SchemaRenderer 到 CenterCanvas 画布
6. ✅ 默认示例 Schema 渲染验证

**验收结果**:
- ✅ Schema 能正确渲染为 UI
- ✅ 画布显示「欢迎使用 Orange Editor」「这是一个低代码编辑器」
- ✅ 支持 Text、Image、Container 三种基础组件类型

---

## 阶段 2 完成总结

**阶段 2 - 插槽化架构（含竖向Tab左侧栏）** 已完成！

**里程碑 1 进度**: 55% (5.5/10 阶段)

**下一步**: 阶段 5-2 - 拖拽系统实现

---

## 阶段 5-1 完成情况

**日期**: 2026-03-17
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/extensions/select-and-drag/services/HoverSelectService.ts`
   - @injectable() 装饰器
   - hoverId, selectedIds 状态管理
   - select(), hover(), clear() 方法
   - 事件通知系统（EventEmitter2）

2. ✅ 创建 `src/extensions/select-and-drag/components/SelectionBox.tsx`
   - 选中框边框（蓝色表示选中，橙色表示多选）
   - 尺寸标签（显示 width × height）
   - 组件 ID 标签
   - 8 方向调整手柄

3. ✅ 创建 `src/extensions/select-and-drag/hooks/useSelection.ts`
   - useSelection - 配合 HoverSelectService 使用
   - useSimpleSelection - 独立状态管理
   - 点击、悬停事件处理
   - Ctrl+点击多选支持

4. ✅ 创建 `src/common/components/SchemaRenderer/SelectableComponents.tsx`
   - SelectableSchemaNode - 可选择节点组件
   - SelectableContainer - 可选择容器组件
   - 悬停高亮边框、选中边框效果
   - 选中框显示

5. ✅ 创建 `src/common/components/SchemaRenderer/SelectableSchemaRenderer.tsx`
   - 可选择 Schema 渲染器
   - SelectionContext 上下文
   - 递归渲染可选择节点

6. ✅ 集成到 `CenterCanvas`
   - 使用 SelectableSchemaRenderer 替换普通 SchemaRenderer

**验收结果**:
- ✅ 鼠标悬停显示高亮边框（蓝色虚线）
- ✅ 点击选中组件显示选中框（蓝色实线）
- ✅ Ctrl+点击多选支持
- ✅ 选中框显示尺寸标签
- ✅ 选中框显示 8 方向调整手柄
- ✅ TypeScript 编译通过

---

## 阶段 5-2 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/common/base/OrangeDrag/types.ts` - 拖拽类型定义
   - DragData, OrangeDragOptions, DragCallbacks, DragEvent
2. ✅ 创建 `src/common/base/OrangeDrag/index.ts` - OrangeDrag 核心拖拽引擎
   - 自定义 mousedown/mousemove/mouseup 事件处理
   - 5px 拖拽阈值检测
   - 半透明镜像 DOM 创建和跟随
   - 模块级 subscribeDrag 发布订阅机制
3. ✅ 创建 `src/extensions/features/component-tab/catalog.ts` - 组件目录
   - ComponentCatalogItem 接口
   - 3 个基础组件：文本(Text)、图片(Image)、容器(Container)
   - createSchema 工厂函数（每次生成唯一 ID）
4. ✅ 创建 `src/extensions/features/component-tab/components/DraggableComponentItem.tsx`
   - 可拖拽组件卡片（图标 + 名称）
   - onMouseDown 触发 OrangeDrag.start()
   - 悬停效果（主题色边框 + 浅色背景）
5. ✅ 更新 `src/extensions/features/component-tab/components/ComponentPanel.tsx`
   - 用组件卡片网格（3列）替换占位符
   - 搜索过滤功能
6. ✅ 创建 `src/extensions/ui/center-canvas/hooks/useCanvasDrop.ts` - 画布放置 hook
   - subscribeDrag 订阅拖拽事件
   - getBoundingClientRect 检测画布区域
   - addChild + setSchema 更新 Schema 树
   - 放置后自动选中新组件
7. ✅ 修改 `src/extensions/ui/center-canvas/components/CenterCanvas.tsx`
   - 集成 useCanvasDrop hook
   - 拖拽到画布时显示主题色阴影指示器

**验收结果**:
- ✅ 组件面板显示 3 个基础组件卡片（文本、图片、容器）
- ✅ 搜索过滤组件功能
- ✅ 拖拽时显示半透明镜像跟随鼠标
- ✅ 拖拽阈值(5px)生效
- ✅ 释放在画布上时组件被添加到 Schema 树
- ✅ 画布放置指示器（主题色发光边框）
- ✅ 新增组件自动选中
- ✅ 多次拖入同类型组件 ID 唯一
- ✅ TypeScript 编译通过，无控制台错误

**技术决策**:
- 使用自定义 mousedown/mousemove/mouseup 而非 HTML5 DnD，获得更好的控制力
- 模块级 subscribeDrag 发布订阅模式，无需引入额外依赖
- catalog 使用 createSchema 工厂函数，确保每次拖放生成新 ID

---

## 阶段 6 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 补充 Button 组件到 catalog 和 BaseComponents
   - 在 `catalog.ts` 的 `basicComponents` 中添加 Button 项
   - 在 `BaseComponents.tsx` 中实现 ButtonComponent 并注册
2. ✅ 创建 `src/core/store/clipboardStore.ts` - 剪贴板 Store (Zustand)
   - `copiedNodes` 存储深拷贝节点
   - `copy(nodes)` / `paste()` / `clear()` / `hasCopied()`
   - `paste()` 自动生成新 ID（递归 cloneWithNewIds）
3. ✅ 创建 `src/extensions/editing/keyboard-shortcuts/components/KeyboardShortcuts.tsx`
   - 纯逻辑 React 组件（渲染 null），挂在 SelectionContext.Provider 内
   - Delete / Backspace → 删除选中组件
   - Ctrl+C → 复制选中组件到剪贴板
   - Ctrl+V → 粘贴（添加到选中组件的父容器，无选中时添加到根节点）
   - Ctrl+X → 剪切（复制 + 删除）
   - Ctrl+D → 快速复制（duplicateNode）
   - 忽略 input/textarea/contentEditable 内的按键
4. ✅ 创建 `src/extensions/editing/context-menu/components/ContextMenu.tsx`
   - 绝对定位右键菜单（fixed positioning）
   - 菜单项：复制 / 粘贴 / 剪切 / 复制一份 / 删除
   - 每项显示快捷键提示文字
   - 点击菜单外或按 Escape 关闭
   - 自动调整位置避免超出屏幕
5. ✅ 修改 `SelectableSchemaRenderer.tsx` - SelectionContext 添加 handleContextMenu
6. ✅ 修改 `SelectableComponents.tsx` - onContextMenu 事件处理
   - SelectableSchemaNode 和 SelectableContainer 添加右键菜单触发
7. ✅ 修改 `CenterCanvas.tsx` - 集成 KeyboardShortcuts 和 ContextMenu
   - 右键菜单状态管理（position + targetId）
   - 右键时自动选中目标组件
   - KeyboardShortcuts 作为 Provider 内子组件

**验收结果**:
- ✅ 组件面板新增 Button 组件卡片
- ✅ Delete 键删除选中组件
- ✅ Ctrl+C 复制，Ctrl+V 粘贴（粘贴到原位置旁边，新 ID）
- ✅ Ctrl+X 剪切
- ✅ Ctrl+D 快速复制
- ✅ 右键菜单显示操作选项（含快捷键提示）
- ✅ 在 input/textarea 中按快捷键不触发编辑操作
- ✅ 删除/粘贴后选中状态正确更新
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- KeyboardShortcuts 作为 React 组件（渲染 null）而非独立服务，直接通过 useSelectionContext 获取选中状态
- ContextMenu 使用 fixed 定位 + 自动边界检测
- clipboardStore 使用 Zustand，paste() 递归生成新 ID 避免冲突
- handleContextMenu 通过 SelectionContext 传递，保持组件间松耦合

---

## 阶段 7-1 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/extensions/select-and-drag/hooks/useMove.ts` - 拖拽移动 hook
   - mousedown → mousemove → mouseup 全流程
   - 3px 拖拽阈值防止误触
   - 更新 schema `props.style.marginTop` / `props.style.marginLeft`
   - `nudge()` 方法供键盘微调使用
2. ✅ 创建 `src/extensions/select-and-drag/hooks/useResize.ts` - 8方向调整大小 hook
   - 支持 8 个方向：n/s/e/w/ne/nw/se/sw
   - Shift 键等比缩放
   - 最小尺寸限制（20x20）
   - 北/西方向拖拽时同步更新 marginTop/marginLeft
3. ✅ 升级 `src/extensions/select-and-drag/components/SelectionBox.tsx`
   - 从 4 个角手柄扩展到 8 个方向手柄（4 角 + 4 边中点）
   - 手柄 `pointerEvents: 'auto'`，可交互
   - 每个手柄有对应方向的 cursor
   - 新增 `onResizeStart` 和 `onMoveStart` 回调 props
4. ✅ 扩展 `KeyboardShortcuts` 组件 - 方向键微调
   - Arrow Up/Down/Left/Right → 移动 1px
   - Shift + Arrow → 移动 10px
   - 通过修改 `marginTop` / `marginLeft` 实现
5. ✅ 创建 `src/extensions/select-and-drag/services/AlignmentService.ts` - 对齐检测
   - `computeAlignLines()` 计算当前移动组件与其他组件的对齐关系
   - 检测 10 种对齐情况：上/下/左/右/中心 × 2
   - 画布中心线对齐
   - 5px 吸附阈值
   - 去重返回唯一辅助线
6. ✅ 创建 `src/extensions/select-and-drag/components/AlignmentGuides.tsx` - 辅助线渲染
   - 水平/垂直虚线辅助线
   - 主题色渲染
   - `pointerEvents: 'none'` 不影响交互
7. ✅ 修改 `SelectableSchemaRenderer.tsx` - Context 添加 onMoveStart / onResizeStart
8. ✅ 修改 `SelectableComponents.tsx`
   - SelectableSchemaNode 和 SelectableContainer 支持 move/resize 回调
   - 选中状态 cursor 改为 `move`
   - onMouseDown 触发移动开始
   - SelectionBox 传递 resize/move 回调
9. ✅ 修改 `CenterCanvas.tsx`
   - 集成 useMove、useResize hooks
   - 通过 SelectionContext 传递 move/resize 回调
   - 集成 AlignmentGuides 组件
   - mousemove 时实时计算对齐线（RAF 节流）
   - mouseup 时清除对齐线

**验收结果**:
- ✅ 选中组件可拖拽移动
- ✅ 8 方向手柄调整大小
- ✅ Shift 键等比缩放
- ✅ 键盘方向键微调（1px / Shift+10px）
- ✅ 对齐辅助线显示
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- 组件位置通过 `marginTop` / `marginLeft` 实现偏移（保持流式布局兼容）
- 尺寸通过 `width` / `height` 直接控制
- useMove/useResize 使用 document 级 mousemove/mouseup 监听（避免快速移动丢失事件）
- 对齐辅助线基于 DOM getBoundingClientRect 实时计算（无需维护额外坐标系统）
- requestAnimationFrame 节流对齐计算（避免性能问题）

---

## 阶段 8 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/core/store/selectionStore.ts` - 全局选中状态 Store (Zustand)
   - PropertiesPanel 通过此 store 获取选中组件 ID
   - CenterCanvas 同步 selectedIds 到此 store
2. ✅ 创建 `src/extensions/features/properties-panel/configs/types.ts` - 属性配置类型
   - FieldConfig: 支持 text/number/select/switch/slider/color/image 7 种字段类型
   - ComponentConfig: 分组结构（groups → fields）
3. ✅ 创建 `src/extensions/features/properties-panel/configs/index.ts` - 组件配置映射
   - Text: 文本内容 + 文字样式（字号/粗体/颜色/对齐/行高）
   - Image: 图片地址 + 替代文本 + 填充方式 + 圆角
   - Button: 按钮文字 + 字号/颜色/背景色/圆角/边框颜色
   - Container: 内边距/背景色/圆角/边框样式/最小高度
4. ✅ 创建 `PropertyForm.tsx` - 动态属性表单
   - 根据 ComponentConfig 动态生成表单
   - 支持嵌套属性路径（如 `style.fontSize`）
   - 实时双向绑定，修改即时同步到画布
5. ✅ 创建 `StyleForm.tsx` - 通用样式配置
   - 布局：宽度/高度
   - 位置偏移：marginTop/Left/Bottom/Right
   - 内边距：padding 四方向
   - 外观：背景色/透明度/圆角
6. ✅ 创建 `ColorPicker.tsx` - 颜色选择器
   - 原生 input[type=color] + 文本输入结合
   - 颜色预览色块
   - 支持 HEX/RGB/颜色名
7. ✅ 创建 `ImageInput.tsx` - 图片输入
   - URL 文本输入
   - 缩略图预览
8. ✅ 重写 `PropertiesPanel.tsx`
   - 选中单个组件时显示属性/样式双标签页
   - 组件类型标签 + 名称 + ID
   - 空状态：多选提示或"请选择组件"
   - 属性面板根据组件类型动态渲染配置表单
9. ✅ 修改 `CenterCanvas.tsx` - 同步选中状态到 selectionStore

**验收结果**:
- ✅ 属性面板正确显示选中组件信息
- ✅ 选中组件属性可编辑，修改实时同步到画布
- ✅ 属性/样式双标签页分离展示
- ✅ 4 种组件类型（Text/Image/Button/Container）均有完整配置
- ✅ 基础原子组件工作正常（Input/InputNumber/Select/Switch/Slider）
- ✅ 高级原子组件工作正常（ColorPicker/ImageInput）
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- selectionStore（Zustand）桥接 CenterCanvas 内部的选中状态到外部 PropertiesPanel
- 属性配置使用声明式 `ComponentConfig` 结构，便于扩展新组件
- 嵌套属性路径（`style.fontSize`）通过 getNestedValue/setNestedValue 工具函数处理
- PropertyForm 通过 `updateProps` 直接替换整个 props 对象实现更新
- ColorPicker 结合原生颜色选择器和文本输入，兼顾易用性和精确控制

---

## 阶段 9-1 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 重构选中状态为全局共享
   - `selectionStore` 新增 `clearSelectedIds`
   - `useSimpleSelection` 改为直接读写全局 `selectedIds`
   - 画布选中、属性面板、图层树三处状态统一
2. ✅ 创建 `src/extensions/features/layer-tab/hooks/useLayerTree.ts`
   - 从 Schema 递归生成图层树结构
   - 提供 `selectNode` / `toggleVisible` / `toggleLocked`
   - 提供 `moveLayer` 拖拽排序与跨层级移动
3. ✅ 创建 `LayerPanel.tsx`
   - 图层面板头部和计数展示
4. ✅ 创建 `LayerItem.tsx`
   - 递归图层项 UI
   - 显示组件类型图标、名称
   - 选中态高亮
   - 显隐/锁定按钮
   - 拖拽前/后/内部三种落点提示
5. ✅ 重写 `LayerTree.tsx`
   - 递归渲染树
   - 默认展开全部节点
   - 点击图层项同步选中画布组件
   - HTML5 拖拽排序
6. ✅ 接入显隐与锁定到画布
   - `BaseComponents` 中 `visible === false` 时不渲染
   - `SelectableComponents` 中 `locked === true` 时禁止点击/右键/拖拽/缩放
   - 锁定态显示 `not-allowed` 光标
7. ✅ 更新 `layer-tab/index.ts` 导出新组件和 hook

**验收结果**:
- ✅ 图层树正确显示组件层级
- ✅ 点击图层项可选中画布组件
- ✅ 图层拖拽排序工作
- ✅ 支持跨层级移动到容器内
- ✅ 显隐功能正常作用于画布渲染
- ✅ 锁定功能正常作用于画布交互
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- 图层树使用递归自定义实现，避免引入额外树组件依赖
- 拖拽排序基于 HTML5 drag/drop + 三段式落点判断（before/after/inside）
- 选中状态统一收敛到 `selectionStore`，避免多处状态源不一致
- 显隐/锁定状态直接存储在节点 `props.visible` / `props.locked`

---

## 阶段 10-1 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/extensions/undo-redo/types.ts`
   - `HistoryState` 接口
   - `Command` 接口
2. ✅ 创建 `src/extensions/undo-redo/services/HistoryService.ts`
   - 历史快照栈
   - 当前位置指针
   - 最大 50 条限制
   - `init()` / `record()` / `undo()` / `redo()` / `canUndo()` / `canRedo()`
3. ✅ 改造 `src/core/store/schemaStore.ts`
   - 接入 `historyService`
   - `setSchema()` 自动记录历史
   - 新增 `canUndo` / `canRedo`
   - 新增 `undo()` / `redo()`
4. ✅ 创建 `src/extensions/undo-redo/components/UndoRedoButtons.tsx`
   - 读取 store 的撤销/重做状态
   - 根据 `canUndo` / `canRedo` 自动禁用
5. ✅ 修改 `Actions.tsx`
   - 用真实 `UndoRedoButtons` 替换原本空按钮
6. ✅ 修改 `KeyboardShortcuts.tsx`
   - `Ctrl+Z` → undo
   - `Ctrl+Y` → redo
   - `Ctrl+Shift+Z` → redo

**验收结果**:
- ✅ 所有基于 `setSchema` 的操作都可撤销
- ✅ 撤销后可重做
- ✅ 历史记录限制为 50 条
- ✅ 撤销/重做按钮可用且有禁用态
- ✅ 快捷键 `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` 生效
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- 历史记录采用 Schema 快照栈而不是复杂命令回放，接入成本最低
- 统一在 `schemaStore.setSchema()` 层记录历史，避免每个功能各自接历史逻辑
- 通过 `canUndo` / `canRedo` 直接驱动头部按钮禁用态
- 使用 `JSON.stringify` 比较快照变化，保证相同 Schema 不重复入栈

---

## 阶段 11-1 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 创建 `src/core/store/previewStore.ts`
   - 预览模式开关
   - 设备类型切换（手机/平板/桌面）
2. ✅ 创建 `src/core/components/Preview.tsx`
   - 纯预览模式视图
   - 隐藏编辑器 UI
   - 设备模拟框
   - 返回编辑按钮
3. ✅ 修改 `EditorView.tsx`
   - 根据 `isPreviewMode` 在编辑视图和预览视图之间切换
4. ✅ 创建 `src/core/services/ExportService.ts`
   - `exportToJSON()` 下载 JSON 文件
   - `copyToClipboard()` 复制 Schema 到剪贴板
   - `generateShareLink()` 生成可分享链接
5. ✅ 创建 `src/core/services/ImportService.ts`
   - `importFromFile()` 从文件导入
   - `importFromJSON()` 从 JSON 字符串导入
   - `validateSchema()` 校验 Schema
6. ✅ 修改 `Toolbar.tsx`
   - 预览按钮打开预览模式
   - 导出按钮下载 JSON
   - 导入按钮读取 JSON 文件并加载
   - 复制按钮复制 Schema
   - 分享按钮复制分享链接
   - 成功/失败 Toast 提示

**验收结果**:
- ✅ 预览模式隐藏编辑器 UI
- ✅ 支持手机/平板/桌面预览尺寸
- ✅ 可导出 JSON 文件
- ✅ 可导入 JSON 文件并加载 Schema
- ✅ 可复制 Schema 到剪贴板
- ✅ 可生成分享链接
- ✅ 工具栏按钮工作正常
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- 预览模式使用全局 `previewStore` 切换，避免在多个扩展间传状态
- 预览页面直接复用 `SchemaNode` 渲染，避免维护第二套渲染逻辑
- 导出和导入能力集中在 service 层，工具栏只负责触发
- 分享链接采用 base64 编码 Schema 到 hash，避免依赖后端

---

## 阶段 12-1 完成情况

**日期**: 2026-03-18
**位置**: `apps/web_builder/`

**完成任务**:
1. ✅ 升级 `ComponentManager.ts`
   - 统一 `SchemaComponentProps`
   - 本地组件注册
   - 远程组件缓存
   - `loadRemote()` 远程组件加载入口
2. ✅ 创建本地组件目录
   - `src/components/Text/index.tsx`
   - `src/components/Image/index.tsx`
   - `src/components/Button/index.tsx`
   - `src/components/Container/index.tsx`
   - 全部使用 `React.memo`
3. ✅ 创建远程组件加载器
   - `src/common/components/SchemaRenderer/utils/remoteLoader.ts`
   - 支持动态 ESM 模块加载
   - 支持 script 注入加载
   - 支持远程 CSS 加载
   - 错误处理与缓存
4. ✅ 创建事件动作绑定工具
   - `src/common/components/SchemaRenderer/utils/eventActions.ts`
   - 支持 `navigate` / `alert` / `log` / `copyText` / `dispatch`
5. ✅ 重写 `BaseComponents.tsx`
   - `SchemaNode` 统一负责递归 children 渲染
   - 支持远程组件加载态/错误态
   - 本地组件与远程组件统一入口
6. ✅ 修改 `SelectableComponents.tsx`
   - 编辑态也支持 `event2action`
   - 叶子节点和容器节点行为统一
7. ✅ 更新 `SchemaRenderer/index.tsx`
   - 导出 `ButtonComponent`

**验收结果**:
- ✅ ComponentManager 工作正常
- ✅ 本地组件正确渲染
- ✅ 远程组件加载链路已支持
- ✅ 事件绑定生效
- ✅ React.memo / useMemo 优化已接入
- ✅ TypeScript 编译通过，无 lint 错误

**技术决策**:
- 本地组件拆分到 `src/components/*`，让渲染器专注调度而非内联实现
- 远程组件支持两种模式：ESM `moduleUrl` 和脚本注入 `scriptUrl`
- 远程 CSS 独立加载并缓存，避免重复插入
- 事件绑定采用 `event2action` 到 React handler 的映射，保证预览态和编辑态一致
- 渲染性能以 `React.memo` 和 `useMemo` 为主，先避免不必要重渲染

---

*最后更新: 2026-03-18 - 阶段 12-1 完成*
