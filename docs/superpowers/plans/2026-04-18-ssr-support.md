# SSR 运行时与物料双产物 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有 SSG/CSR 的前提下，为低代码运行时增加 `GET /orangehome/runtime-ssr/:type/:pageid`（首版仅 `preview` 真 SSR，其余 `type` 返回 501）；物料版本支持 **browser + SSR(CJS)** 双产物与 `ssrFileUrl`/`ssrFileObjectKey` 全链路；`ohm publish` 与 `web_admin` 均能上传 SSR 包。

**Architecture:** 数据与预签名在 **`orangehome-core-service`**（管理端 `web_admin` 直连其 `/api`，非 `server_bside`）；C 端 `server_cside` 经 gRPC 读取带 SSR 字段的 `MaterialVersionMessage`，解析出 CJS URL，在 Node 内加载并 `renderToString`，EJS 输出带已渲染 `#app` 的 HTML，浏览器脚本与 ORANGEHOME_DATA 与现 SSG 一致以支持 hydrate。全仓库使用分支 **`feat/ssr_support`**（见规格 §0）。

**Tech Stack:** NestJS、MongoDB/Mongoose、gRPC + `core.proto`、MinIO 预签名、Vite（物料 CJS SSR 构建）、React 18、`react-dom/server`、`@douyinfe/semi-ui`（web_admin）。

**包管理：** **`orangehome-main-monorepo` 使用 Rush + pnpm**（见根目录 `rush.json`）：依赖变更后根目录执行 `rush update`；子项目内跑脚本用 **`rushx <script>`**。**`orangehome-core-service`、`orangehome-materials` 等独立仓使用 pnpm**。计划正文中的 `npm …` 示例均已改为上述约定；历史提交若仍含 `npm`，新工作以本段为准。

---

## 文件与职责总览（实施前锁定）

### `orangehome-core-service`

| 文件 | 职责 |
|------|------|
| `src/material/schemas/material-version.schema.ts` | 新增 `ssrFileObjectKey?`、`ssrFileUrl?` |
| `src/material/dto/presigned-upload-body.dto.ts` | 增加 `bundle?: 'browser' \| 'ssr'`（默认 browser） |
| `src/material/dto/create-material-version.dto.ts` | 增加必填 `ssrFileObjectKey`、可选 `ssrMd5`（与规格「新建双产物必填」一致） |
| `src/material/dto/update-material-version.dto.ts` | 增加可选 `ssrFileObjectKey`、`ssrMd5` |
| `src/material/dto/upsert-material-version-by-uid.dto.ts` | 增加可选 `ssrFileObjectKey`、`ssrMd5`；新建分支校验与 `create` 对齐 |
| `src/material/dto/material-version-response.dto.ts` | `MaterialVersionDto` + `toMaterialVersionDto` 增加 ssr 字段 |
| `src/material/services/material-version.service.ts` | 预签名路径含 `ssr/`、`doCreate`/`update`/`upsert` 写 SSR 字段并 head MinIO |
| `src/material/controllers/material-version-http.controller.ts` | `PresignedBody` 增加 `bundle`；透传 `getPresignedUploadUrl` |
| `src/material/controllers/material-version.grpc.controller.ts` | `CreateMaterialVersionRequest` / `GetPresignedUploadUrlRequest` 增加 ssr/bundle 映射 |
| `src/common/grpc-response.util.ts` | `toMaterialVersionGrpcData` 增加 `ssr_file_object_key`、`ssr_file_url` |
| `proto/core.proto` | `MaterialVersionMessage` 字段 19–20；`GetPresignedUploadUrlRequest` 增加 `bundle`；`CreateMaterialVersionRequest` 增加 ssr 相关字段（与 HTTP 对齐） |
| `src/material/services/material-version.service.spec.ts` | **新建**：预签名 objectKey、`doCreate` 双 head 行为（Mock MinIO + Model） |

### `orangehome-main-monorepo`

