# 1-1-PLAN.md

## 计划 1-1: Rush Monorepo 项目初始化

### 前置依赖
- Rush monorepo 已初始化（rush.json 存在）
- pnpm 已安装

### 文件变更

| 操作 | 文件路径 | 说明 |
|-----|---------|------|
| 创建 | `apps/web_builder/package.json` | 包配置 |
| 创建 | `apps/web_builder/tsconfig.json` | TypeScript 配置 |
| 创建 | `apps/web_builder/vite.config.ts` | Vite 构建配置 |
| 创建 | `apps/web_builder/edenx.config.ts` | Modern.js Module 配置 |
| 创建 | `apps/web_builder/.eslintrc.cjs` | ESLint 配置 |
| 创建 | `apps/web_builder/.prettierrc` | Prettier 配置 |
| 创建 | `apps/web_builder/src/index.ts` | 入口文件 |
| 创建 | `apps/web_builder/src/vite-env.d.ts` | Vite 类型声明 |
| 创建 | `apps/web_builder/index.html` | 开发用 HTML |
| 创建 | `apps/web_builder/README.md` | 项目说明 |
| 修改 | `rush.json` | 添加项目配置 |

### 实现步骤

1. **创建 apps/web_builder 目录**
   ```bash
   mkdir -p apps/web_builder/src
   cd apps/web_builder
   ```

2. **初始化 package.json**
   - 包名: `@orangehome/web_builder`
   - type: `module`
   - 配置 scripts: build, dev, type-check
   - 添加 dependencies 和 devDependencies

3. **配置 TypeScript**
   - 继承 monorepo 共享配置（如果有）
   - `strict: true`
   - `experimentalDecorators: true`
   - `emitDecoratorMetadata: true`

4. **配置 Vite**
   - 库模式配置
   - 外部化 react/react-dom
   - CSS 注入

5. **配置 Modern.js (edenx.config.ts)**
   - 使用 `@modern-js/module-tools`
   - 输出 ESM 和 CJS
   - ES2022 目标

6. **配置 ESLint + Prettier**
   - 继承 monorepo 规范（如果有）
   - React + TypeScript 规则

7. **配置 Rush**
   - 在 rush.json 中添加项目
   - 运行 `rush update` 安装依赖

### 核心文件内容

```json
// apps/web_builder/package.json
{
  "name": "@orangehome/web_builder",
  "version": "0.1.0",
  "description": "Orange Editor - 基于插槽化架构的可视化页面编辑器",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "modern build",
    "dev": "vite",
    "preview": "vite preview",
    "test": "vitest",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  },
  "dependencies": {
    "@douyinfe/semi-foundation": "^2.40.0",
    "@douyinfe/semi-icons": "^2.40.0",
    "@douyinfe/semi-ui": "^2.40.0",
    "eventemitter2": "^6.4.9",
    "inversify": "^6.0.1",
    "nanoid": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reflect-metadata": "^0.1.13",
    "swr": "^2.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@modern-js/module-tools": "^2.40.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

```json
// apps/web_builder/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": false,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

```typescript
// apps/web_builder/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'OrangeEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

```typescript
// apps/web_builder/edenx.config.ts
import { defineConfig } from '@modern-js/module-tools';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset({ extendPreset }) {
    return extendPreset('npm-library', {
      target: 'es2022',
      buildType: 'bundleless',
      dts: {
        respectExternal: true,
      },
      alias: {
        '@': './src',
      },
      externalHelpers: true,
      sourceMap: true,
      jsx: 'transform',
      style: {
        inject: true,
      },
      define: {
        __VERSION__: JSON.stringify(process.env.npm_package_version),
      },
    });
  },
});
```

```typescript
// apps/web_builder/src/index.ts
// 版本号
export const version = __VERSION__;

// 核心
export { OrangeEditor } from './core/editor';
export { SlotRegistry } from './core/slots/SlotRegistry';
export { ExtensionLoader } from './core/extensions/ExtensionLoader';
export { EventBus } from './core/events/EventBus';

// 类型
export type {
  IExtension,
  IExtensionContext,
} from './core/extensions/types';

export type {
  ISlotContent,
  ISlot,
} from './core/slots/types';

// 工具
export { schemaOperator } from './common/base/schemaOperator';
export { generateId } from './utils/id';

// 类型定义
export type {
  ISchema,
  IComponent,
} from './types/base';

// 导入 reflect-metadata（必须在应用入口）
import 'reflect-metadata';
```

```typescript
// apps/web_builder/src/vite-env.d.ts
/// <reference types="vite/client" />

