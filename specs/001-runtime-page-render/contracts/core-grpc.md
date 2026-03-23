# gRPC Contract（调用方视角）: core-service

**目标地址**：环境变量 `CORE_SERVICE_GRPC_URL`（如 `host:50051`）。  
**Proto 文件**：与 core 仓库 `proto/core.proto` 同步；package `orangehome.core`。  
**Metadata**：`authorization: Bearer <JWT>`，JWT 来自 `CORE_SERVICE_GRPC_JWT`（或等价配置）。

## 服务与方法（本特性使用）

### PageService

- `GetPage`：`GetPageRequest { id, with_deleted=false }`  
  - 用途：校验页面存在、取页面 `title`（等元数据）。

### PageVersionService

- `GetLatestPageVersionByStatus`：`GetLatestPageVersionByStatusRequest { page_id, version_status }`  
  - **release**：`version_status = 2`（`published`，core 取 `is_published` 且 `version_number` 最大）。  
  - **preview / dev**：`version_status = 1`（`latest_draft`，core 取 `is_latest_draft`）。  
  - 无匹配版本时 core 返回 `NOT_FOUND`。

### MaterialService

- `GetMaterialsWithLatestVersion`：`GetMaterialsWithLatestVersionRequest { material_uids[], version_status }`  
  - **release/preview**：`version_status = 2`（已发布）。  
  - **dev 第一步**：`version_status = 2`（用于解析 `material.id`）。

### MaterialVersionService

- `ListMaterialVersions`：`ListMaterialVersionsRequest { material_id, page=1, limit=1 }`，**省略 status**  
  - **dev 第二步**：取全局最新 `version_code` 的一条，读 `file_url`。

## 字段映射

- 页面结构：`PageVersionMessage.page_schema_json` → 解析 JSON。  
- 脚本 URL：`MaterialVersionMessage.file_url`（proto `file_url`）；若空则视为失败（按 spec 默认整页失败）。

## 错误语义

gRPC `NOT_FOUND` → HTTP 404；`INVALID_ARGUMENT` → 400；`UNAVAILABLE`/`DEADLINE_EXCEEDED` → 502/504；其它 → 502。