| 文件 | 职责 |
|------|------|
| `apps/server_cside/proto/core.proto` | 与 core 仓库 **逐字同步** |
| `apps/server_bside/proto/core.proto` | 与 core 仓库 **逐字同步**（供将来 BFF gRPC 客户端） |
| `apps/server_cside/src/runtime/runtime-ssr.controller.ts` | **新建**：`orangehome/runtime-ssr/:type/:pageid` |
| `apps/server_cside/src/runtime/runtime-ssr.service.ts` | **新建**：501 分支、preview SSR、`buildComponentsSsrMap` |
| `apps/server_cside/src/runtime/views/runtime-page-ssr.ejs` | **新建**：`#app` 内嵌 `ssrHtml` |
| `apps/server_cside/src/runtime/runtime.module.ts` | 注册 SSR controller/service |
| `apps/server_cside/src/runtime/runtime-ssr.service.spec.ts` | **新建**：501、缺 ssr URL → 502 |
| `apps/server_cside/package.json` | 增加 `react`、`react-dom` 依赖（与物料 external 版本一致） |
| `apps/web_admin/src/types/material.ts` | `PresignedUploadBody` 增加 `bundle?` |
| `apps/web_admin/src/types/materialVersion.ts` | ssr 字段 + create/update 参数 |
| `apps/web_admin/src/services/material.ts` | `getPresignedUploadUrl` 传 `bundle` |
| `apps/web_admin/src/containers/MaterialVersions/index.tsx` | 第二上传区、state、列表列、提交校验 |
| `apps/web_builder/src/utils/runtimePreviewUrl.ts`（或等价） | SSR 模板 env |
| `apps/web_builder/.env.example` | `VITE_RUNTIME_PREVIEW_SSR_URL_TEMPLATE` |
| `apps/web_builder/src/vite-env.d.ts` | 声明 env |

### `orangehome-materials`

| 文件 | 职责 |
|------|------|
| `packages/@orangehome/material-cli/src/publish/upload-runtime.ts` | `presignedUploadBundle(..., bundle)` 或并列函数 |
| `packages/@orangehome/material-cli/src/api/material-version.ts` | DTO 增加 `ssrFileObjectKey`、`ssrMd5?` |
| `packages/@orangehome/material-cli/src/commands/publish.ts` | `build:ssr`、第二次上传、单次 upsert |
| `packages/@orangehome/material-cli/src/publish/run-build.ts`（或新建） | 调用 `pnpm run build:ssr`（有 `pnpm-lock.yaml` 时；否则 CLI 可回退 npm） |
| `templates/component/vite.config.ts`（及 `plugins/runtime/vite.config.ts`） | 增加 **SSR CJS** 构建配置或 `vite.ssr.config.ts` |
| 各 `components/*/package.json` | 增加 `"build:ssr": "vite build --config vite.ssr.config.ts"`（路径以实际模板为准） |

---

## Phase A — core-service：数据模型与 API

### Task A1: Mongoose schema 增加 SSR 字段

**Files:**

- Modify: `orangehome-core-service/src/material/schemas/material-version.schema.ts`
- Test: （本任务无独立测试；由 Task A9 覆盖）

- [ ] **Step 1: 在 `fileUrl` 后增加可选字段**

在 `MaterialVersion` 类中 `fileUrl` 定义之后插入：

```typescript
  /** SSR 构建产物 MinIO 对象键（Node require 用 CJS） */
  @Prop({ required: false })
  ssrFileObjectKey?: string;

  @Prop({ required: false })
  ssrFileUrl?: string;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-core-service
git checkout feat/ssr_support
git add src/material/schemas/material-version.schema.ts
git commit -m "feat(material-version): add ssrFileObjectKey and ssrFileUrl"
```

---

### Task A2: DTO — 预签名 body 支持 `bundle`

**Files:**

- Modify: `orangehome-core-service/src/material/dto/presigned-upload-body.dto.ts`

- [ ] **Step 1: 增加枚举校验**

在文件顶部 `class-validator` 导入中增加 `IsIn`。在类中 `filename` 字段之后增加：

```typescript
  @ApiPropertyOptional({
    description: '产物类型：browser=运行时 AMD/IIFE 包；ssr=Node CJS SSR 包',
    enum: ['browser', 'ssr'],
    default: 'browser',
  })
  @IsIn(['browser', 'ssr'])
  @IsOptional()
  bundle?: 'browser' | 'ssr';
```

- [ ] **Step 2: Commit**

```bash
git add src/material/dto/presigned-upload-body.dto.ts
git commit -m "feat(dto): presigned upload bundle browser|ssr"
```

---

### Task A3: DTO — Create / Update / Upsert 含 SSR

**Files:**

- Modify: `orangehome-core-service/src/material/dto/create-material-version.dto.ts`
- Modify: `orangehome-core-service/src/material/dto/update-material-version.dto.ts`
- Modify: `orangehome-core-service/src/material/dto/upsert-material-version-by-uid.dto.ts`

- [ ] **Step 1: `CreateMaterialVersionDto` 在 `fileObjectKey` 字段块之后增加**

```typescript
  @ApiProperty({
    description: 'SSR（CJS）产物 MinIO 对象键，须已上传',
    example: 'materials/@orangehome/foo/1.0.1/ssr/index.cjs',
  })
  @IsString()
  @IsNotEmpty()
  ssrFileObjectKey: string;

  @ApiPropertyOptional({ description: 'SSR 包 MD5，与 MinIO etag 比对（可选）' })
  @IsString()
  @IsOptional()
  ssrMd5?: string;
```

