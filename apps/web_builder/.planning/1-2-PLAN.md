# 1-2-PLAN.md

## 计划 2: Inversify 依赖注入容器配置

### 前置依赖
- 计划 1 完成（项目初始化）

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 修改 | `package.json` | 添加 inversify 依赖 |
| 修改 | `tsconfig.json` | 确认装饰器配置 |
| 创建 | `src/core/container/index.ts` | 容器配置 |
| 创建 | `src/core/container/decorators.ts` | 装饰器导出 |
| 创建 | `src/core/types/contribution.ts` | 贡献点类型 |
| 创建 | `src/core/services/EditorService.ts` | 编辑器服务 |
| 创建 | `src/core/services/StoreService.ts` | 状态服务 |
| 创建 | `src/types/base/index.ts` | 基础类型定义 |
| 创建 | `src/types/store/index.ts` | 状态类型定义 |
| 创建 | `src/types/extension/index.ts` | 扩展类型定义 |
| 修改 | `src/index.ts` | 导出容器和类型 |

### 实现步骤

1. **安装 Inversify**
   ```bash
   npm install inversify reflect-metadata
   ```

2. **配置容器入口**
   - 创建 `src/core/container/index.ts`
   - 导出 `defaultContainer` 单例
   - 配置 `getDecorators` 工具

3. **定义贡献点系统**
   - 创建 `ContributionProvider` 接口
   - 实现 `bindContributionProvider` 函数
   - 定义 `ExtensionContribution` 基础接口

4. **创建核心服务**
   - `EditorService`: 管理编辑器实例
   - `StoreService`: 状态管理服务
   - 使用 `@injectable()` 装饰器

5. **定义基础类型**
   - `ISchema`: Schema 结构定义
   - `IComponentNode`: 组件节点
   - `IEditorOptions`: 编辑器配置
   - `IStoreState`: 状态结构

6. **导出模块**
   - 在 `src/index.ts` 导出容器、服务、类型

### 代码结构

```typescript
// src/core/container/index.ts
import 'reflect-metadata';
import { Container, ContainerModule } from 'inversify';

export const defaultContainer = new Container();

// src/core/types/contribution.ts
export interface ContributionProvider<T> {
  getContribution(): T | undefined;
}

export const bindContributionProvider = <T>(
  bind: interfaces.Bind,
  contribution: interfaces.ServiceIdentifier<T>
) => {
  // 实现...
};

// src/types/base/index.ts
export interface ISchema {
  id: string;
  name: string;
  type: string;
  children: ISchema[];
  props: Record<string, any>;
}

// src/core/services/EditorService.ts
@injectable()
export class EditorService {
  // 编辑器核心服务
}
```

### 验证方法

```bash
# 1. 安装依赖
npm install

# 2. 类型检查
npm run type-check

# 3. 测试容器能正确绑定和解析
npm run build

# 4. 创建测试文件验证 (可选)
# 创建一个临时 test-di.ts 测试依赖注入
```

### 验收标准

- [ ] Inversify 容器能正确创建
- [ ] `@injectable()` 装饰器工作正常
- [ ] 服务能被正确绑定和解析
- [ ] ContributionProvider 模式可用
- [ ] 基础类型定义完整（ISchema, IStoreState 等）
- [ ] 无 TypeScript 类型错误
- [ ] 构建产物包含类型声明

---

## 在 Cursor 中执行

复制以下内容到 Cursor Chat:

```
请帮我配置 Inversify 依赖注入容器。

前置: 项目已初始化，package.json 和 tsconfig.json 已存在。

任务:
1. 安装依赖: inversify, reflect-metadata
2. 创建 src/core/container/index.ts:
   - 导出 defaultContainer (Inversify Container 单例)
   - 导入 reflect-metadata
3. 创建 src/core/types/contribution.ts:
   - 定义 ContributionProvider<T> 接口
   - 实现 bindContributionProvider 函数
   - 定义 ExtensionContribution 基础接口
4. 创建 src/core/services/EditorService.ts:
   - 使用 @injectable() 装饰器
   - 提供基础的编辑器服务方法
5. 创建 src/core/services/StoreService.ts:
   - 使用 @injectable() 装饰器
   - 提供状态管理服务
6. 创建类型定义:
   - src/types/base/index.ts: 定义 ISchema, IComponentNode
   - src/types/store/index.ts: 定义 IStoreState, IEditorState
   - src/types/extension/index.ts: 定义扩展相关类型
7. 修改 src/index.ts:
   - 导出容器、服务、类型

验证步骤:
1. npm run type-check (无错误)
2. npm run build (成功生成产物)
3. 创建临时测试文件验证 DI 工作正常:
   ```ts
   import { defaultContainer } from './src/core/container';
   import { EditorService } from './src/core/services/EditorService';
   
   const service = defaultContainer.get(EditorService);
   console.log(service);
   ```

确保所有类型定义完整，装饰器配置正确。
```

---

*由 GSD 生成*