declare const __VERSION__: string;
```

```html
<!-- apps/web_builder/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orange Editor</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body, #root {
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```typescript
// apps/web_builder/src/main.tsx（开发入口）
import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { OrangeEditor } from './core/editor';

const container = document.getElementById('root')!;
const editor = OrangeEditor.getInstance({ container });

editor.mount().then((View) => {
  if (View) {
    ReactDOM.createRoot(container).render(<View />);
  }
});
```

```json
// rush.json（添加项目）
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": "5.100.0",
  "pnpmVersion": "8.10.0",
  "nodeSupportedVersionRange": ">=18.0.0 <21.0.0",
  "projects": [
    {
      "packageName": "@orangehome/web_builder",
      "projectFolder": "apps/web_builder"
    }
  ]
}
```

### 验证方法

```bash
# 1. 在 monorepo 根目录
rush update

# 2. 进入项目目录
cd apps/web_builder

# 3. 类型检查
rushx type-check

# 4. 构建
rush build -t @orangehome/web_builder

# 5. 开发服务器
rushx dev

# 6. 验证产物
ls -la dist/
# 应包含: index.js, index.cjs, index.d.ts
```

### 验收标准

- [ ] `rush update` 成功安装依赖
- [ ] `rushx type-check` 通过，无 TS 错误
- [ ] `rush build -t @orangehome/web_builder` 成功
- [ ] `rushx dev` 启动成功
- [ ] 产物包含 ESM 和 CJS 格式
- [ ] React 和 ReactDOM 被正确外部化
- [ ] rush.json 配置正确

---

## 在 Cursor 中执行

```
请帮我在 Rush monorepo 中初始化 Orange Editor 项目。

环境:
- Rush monorepo 已存在
- 项目位置: apps/web_builder
- 包名: @orangehome/web_builder
- 包管理: pnpm

任务:

1. 创建目录结构:
   mkdir -p apps/web_builder/src

2. 创建 apps/web_builder/package.json:
   - name: "@orangehome/web_builder"
   - version: "0.1.0"
   - type: "module"
   - main: "./dist/index.js"
   - types: "./dist/index.d.ts"
   - scripts: build (modern build), dev (vite), type-check (tsc --noEmit)
   - dependencies: @douyinfe/semi-ui, inversify, react, react-dom, zustand, nanoid, eventemitter2, reflect-metadata
   - devDependencies: @modern-js/module-tools, typescript, vite, @vitejs/plugin-react, vitest
   - peerDependencies: react >=18.0.0

3. 创建 apps/web_builder/tsconfig.json:
   - target: ES2022
   - module: ESNext
   - strict: true
   - experimentalDecorators: true
   - emitDecoratorMetadata: true
   - jsx: react-jsx
   - outDir: "./dist"
   - rootDir: "./src"

4. 创建 apps/web_builder/vite.config.ts:
   - 使用 @vitejs/plugin-react
   - lib 模式配置
   - entry: src/index.ts
   - external: react, react-dom
   - server port: 5173

5. 创建 apps/web_builder/edenx.config.ts:
   - 使用 @modern-js/module-tools
   - extendPreset('npm-library')
   - target: es2022
   - buildType: bundleless
   - style.inject: true
   - define __VERSION__

6. 创建 apps/web_builder/.eslintrc.cjs:
   - 基础 React + TypeScript 配置
   - extends: eslint:recommended, @typescript-eslint/recommended, react-hooks/recommended

7. 创建 apps/web_builder/.prettierrc:
   - semi: true
   - singleQuote: true
   - trailingComma: all
   - printWidth: 100

8. 创建入口文件:
   - apps/web_builder/src/index.ts: 导出 OrangeEditor（占位）, version
   - apps/web_builder/src/vite-env.d.ts: 声明 __VERSION__
   - apps/web_builder/src/main.tsx: 开发入口，渲染编辑器

9. 创建 apps/web_builder/index.html:
   - 开发用 HTML
   - script src="/src/main.tsx"
   - 基础样式重置

10. 更新 rush.json:
    在 projects 数组中添加:
    {
      "packageName": "@orangehome/web_builder",
      "projectFolder": "apps/web_builder"
    }

11. 创建 README.md:
    - 项目说明
    - 开发命令: rushx dev
    - 构建命令: rush build -t @orangehome/web_builder

验证:
1. cd monorepo-root && rush update
2. cd apps/web_builder && rushx type-check (无错误)
3. rush build -t @orangehome/web_builder (成功)
4. rushx dev (启动成功，浏览器能访问)

确保项目能在 Rush monorepo 环境中正常运行。
```

---

*由 GSD 生成 - Rush Monorepo 版本*