- [ ] **Step 2: `UpdateMaterialVersionDto` 在 `md5` 之前增加**

```typescript
  @ApiPropertyOptional({
    description: '新的 SSR 产物对象键（换 SSR 包时传）',
  })
  @IsString()
  @IsOptional()
  ssrFileObjectKey?: string;

  @ApiPropertyOptional({ description: 'SSR 包 MD5 校验（可选）' })
  @IsString()
  @IsOptional()
  ssrMd5?: string;
```

- [ ] **Step 3: `UpsertMaterialVersionByUidDto` 在 `md5` 之前增加**

```typescript
  @ApiPropertyOptional({
    description:
      'SSR MinIO 对象键。新建版本时与 fileObjectKey 同属必填业务规则（由服务层与 Create DTO 一致校验）',
    example: 'materials/@orangehome/foo/1.0.1/ssr/index.cjs',
  })
  @IsString()
  @IsOptional()
  ssrFileObjectKey?: string;

  @ApiPropertyOptional({ description: 'SSR 文件 MD5（可选）' })
  @IsString()
  @IsOptional()
  ssrMd5?: string;
```

- [ ] **Step 4: Commit**

```bash
git add src/material/dto/create-material-version.dto.ts src/material/dto/update-material-version.dto.ts src/material/dto/upsert-material-version-by-uid.dto.ts
git commit -m "feat(dto): material version SSR keys for create/update/upsert"
```

---

### Task A4: `MaterialVersionDto` 与 `toMaterialVersionDto`

**Files:**

- Modify: `orangehome-core-service/src/material/dto/material-version-response.dto.ts`

- [ ] **Step 1: 接口与映射函数补充字段**

在 `MaterialVersionDto` 中 `fileUrl?` 后增加：

```typescript
  ssrFileObjectKey?: string;
  ssrFileUrl?: string;
```

在 `toMaterialVersionDto` 的参数类型与 return 对象中增加：

```typescript
  ssrFileObjectKey: doc.ssrFileObjectKey,
  ssrFileUrl: doc.ssrFileUrl,
```

（若 `doc` 类型为内联对象，在参数类型里为 `ssrFileObjectKey?: string; ssrFileUrl?: string;`）

- [ ] **Step 2: Commit**

```bash
git add src/material/dto/material-version-response.dto.ts
git commit -m "feat(dto): expose SSR fields on material version response"
```

---

### Task A5: `MaterialVersionService` — 预签名与 `doCreate` / `update` / `upsert`

**Files:**

- Modify: `orangehome-core-service/src/material/services/material-version.service.ts`

- [ ] **Step 1: 扩展 `buildVersionObjectKey`**

将方法改为支持 bundle，例如：

```typescript
  buildVersionObjectKey(
    materialUid: string,
    version: string,
    filename: string,
    bundle: 'browser' | 'ssr' = 'browser',
  ): string {
    const safeVersion = version.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeName = filename.replace(/[/\\]/g, '_') || 'index.js';
    const prefix = `materials/${materialUid}/${safeVersion}`;
    if (bundle === 'ssr') {
      return `${prefix}/ssr/${safeName}`;
    }
    return `${prefix}/${safeName}`;
  }
```

- [ ] **Step 2: 扩展 `getPresignedUploadUrl` 签名与实现**

```typescript
  async getPresignedUploadUrl(
    materialId: string,
    version: string,
    filename: string,
    bundle: 'browser' | 'ssr' = 'browser',
  ): Promise<{ url: string; objectKey: string; expiresIn: number }> {
    const material = await this.materialModel
      .findOne({ _id: materialId, isDeleted: false })
      .lean()
      .exec();
    if (!material) {
      throw new NotFoundException(`Material '${materialId}' not found`);
    }
    parseVersionCode(version);
    const objectKey = this.buildVersionObjectKey(
      material.materialUid,
      version,
      filename,
      bundle,
    );
    const url = await this.minioService.getPresignedUploadUrl(objectKey, PRESIGN_EXPIRES);
    return { url, objectKey, expiresIn: PRESIGN_EXPIRES };
  }
```

- [ ] **Step 3: 在 `doCreate` 中，browser `verifyObjectInMinio` 成功后增加 SSR 校验**

在 `const doc = new this.versionModel({` 之前插入：

```typescript
    const ssrMeta = await this.verifyObjectInMinio(
      dto.ssrFileObjectKey,
      dto.ssrMd5,
    );
```

在 `new this.versionModel({ ... })` 参数中增加：

```typescript
      ssrFileObjectKey: dto.ssrFileObjectKey,
      ssrFileUrl: ssrMeta.fileUrl,
```

- [ ] **Step 4: `update` 方法中，在 `dto.fileObjectKey` 块之后增加 SSR 替换块**

