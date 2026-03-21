# 12-1-PLAN.md

## 计划 12-1: SchemaRenderer 完善与远程组件

### 实现步骤

1. **完善 ComponentManager**
   - 注册本地组件
   - 加载远程组件
   - 组件缓存机制

2. **实现远程组件加载**
   - 动态加载 JS/CSS
   - 错误处理
   - 加载状态显示

3. **优化渲染性能**
   - React.memo 优化
   - 虚拟列表（大量组件时）

4. **事件绑定**
   - event2action 解析
   - 事件处理器绑定

### 验收标准

- [ ] ComponentManager 工作正常
- [ ] 远程组件可加载
- [ ] 渲染性能良好
- [ ] 事件绑定正确

---

## 在 Cursor 中执行

```
请完善 SchemaRenderer 和远程组件加载。

任务:
1. 创建 src/common/components/SchemaRenderer/ComponentManager.ts:
   - 注册本地组件
   - 加载远程组件配置
   - 动态 import 远程组件
   - 组件缓存

2. 创建远程组件加载器:
   - loadRemoteComponent(url): 动态加载 JS
   - 加载 CSS
   - 错误处理和重试

3. 完善 NodeRenderer:
   - 使用 ComponentManager 获取组件
   - 绑定 event2action
   - 处理 children 递归

4. 性能优化:
   - React.memo 包裹
   - useMemo 缓存
   - 避免不必要重渲染

5. 创建本地组件:
   - src/components/Text/index.tsx
   - src/components/Image/index.tsx
   - src/components/Button/index.tsx
   - src/components/Container/index.tsx

验证:
- 本地组件正确渲染
- 远程组件可加载
- 事件绑定有效
- 性能良好
```

---

*由 GSD 生成*
