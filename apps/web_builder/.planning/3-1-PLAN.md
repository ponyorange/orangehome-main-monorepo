# 3-1-PLAN.md

## 计划 3-1: Schema 类型定义与基础操作

### 前置依赖
- 计划 2-2 完成（扩展系统）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `src/types/base/index.ts` | 基础类型定义 |
| 创建 | `src/common/base/schemaOperator/index.ts` | Schema 操作工具 |
| 创建 | `src/utils/id.ts` | ID 生成工具 |
| 创建 | `src/utils/clone.ts` | 深克隆工具 |
| 修改 | `package.json` | 添加 nanoid 依赖 |

### 实现步骤

1. **安装 nanoid**
   ```bash
   npm install nanoid
   ```

2. **定义 ISchema 类型**
   - 完整类型定义
   - CSSRule 类型
   - Event2Action 类型
   - ApiInSchema 类型

3. **实现 SchemaOperator**
   - findById - 递归查找
   - findParentById - 查找父节点
   - updateProps - 更新属性（不可变）
   - addChild - 添加子节点
   - removeById - 删除节点

4. **实现工具函数**
   - generateId() - 生成唯一 ID
   - deepClone() - 深克隆对象

### 核心代码

```typescript
// src/types/base/index.ts
export interface ISchema {
  id: string;
  name: string;
  type: string;
  children: ISchema[];
  props: Record<string, any>;
  propStyle?: Record<string, ICSSRule>;
  event2action?: IEvent2Action[];
  api?: IApiInSchema;
}

// src/common/base/schemaOperator/index.ts
export const schemaOperator = {
  findById(schema: ISchema, id: string): ISchema | null {
    if (schema.id === id) return schema;
    for (const child of schema.children) {
      const found = this.findById(child, id);
      if (found) return found;
    }
    return null;
  },
  
  updateProps(schema: ISchema, id: string, props: object): ISchema {
    // 不可变更新实现
  },
  
  // ... 其他方法
};
```

### 验收标准

- [ ] ISchema 类型定义完整
- [ ] SchemaOperator 方法实现正确
- [ ] 操作保持不可变性
- [ ] 单元测试通过

---

## 在 Cursor 中执行

```
请实现 Schema 类型定义和基础操作工具。

前置: 扩展系统已配置。

任务:
1. 安装依赖: npm install nanoid

2. 创建 src/types/base/index.ts:
   - ISchema 接口 (id, name, type, children, props, propStyle, event2action, api)
   - ICSSRule 接口
   - IEvent2Action 接口
   - IApiInSchema 接口
   - IComponent 接口 (type, title, icon, propsConfig)

3. 创建 src/utils/id.ts:
   - generateId(prefix?: string): string 函数
   - 使用 nanoid，格式: {prefix}_{nanoid(8)}

4. 创建 src/utils/clone.ts:
   - deepClone<T>(obj: T): T 函数
   - 使用 structuredClone 或递归实现

5. 创建 src/common/base/schemaOperator/index.ts:
   - findById(schema, id): 递归查找节点
   - findParentById(schema, id): 查找父节点
   - findPathById(schema, id): 返回路径数组
   - updateProps(schema, id, props): 不可变更新 props
   - updateStyle(schema, id, style): 不可变更新样式
   - addChild(schema, parentId, child, index?): 添加子节点
   - removeById(schema, id): 删除节点
   - moveNode(schema, id, newParentId, index?): 移动节点
   - duplicateNode(schema, id): 复制节点
   - flatten(schema): 展平为数组
   - validate(schema): 验证 schema 有效性

6. 创建测试文件 src/common/base/schemaOperator/__tests__/index.test.ts:
   - 测试 findById, updateProps, addChild, removeById
   - 验证不可变性

验证:
- npm run type-check (无错误)
- npm test (SchemaOperator 测试通过)

确保所有方法都是纯函数，不修改原对象。
```

---

*由 GSD 生成*