```typescript
    if (dto.ssrFileObjectKey !== undefined) {
      const nextSsr = dto.ssrFileObjectKey.trim();
      if (nextSsr && nextSsr !== version.ssrFileObjectKey) {
        const ssrMeta = await this.verifyObjectInMinio(nextSsr, dto.ssrMd5);
        version.ssrFileObjectKey = nextSsr;
        version.ssrFileUrl = ssrMeta.fileUrl;
      }
    }
```

- [ ] **Step 5: `upsertByMaterialUidAndVersion` 新建分支**

当 `!existing` 时，在校验 `fileObjectKey` 之后增加：

```typescript
          const ssrKey = dto.ssrFileObjectKey?.trim();
          if (!ssrKey) {
            throw new BadRequestException('新建版本时 ssrFileObjectKey 必填');
          }
```

并在 `createDto` 中增加 `ssrFileObjectKey: ssrKey`、`ssrMd5: dto.ssrMd5`。

在 `update(...)` 调用中增加 `ssrFileObjectKey: dto.ssrFileObjectKey`、`ssrMd5: dto.ssrMd5`。

- [ ] **Step 6: Commit**

```bash
git add src/material/services/material-version.service.ts
git commit -m "feat(material-version): presigned ssr path and persist SSR fields"
```

---

### Task A6: HTTP `PresignedBody` 与 controller

**Files:**

- Modify: `orangehome-core-service/src/material/controllers/material-version-http.controller.ts`

- [ ] **Step 1: 扩展内联 `PresignedBody`**

增加可选字段：

```typescript
import { IsIn } from 'class-validator';
// ...
  @IsIn(['browser', 'ssr'])
  @IsOptional()
  bundle?: 'browser' | 'ssr';
```

- [ ] **Step 2: 调用 service 时传入 `body.bundle ?? 'browser'`**

```typescript
    const { url, objectKey, expiresIn } =
      await this.versionService.getPresignedUploadUrl(
        body.materialId,
        body.version,
        body.filename || 'index.js',
        body.bundle ?? 'browser',
      );
```

- [ ] **Step 3: Commit**

```bash
git add src/material/controllers/material-version-http.controller.ts
git commit -m "feat(http): presigned upload accepts bundle browser|ssr"
```

---

### Task A7: gRPC controller 映射

**Files:**

- Modify: `orangehome-core-service/src/material/controllers/material-version.grpc.controller.ts`

- [ ] **Step 1: `CreateMaterialVersionRequest` 接口增加**

```typescript
  ssrFileObjectKey: string;
  ssrMd5?: { value: string };
```

- [ ] **Step 2: `createMaterialVersion` 内 `versionService.create` 参数增加**

```typescript
        ssrFileObjectKey: data.ssrFileObjectKey,
        ssrMd5: data.ssrMd5?.value,
```

- [ ] **Step 3: `GetPresignedUploadUrlRequest` 增加 `bundle?: { value: string }`**，并在 `getPresignedUploadUrl` 调用中解析为 `'browser' | 'ssr'`（缺省 browser；非法值抛 `BadRequestException` 映射为 INVALID_ARGUMENT）。

- [ ] **Step 4: Commit**

```bash
git add src/material/controllers/material-version.grpc.controller.ts
git commit -m "feat(grpc): material version create/presign SSR fields"
```

---

### Task A8: `core.proto` 与 `toMaterialVersionGrpcData`

**Files:**

- Modify: `orangehome-core-service/proto/core.proto`
- Modify: `orangehome-core-service/src/common/grpc-response.util.ts`

- [ ] **Step 1: 编辑 `MaterialVersionMessage` 在 `updated_at = 18` 之后增加**

```protobuf
  google.protobuf.StringValue ssr_file_object_key = 19;
  google.protobuf.StringValue ssr_file_url = 20;
```

- [ ] **Step 2: `GetPresignedUploadUrlRequest` 增加**

```protobuf
  google.protobuf.StringValue bundle = 4;
```

（`bundle` 取值约定字符串 `browser` / `ssr`。）

- [ ] **Step 3: `CreateMaterialVersionRequest` 增加 SSR 字段（与 HTTP 一致）**

在现有字段后追加：

```protobuf
  string ssr_file_object_key = 8;
  google.protobuf.StringValue ssr_md5 = 9;
```

- [ ] **Step 4: 更新 `toMaterialVersionGrpcData` 参数类型与返回对象**

在 `return {` 中 `fileUrl` 附近增加：

```typescript
    ssrFileObjectKey: toStringValue(dto.ssrFileObjectKey),
    ssrFileUrl: toStringValue(dto.ssrFileUrl),
```

注意：proto 字段名为 `ssr_file_object_key`，TS 侧 grpc 载荷可能为 camelCase，需与 Nest gRPC 序列化配置一致；若生成对象为 `ssrFileObjectKey`，在 `toMaterialVersionGrpcData` 的 **输入** `dto` 仍使用内部 `MaterialVersionDto` 的 `ssrFileObjectKey`。

