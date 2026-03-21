# 1-RESEARCH.md

## 阶段 1: 项目初始化 - 技术调研

### 1. 构建工具对比

| 工具 | 优点 | 缺点 | 结论 |
|-----|------|------|------|
| **Vite** | 启动快、HMR 快、配置简单 | 生态比 Webpack 小 | ✅ 选择 |
| Webpack | 生态成熟、配置灵活 | 配置复杂、启动慢 | 备选 |
| Rollup | 适合库、输出优化好 | 需要更多配置 | 备选 |
| esbuild | 超快 | 功能有限 | 不选 |

**选择 Vite 的理由**:
- 官方支持 Library Mode
- 对 TypeScript 支持好
- 插件生态足够丰富

### 2. 依赖注入框架对比

| 框架 | 优点 | 缺点 | 结论 |
|-----|------|------|------|
| **Inversify** | 成熟、文档好、装饰器支持 | 需要 reflect-metadata | ✅ 选择 |
| TSyringe | 微软出品、TypeScript 友好 | 相对较新 | 备选 |
| awilix | 性能好、无装饰器依赖 | API 不如 Inversify 直观 | 备选 |
| 手写 DI | 无依赖 | 代码多、易出错 | 不选 |

**选择 Inversify 的理由**:
- 最成熟的 TS IoC 容器
- 装饰器语法清晰
- 支持 Contribution Provider 模式

### 3. 状态管理方案

**组合方案**:
- **Zustand**: 全局 UI 状态（选中组件、画布状态）
- **SWR**: 服务端数据（远程组件配置、用户信息）
- **React Context**: 局部状态（组件树层级）

**为什么不选 Redux Toolkit**:
- Zustand 更轻量，语法更简单
- 编辑器状态不是超复杂的场景
- 如果需要 Redux DevTools，Zustand 也支持中间件

### 4. UI 组件库选择

**Semi Design** (@douyinfe/semi-ui)
- 字节跳动开源，维护活跃
- 组件丰富，设计一致
- 支持主题定制
- TypeScript 支持好

**备选**:
- Ant Design: 太常见，想有点特色
- Arco Design: 也不错，但 Semi 文档更好

### 5. 拖拽方案

**自研 OrangeDrag**:
- 不依赖 react-dnd 或 @dnd-kit
- 更灵活，可以定制拖拽镜像
- 学习成本在可控范围内

**参考**:
- react-dnd: 学习曲线陡峭
- @dnd-kit: 现代化，但不够灵活

### 6. 类型定义策略

**方案**: 集中式类型定义

```
src/types/
├── base/           # 基础类型（ISchema, IComponent）
├── store/          # 状态类型
├── extension/      # 扩展类型
└── index.ts        # 统一导出
```

**理由**:
- 避免循环依赖
- 类型变化时只需改一处
- 方便第三方使用

### 7. 项目配置要点

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true
  }
}
```

**vite.config.ts**:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OrangeEditor',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
});
```

### 8. 开发工具链

- **ESLint**: 代码规范
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Vitest**: 单元测试（后续阶段）

---

## 决策总结

| 方面 | 选择 | 理由 |
|-----|------|------|
| 构建工具 | Vite | 快、配置简单、支持库模式 |
| 依赖注入 | Inversify | 成熟、装饰器支持、贡献点模式 |
| 状态管理 | Zustand + SWR | 轻量、功能分离清晰 |
| UI 组件库 | Semi Design | 字节开源、组件丰富 |
| 拖拽 | 自研 | 灵活可控、学习成本可接受 |
| 类型定义 | 集中式 | 避免循环依赖、维护方便 |

---

*由 GSD 生成*
