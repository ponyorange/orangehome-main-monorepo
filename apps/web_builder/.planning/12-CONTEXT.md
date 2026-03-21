# 12-CONTEXT.md

## 阶段 12: SchemaRenderer 完善

### 目标
完善 Schema 渲染器，支持远程组件加载。

### 设计决策

#### ComponentManager

- 管理本地和远程组件
- 动态加载远程 JS/CSS
- 组件缓存

#### 渲染流程

1. 根据 type 获取组件
2. 传入 props 和 children
3. 递归渲染子组件

---

*由 GSD 生成*