- [ ] **Step 5: Commit**

```bash
git add proto/core.proto src/common/grpc-response.util.ts
git commit -m "feat(proto): MaterialVersion SSR fields and presign bundle"
```

---

### Task A9: 单元测试 `getPresignedUploadUrl` 的 objectKey

**Files:**

- Create: `orangehome-core-service/src/material/services/material-version.service.spec.ts`

- [ ] **Step 1: 写入测试文件**

```typescript
import { MaterialVersionService } from './material-version.service';
import { MinioService } from '../../minio/minio.service';
import { LockService } from '../../common/lock.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

describe('MaterialVersionService SSR presign path', () => {
  it('builds object key under .../ssr/ when bundle is ssr', async () => {
    const minio = {
      getPresignedUploadUrl: jest.fn().mockResolvedValue('https://minio.example/presign'),
    };
    const materialModel = {
      findOne: jest.fn().mockReturnValue({
        lean: () => ({
          exec: () =>
            Promise.resolve({
              _id: '507f1f77bcf86cd799439011',
              materialUid: '@acme/widget',
              isDeleted: false,
            }),
        }),
      }),
    };
    const versionModel = {};
    const lock = { withLock: (_k: string, _t: number, fn: () => Promise<any>) => fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MaterialVersionService,
        { provide: MinioService, useValue: minio },
        { provide: LockService, useValue: lock },
        { provide: getModelToken('MaterialVersion'), useValue: versionModel },
        { provide: getModelToken('Material'), useValue: materialModel },
      ],
    }).compile();

    const svc = moduleRef.get(MaterialVersionService);
    await svc.getPresignedUploadUrl(
      '507f1f77bcf86cd799439011',
      '1.0.0',
      'index.cjs',
      'ssr',
    );

    expect(minio.getPresignedUploadUrl).toHaveBeenCalledWith(
      'materials/@acme/widget/1.0.0/ssr/index.cjs',
      expect.any(Number),
    );
  });
});
```

- [ ] **Step 2: 运行测试**

Run:

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-core-service
pnpm exec jest src/material/services/material-version.service.spec.ts --no-cache
```

Expected: `PASS`、1 test。

- [ ] **Step 3: Commit**

```bash
git add src/material/services/material-version.service.spec.ts
git commit -m "test(material-version): ssr presign object key"
```

---

## Phase B — 同步 `core.proto` 到 monorepo

### Task B1: 拷贝 proto 到 `server_cside` 与 `server_bside`

**Files:**

- Modify: `orangehome-main-monorepo/apps/server_cside/proto/core.proto`
- Modify: `orangehome-main-monorepo/apps/server_bside/proto/core.proto`

- [ ] **Step 1: 覆盖拷贝**

```bash
cp /Users/orange/Desktop/code/orangehome/orangehome-core-service/proto/core.proto \
   /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo/apps/server_cside/proto/core.proto
cp /Users/orange/Desktop/code/orangehome/orangehome-core-service/proto/core.proto \
   /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo/apps/server_bside/proto/core.proto
```

- [ ] **Step 2: Commit（在 monorepo `feat/ssr_support`）**

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo
git checkout feat/ssr_support
git add apps/server_cside/proto/core.proto apps/server_bside/proto/core.proto
git commit -m "chore(proto): sync core.proto for material SSR fields"
```

---

## Phase C — `orangehome-materials`：SSR 构建与 CLI

### Task C1: 为模板组件增加 `vite.ssr.config.ts`（以 `components/button` 为试点）

**Files:**

- Create: `orangehome-materials/components/button/vite.ssr.config.ts`（其它组件按同模式复制）
- Modify: `orangehome-materials/components/button/package.json`

- [ ] **Step 1: 新建 `vite.ssr.config.ts`**

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  plugins: [react({ jsxRuntime: 'classic' })],
  build: {
    emptyOutDir: true,
    ssr: true,
    outDir: 'dist-ssr',
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'MaterialSsr',
      formats: ['cjs'],
      fileName: () => 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/server'],
      output: { inlineDynamicImports: true },
    },
  },
});
```

（入口文件以组件实际 export 为准；须 **导出** SSR 侧可注册的组件映射，与后续 `common-plugin-runtime` 约定一致。）

- [ ] **Step 2: `package.json` scripts 增加**

```json
    "build:ssr": "vite build --config vite.ssr.config.ts"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-materials
