# 3-CONTEXT.md

## 阶段 3: Schema 系统

### 目标
实现完整的 Schema 数据结构和操作工具，包括：
- ISchema 类型定义
- SchemaOperator 工具（CRUD 操作）
- Schema 验证
- Schema 序列化/反序列化

### 设计决策

#### Schema 结构

```typescript
interface ISchema {
  id: string;           // 全局唯一 ID
  name: string;         // 组件名称（可读）
  type: string;         // 组件类型（如 'Text', 'Image', 'Container'）
  children: ISchema[];  // 子组件
  props: IAnyObject;    // 组件属性
  propStyle?: {         // 样式配置
    [cssSelector: string]: ICSSRule;
  };
  event2action?: IEvent2Action[];  // 事件动作绑定
  api?: IApiInSchema;   // API 数据配置
}
```

#### ID 生成策略

- 使用 `nanoid` 或自定义算法
- 格式: `{type}_{timestamp}_{random}`
- 示例: `text_1712345678901_a1b2c3`

#### Schema 操作原则

1. **不可变性** - 所有操作返回新 Schema，不修改原对象
2. **纯函数** - SchemaOperator 方法无副作用
3. **路径导航** - 支持通过路径快速定位节点

#### 操作 API

```typescript
const schemaOperator = {
  // 查询
  findById(schema, id): ISchema | null,
  findParentById(schema, id): ISchema | null,
  findPathById(schema, id): string[],
  
  // 修改
  updateProps(schema, id, props): ISchema,
  updateStyle(schema, id, style): ISchema,
  
  // 结构
  addChild(schema, parentId, child, index?): ISchema,
  removeById(schema, id): ISchema,
  moveNode(schema, id, newParentId, index?): ISchema,
  duplicateNode(schema, id): ISchema,
  
  // 工具
  validate(schema): boolean,
  flatten(schema): ISchema[],
  serialize(schema): string,
  deserialize(json): ISchema,
};
```

---

*由 GSD 生成*
