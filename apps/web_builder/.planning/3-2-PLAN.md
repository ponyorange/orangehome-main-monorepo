# 3-2-PLAN.md

## 计划 3-2: Schema 渲染

### 前置依赖
- 计划 3-1 完成（Schema 类型定义与基础操作）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `src/common/components/SchemaRenderer/index.tsx` | Schema 渲染器 |
| 创建 | `src/common/components/SchemaRenderer/ComponentManager.ts` | 组件映射管理 |
| 创建 | `src/common/components/SchemaRenderer/BaseComponents.tsx` | 基础组件 (Text, Image, Container) |
| 创建 | `src/core/store/schemaStore.ts` | Schema 状态管理 |
| 修改 | `src/extensions/ui/center-canvas/components/CenterCanvas.tsx` | 集成 SchemaRenderer |

### 实现步骤

1. **创建 ComponentManager**
   - 组件 type 到 React 组件的映射
   - register / get / has 方法

2. **创建基础组件**
   - Text 组件
   - Image 组件
   - Container 组件（递归渲染 children）

3. **创建 SchemaRenderer**
   - 接收 schema 属性
   - 递归渲染节点
   - 未知类型降级显示

4. **创建 schemaStore**
   - 使用 zustand 管理 schema 状态
   - 默认示例 Schema

5. **集成到画布**
   - CenterCanvas 使用 useSchemaStore
   - 替换占位为 SchemaRenderer

### 验收标准

- [x] SchemaRenderer 能正确渲染 ISchema
- [x] 画布显示示例内容
- [x] 支持 Text、Image、Container 三种类型

---

*由 GSD 生成*