git checkout feat/ssr_support
git add components/button/vite.ssr.config.ts components/button/package.json
git commit -m "feat(button): add SSR CJS build (pilot)"
```

---

### Task C2: `material-cli` — 预签名上传泛化

**Files:**

- Modify: `orangehome-materials/packages/@orangehome/material-cli/src/publish/upload-runtime.ts`
- Modify: `orangehome-materials/packages/@orangehome/material-cli/src/api/material-version.ts`

- [ ] **Step 1: `presignedUploadDistBundle` 增加参数 `bundle: 'browser' | 'ssr'`**，POST body JSON 增加 `"bundle": options.bundle`（字段名与 core `PresignedUploadBodyDto` 一致）。

- [ ] **Step 2: `UpsertMaterialVersionByUidDto` 增加 `ssrFileObjectKey: string` 与 `ssrMd5?: string`。**

- [ ] **Step 3: Commit**

```bash
git add packages/@orangehome/material-cli/src/publish/upload-runtime.ts packages/@orangehome/material-cli/src/api/material-version.ts
git commit -m "feat(material-cli): presign bundle and upsert SSR keys"
```

---

### Task C3: `publish` 命令双构建与双上传

**Files:**

- Modify: `orangehome-materials/packages/@orangehome/material-cli/src/commands/publish.ts`
- Modify: `orangehome-materials/packages/@orangehome/material-cli/src/publish/run-build.ts`（若当前无 `build:ssr` 调用能力则扩展）

- [ ] **Step 1: 在 `runPackageBuild(root)` 之后**执行 **`pnpm run build:ssr`**（物料仓以 pnpm 为准；实现已可用 `findPackageManager` 在仅有 `package-lock.json` 时回退 `npm run build:ssr`），失败则抛错并提示配置 `build:ssr`。

- [ ] **Step 2: 上传 `dist/index.js` 后**，再上传 `dist-ssr/index.cjs`（`presignedUploadDistBundle` 指定 `filename: 'index.cjs'`、`bundle: 'ssr'`）。

- [ ] **Step 3: `upsertMaterialVersionByUid` 传入 `ssrFileObjectKey` 与 `ssrMd5`（对 SSR 文件计算 md5）。**

- [ ] **Step 4: 增加 flag `--skip-ssr`**：为 true 时跳过 SSR 构建与上传（仅本地），**默认 false**。

- [ ] **Step 5: Commit**

```bash
git add packages/@orangehome/material-cli/src/commands/publish.ts packages/@orangehome/material-cli/src/publish/run-build.ts
git commit -m "feat(material-cli): publish uploads browser and SSR bundles"
```

---

## Phase D — `web_admin`

### Task D1: 类型与 `materialApi.getPresignedUploadUrl`

**Files:**

- Modify: `orangehome-main-monorepo/apps/web_admin/src/types/material.ts`
- Modify: `orangehome-main-monorepo/apps/web_admin/src/types/materialVersion.ts`
- Modify: `orangehome-main-monorepo/apps/web_admin/src/services/material.ts`

- [ ] **Step 1: `PresignedUploadBody` 增加 `bundle?: 'browser' | 'ssr'`**

- [ ] **Step 2: `MaterialVersion` 与 `CreateMaterialVersionParams` / `UpdateMaterialVersionParams` 增加 `ssrFileObjectKey?`、`ssrFileUrl?`；`Create` 侧与后端一致：**`ssrFileObjectKey` 必填**（TS 类型设为必填）。**

- [ ] **Step 3: `getPresignedUploadUrl` 将 `body` 原样 JSON 序列化（含 `bundle`）。**

- [ ] **Step 4: Commit**

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo
git add apps/web_admin/src/types/material.ts apps/web_admin/src/types/materialVersion.ts apps/web_admin/src/services/material.ts
git commit -m "feat(web_admin): types and presign for SSR bundle"
```

---

### Task D2: `MaterialVersions` 页面双上传与列表列

**Files:**

- Modify: `orangehome-main-monorepo/apps/web_admin/src/containers/MaterialVersions/index.tsx`

- [ ] **Step 1: state 增加 `ssrFileObjectKey`、`baselineSsrFileObjectKey`、`ssrFileReplaced`**, `resetForm` / `handleEdit` 同步重置。

- [ ] **Step 2: 增加 `handleSsrUpload`**（复制 `handleJsUpload` 逻辑，`getPresignedUploadUrl({ materialId, version, filename: fileInstance.name || 'index.cjs', bundle: 'ssr' })`）。

- [ ] **Step 3: `handleSubmit` 创建分支**：除 `fileObjectKey` 外校验 `ssrFileObjectKey`，`createTrigger` body 增加 `ssrFileObjectKey`。

- [ ] **Step 4: 更新分支**：若 `ssrFileReplaced` 则 `body.ssrFileObjectKey = ssrFileObjectKey`。

- [ ] **Step 5: 表格列增加 SSR**，渲染 `record.ssrFileUrl` 链接或 Tag「未配置」。

- [ ] **Step 6: Commit**

```bash
git add apps/web_admin/src/containers/MaterialVersions/index.tsx
git commit -m "feat(web_admin): material version SSR upload UI"
```

---

## Phase E — `server_cside` SSR 路由与渲染

### Task E1: 依赖与 `buildComponentsSsrMap`

**Files:**

- Modify: `orangehome-main-monorepo/apps/server_cside/package.json`
- Create: `orangehome-main-monorepo/apps/server_cside/src/runtime/components-ssr-map.util.ts`（或并入 service）

- [ ] **Step 1: 安装 React（版本与 `runtime-page.ejs` 中脚本一致，例如 18）**

Rush 主仓：**编辑** `apps/server_cside/package.json` 的 `dependencies` / `devDependencies` 加入 `react@18`、`react-dom@18` 及 `@types/react`、`@types/react-dom`，然后在 **monorepo 根目录**执行：

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo
rush update
```

（不在主仓根对单包使用裸 `npm install`，以免与 Rush/pnpm 锁不一致。）

- [ ] **Step 2: 在 `runtime-ssr.service.ts` 中实现 `buildComponentsSsrMap`**：逻辑镜像 `RuntimeService.buildComponentsMapWithMaterialVersionStatus`，但从 `row.latestVersion` 读取 `unwrapString(row.latestVersion.ssrFileUrl)` 与 `ssrFileObjectKey`，优先 URL，否则用与 runtime 相同的 fileKey → URL 拼接规则（提取公共函数避免重复硬编码 IP）。

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/runtime/
git commit -m "feat(server_cside): deps and SSR components map helper"
```

---

### Task E2: `RuntimeSsrService` 与 501 / 502 / EJS

**Files:**

- Create: `orangehome-main-monorepo/apps/server_cside/src/runtime/runtime-ssr.service.ts`
- Create: `orangehome-main-monorepo/apps/server_cside/src/runtime/views/runtime-page-ssr.ejs`
- Create: `orangehome-main-monorepo/apps/server_cside/src/runtime/runtime-ssr.controller.ts`
- Modify: `orangehome-main-monorepo/apps/server_cside/src/runtime/runtime.module.ts`

- [ ] **Step 1: `runtime-ssr.controller.ts`**

```typescript
import { Controller, Get, HttpCode, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RuntimeSsrService } from './runtime-ssr.service';
import { RuntimeParamsDto } from './dto/runtime-params.dto';

@Controller()
export class RuntimeSsrController {
  constructor(private readonly ssr: RuntimeSsrService) {}

  @Get('orangehome/runtime-ssr/:type/:pageid')
  async get(
    @Param() params: RuntimeParamsDto,
    @Query('lang') lang: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    if (params.type !== 'preview') {
      res.status(501);
      res.setHeader('Cache-Control', 'no-store');
      return JSON.stringify({ error: 'SSR not implemented for this runtime type', type: params.type });
    }
    const { html, cacheControl } = await this.ssr.renderPreview(params.pageid, lang);
    res.setHeader('Cache-Control', cacheControl);
    res.type('html');
    return html;
  }
}
```

（若项目偏好 `NotImplementedException` + 异常过滤器统一 JSON，可替换 `res.status(501)` 写法，但须保证 HTTP 501。）

- [ ] **Step 2: `runtime-page-ssr.ejs`**：复制 `runtime-page.ejs`，将 `<div id="app"></div>` 改为 `<div id="app"><%- ssrHtml %></div>`，并保留 `ORANGEHOME_DATA` 与脚本标签不变。

- [ ] **Step 3: `RuntimeSsrService.renderPreview`**：复用 `RuntimeService` 的页面解析与 `collectMaterialUids`（通过 **组合** `RuntimeService` 或 **提取** protected/shared 方法到 `runtime-page-resolve.util.ts` —— 优先小步提取避免大改）。调用 `buildComponentsSsrMap`；对缺失 ssr URL 的 uid `throw new BadGatewayException`。  
  **SSR 字符串生成**：首版可实现为加载 `@orangehome/common-plugin-runtime` 的 SSR CJS（路径来自配置）并调用导出的 `renderToString({ schema, componentModules })`，其中 `componentModules` 为按 uid `import()` 或 `require` 本地缓存模块的结果；具体 `require` 远程 URL 需 **下载到临时文件 + `createRequire`** 或项目已有加载器 —— 实现须与安全策略 §5.4 一致。

- [ ] **Step 4: `RuntimeModule` providers/controllers 注册 `RuntimeSsrService`、`RuntimeSsrController`。**

- [ ] **Step 5: Commit**

```bash
git add apps/server_cside/src/runtime/
git commit -m "feat(server_cside): runtime-ssr preview route and EJS"
```

---

### Task E3: `runtime-ssr.service.spec.ts`

**Files:**

- Create: `orangehome-main-monorepo/apps/server_cside/src/runtime/runtime-ssr.service.spec.ts`

- [ ] **Step 1: 501 由 controller 测；本文件测 service：当 mock core 返回的 `latestVersion` 无 `ssrFileUrl` 且无可用 key 时 `renderPreview` reject `BadGatewayException`。**

示例（按实际构造调整）：

```typescript
import { BadGatewayException } from '@nestjs/common';
import { RuntimeSsrService } from './runtime-ssr.service';

describe('RuntimeSsrService', () => {
  it('throws BadGateway when material lacks SSR url', async () => {
    const core = {
      getPage: jest.fn().mockResolvedValue({ data: { title: 'T' } }),
      getLatestPageVersionByStatus: jest.fn().mockResolvedValue({
        data: { pageSchemaJson: '{"schema":{"type":"root","children":[]}}' },
      }),
      getMaterialsWithLatestVersion: jest.fn().mockResolvedValue({
        data: [
          {
            material: { materialUid: '@x/y' },
            latestVersion: { fileUrl: { value: 'https://cdn/a.js' } },
          },
        ],
      }),
    };
    const config = { get: jest.fn() };
    const svc = new RuntimeSsrService(core as any, config as any);
    await expect(svc.renderPreview('page1', undefined)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
```

- [ ] **Step 2: Run**

```bash
cd /Users/orange/Desktop/code/orangehome/orangehome-main-monorepo/apps/server_cside
rushx test -- --testPathPattern=runtime-ssr.service.spec
```

Expected: `PASS`。（若 `rushx` 未在 PATH，可在 monorepo 根执行 `node common/scripts/install-run-rush.js` 或使用文档中的 Rush 推荐方式调用。）

- [ ] **Step 3: Commit**

```bash
git add apps/server_cside/src/runtime/runtime-ssr.service.spec.ts
git commit -m "test(server_cside): runtime SSR missing ssr url"
```

---

## Phase F — `web_builder` 预览 URL

### Task F1: 环境变量与工具函数

**Files:**

- Modify: `orangehome-main-monorepo/apps/web_builder/.env.example`
- Modify: `orangehome-main-monorepo/apps/web_builder/src/vite-env.d.ts`
- Modify: `orangehome-main-monorepo/apps/web_builder/src/utils/runtimePreviewUrl.ts`（若文件名不同则按实际）

- [ ] **Step 1: `.env.example` 增加**

```bash
# VITE_RUNTIME_PREVIEW_SSR_URL_TEMPLATE=http://127.0.0.1:4001/orangehome/runtime-ssr/preview/{pageId}
```

- [ ] **Step 2: `vite-env.d.ts` 增加 `readonly VITE_RUNTIME_PREVIEW_SSR_URL_TEMPLATE?: string`**

- [ ] **Step 3: 导出 `buildRuntimePreviewSsrUrl(pageId: string)`**，实现与现有 SSG 模板相同占位符替换。

- [ ] **Step 4: Commit**

```bash
git add apps/web_builder/.env.example apps/web_builder/src/vite-env.d.ts apps/web_builder/src/utils/runtimePreviewUrl.ts
git commit -m "feat(web_builder): SSR preview URL template env"
```

---

## Self-review（计划作者自检）

1. **Spec coverage**  
   - §0 分支 `feat/ssr_support`：已在 **Architecture** 与 Phase 各 `git checkout` 中体现。  
   - §2.1 501：`Task E1/E2` controller。  
   - §3 数据模型：`Task A1–A8`。  
   - §4 CLI/双产物：`Phase C`。  
   - §5 SSR 管线：`Phase E`（含 EJS、ssr map）。  
   - §6 BFF：**已纠正为 core-service HTTP**（Task A2/A6）；`web_admin` 直连 core。  
   - §7 web_admin：`Phase D`。  
   - §8 web_builder：`Phase F`。  
   - §9 测试：`Task A9`、`E3`。

2. **Placeholder scan**：无 TBD；SSR 具体 `require` 实现约束在 E2 Step 3 用明确句式描述。

3. **类型命名**：全文统一 `ssrFileObjectKey` / `ssrFileUrl` / `bundle: 'browser' | 'ssr'`；proto 使用 `ssr_file_*`。

---

**Plan complete and saved to** `orangehome-main-monorepo/docs/superpowers/plans/2026-04-18-ssr-support.md`.

**两种执行方式：**

1. **Subagent-Driven（推荐）** — 每个 Task 派独立子 Agent，任务间人工检查；须配合 **superpowers:subagent-driven-development**。  
2. **Inline Execution** — 本会话内按 Task 顺序执行；须配合 **superpowers:executing-plans** 与检查点。

**你更倾向哪一种？**
