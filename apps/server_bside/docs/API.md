# OrangeHome BFF API 接口文档

## 概述

本文档描述了 OrangeHome BFF (Backend for Frontend) 服务的 RESTful API 接口。

- **Base URL**: `http://localhost:4000/api`
- **Swagger UI**: `http://localhost:4000/api-docs`
- **认证方式**: Bearer Token (JWT)

## 目录

1. [认证模块 (Auth)](#认证模块-auth)
2. [项目管理 (Projects)](#项目管理-projects)
3. [页面管理 (Pages)](#页面管理-pages)
4. [页面版本管理 (Page Versions)](#页面版本管理-page-versions)

---

## 认证模块 (Auth)

### 1. 发送邮箱验证码

**接口**: `POST /api/auth/send-email-code`

**描述**: 向指定邮箱发送验证码，用于注册或重置密码

**请求头**: 无

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 是 | 邮箱地址，必须符合邮箱格式 |

**响应示例**:
```json
{
  "message": "验证码发送成功"
}
```

---

### 2. 用户注册

**接口**: `POST /api/auth/register`

**描述**: 使用邮箱验证码完成用户注册

**请求头**: 无

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "code": "123456",
  "nickname": "张三"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，长度6-50位 |
| confirmPassword | string | 是 | 确认密码，必须与密码一致 |
| code | string | 是 | 邮箱验证码 |
| nickname | string | 否 | 用户昵称 |

**响应示例**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nickname": "张三",
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600
}
```

---

### 3. 用户登录

**接口**: `POST /api/auth/login`

**描述**: 使用邮箱和密码登录

**请求头**: 无

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**响应示例**:
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "张三",
    "avatar": "https://..."
  }
}
```

---

### 4. 重置密码

**接口**: `POST /api/auth/reset-password`

**描述**: 使用邮箱验证码重置密码

**请求头**: 无

**请求体**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 邮箱验证码 |
| newPassword | string | 是 | 新密码，长度6-50位 |

**响应示例**:
```json
{
  "message": "密码重置成功"
}
```

---

### 5. 用户登出

**接口**: `POST /api/auth/logout`

**描述**: 注销当前用户的登录状态

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**: 无

**响应示例**:
```json
{
  "message": "登出成功"
}
```

---

### 6. 获取当前用户信息

**接口**: `GET /api/auth/me`

**描述**: 获取当前登录用户的信息

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**: 无

**响应示例**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nickname": "张三",
  "avatar": "https://..."
}
```

---

## 项目管理 (Projects)

**所有接口需要认证**: `Authorization: Bearer <token>`

### 1. 新建项目

**接口**: `POST /api/projects`

**描述**: 创建新项目

**请求体**:
```json
{
  "projectCode": "my-project",
  "projectName": "我的项目",
  "businessId": "business-uuid",
  "description": "项目描述",
  "config": "{}"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| projectCode | string | 是 | 项目编码，唯一标识 |
| projectName | string | 是 | 项目名称 |
| businessId | string(UUID) | 是 | 所属业务线ID |
| description | string | 否 | 项目描述 |
| config | string | 否 | 项目配置(JSON字符串) |

**响应示例**:
```json
{
  "id": "uuid",
  "projectCode": "my-project",
  "projectName": "我的项目",
  "businessId": "business-uuid",
  "businessName": "业务线名称",
  "description": "项目描述",
  "config": "{}",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 2. 项目列表

**接口**: `GET /api/projects`

**描述**: 获取项目列表，支持分页和搜索

**查询参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| search | string | 否 | 搜索关键词(项目名称或编码) |
| businessId | string | 否 | 按业务线筛选 |

**响应示例**:
```json
{
  "data": [
    {
      "id": "uuid",
      "projectCode": "my-project",
      "projectName": "我的项目",
      "businessId": "business-uuid",
      "businessName": "业务线名称",
      "description": "项目描述",
      "config": "{}",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### 3. 获取项目详情

**接口**: `GET /api/projects/:id`

**描述**: 获取指定项目的详细信息

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 项目ID |

**响应示例**:
```json
{
  "id": "uuid",
  "projectCode": "my-project",
  "projectName": "我的项目",
  "businessId": "business-uuid",
  "businessName": "业务线名称",
  "description": "项目描述",
  "config": "{}",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 4. 修改项目信息

**接口**: `PUT /api/projects/:id`

**描述**: 修改项目信息

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 项目ID |

**请求体**:
```json
{
  "projectName": "新项目名",
  "description": "新描述",
  "config": "{}"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| projectName | string | 否 | 项目名称 |
| description | string | 否 | 项目描述 |
| config | string | 否 | 项目配置 |

**响应示例**:
```json
{
  "id": "uuid",
  "projectCode": "my-project",
  "projectName": "新项目名",
  "businessId": "business-uuid",
  "businessName": "业务线名称",
  "description": "新描述",
  "config": "{}",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

---

### 5. 删除项目

**接口**: `DELETE /api/projects/:id`

**描述**: 删除指定项目

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 项目ID |

**查询参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| permanent | boolean | 否 | 是否永久删除，默认false(软删除) |

**响应示例**:
```json
{
  "message": "删除成功"
}
```

---

## 页面管理 (Pages)

**所有接口需要认证**: `Authorization: Bearer <token>`

### 1. 新建页面

**接口**: `POST /api/pages`

**描述**: 在项目中创建新页面

**请求体**:
```json
{
  "projectId": "project-uuid",
  "path": "/home",
  "title": "首页",
  "description": "网站首页"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| projectId | string(UUID) | 是 | 所属项目ID |
| path | string | 是 | 页面路径，如 `/home` |
| title | string | 是 | 页面标题 |
| description | string | 否 | 页面描述 |

**响应示例**:
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "projectName": "我的项目",
  "path": "/home",
  "title": "首页",
  "description": "网站首页",
  "publishedVersionId": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 2. 页面列表

**接口**: `GET /api/pages`

**描述**: 获取项目的页面列表

**查询参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| projectId | string(UUID) | 是 | 项目ID |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| search | string | 否 | 搜索关键词(页面标题或路径) |

**响应示例**:
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "project-uuid",
      "projectName": "我的项目",
      "path": "/home",
      "title": "首页",
      "description": "网站首页",
      "publishedVersionId": "version-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

---

### 3. 获取页面详情

**接口**: `GET /api/pages/:id`

**描述**: 获取指定页面的详细信息

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 页面ID |

**响应示例**:
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "projectName": "我的项目",
  "path": "/home",
  "title": "首页",
  "description": "网站首页",
  "publishedVersionId": "version-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 4. 修改页面信息

**接口**: `PUT /api/pages/:id`

**描述**: 修改页面信息

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 页面ID |

**请求体**:
```json
{
  "path": "/new-home",
  "title": "新首页",
  "description": "新描述"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| path | string | 否 | 页面路径 |
| title | string | 否 | 页面标题 |
| description | string | 否 | 页面描述 |

**响应示例**:
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "projectName": "我的项目",
  "path": "/new-home",
  "title": "新首页",
  "description": "新描述",
  "publishedVersionId": "version-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

---

### 5. 删除页面

**接口**: `DELETE /api/pages/:id`

**描述**: 删除指定页面

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 页面ID |

**查询参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| permanent | boolean | 否 | 是否永久删除，默认false |

**响应示例**:
```json
{
  "message": "删除成功"
}
```

---

## 页面版本管理 (Page Versions)

**所有接口需要认证**: `Authorization: Bearer <token>`

### 1. 保存页面内容

**接口**: `POST /api/page-versions/save`

**描述**: 保存页面的新版本内容

**请求体**:
```json
{
  "pageId": "page-uuid",
  "pageSchemaJson": "{\"components\":[],\"props\":{}}",
  "userId": "user-uuid"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| pageId | string(UUID) | 是 | 页面ID |
| pageSchemaJson | string(JSON) | 是 | 页面内容Schema(JSON字符串) |
| userId | string(UUID) | 是 | 操作用户ID |

**响应示例**:
```json
{
  "id": "uuid",
  "pageId": "page-uuid",
  "versionNumber": 5,
  "comment": null,
  "pageSchemaJson": "{\"components\":[],\"props\":{}}",
  "isLatestDraft": true,
  "isPublished": false,
  "publishedAt": null,
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. 发布页面版本

**接口**: `POST /api/page-versions/:id/publish`

**描述**: 将指定版本发布为线上版本

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 版本ID |

**响应示例**:
```json
{
  "id": "uuid",
  "pageId": "page-uuid",
  "versionNumber": 3,
  "comment": null,
  "pageSchemaJson": "{\"components\":[],\"props\":{}}",
  "isLatestDraft": false,
  "isPublished": true,
  "publishedAt": "2024-01-15T12:00:00Z",
  "createdBy": "user-uuid",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

### 3. 回滚到指定版本

**接口**: `POST /api/page-versions/:id/rollback`

**描述**: 将页面回滚到指定版本

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 要回滚到的版本ID |

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "id": "new-version-uuid",
  "pageId": "page-uuid",
  "versionNumber": 6,
  "comment": "回滚到版本 v3",
  "pageSchemaJson": "{\"components\":[],\"props\":{}}",
  "isLatestDraft": true,
  "isPublished": false,
  "publishedAt": null,
  "createdBy": "current-user",
  "createdAt": "2024-01-15T14:00:00Z",
  "updatedAt": "2024-01-15T14:00:00Z"
}
```

---

### 4. 删除页面版本

**接口**: `DELETE /api/page-versions/:id`

**描述**: 删除指定页面版本

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 版本ID |

**响应示例**:
```json
{
  "message": "删除成功"
}
```

---

### 5. 获取版本详情

**接口**: `GET /api/page-versions/:id`

**描述**: 获取指定版本的详细信息

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string(UUID) | 版本ID |

**响应示例**:
```json
{
  "id": "uuid",
  "pageId": "page-uuid",
  "versionNumber": 5,
  "comment": "添加导航栏组件",
  "pageSchemaJson": "{\"components\":[{\"type\":\"navbar\"}],\"props\":{}}",
  "isLatestDraft": true,
  "isPublished": false,
  "publishedAt": null,
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 6. 页面版本列表

**接口**: `GET /api/page-versions`

**描述**: 获取页面的所有版本历史

**查询参数**:
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| pageId | string(UUID) | 是 | 页面ID |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

**响应示例**:
```json
{
  "data": [
    {
      "id": "uuid-5",
      "pageId": "page-uuid",
      "versionNumber": 5,
      "comment": "最新修改",
      "pageSchemaJson": "{...}",
      "isLatestDraft": true,
      "isPublished": false,
      "publishedAt": null,
      "createdBy": "user-uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid-3",
      "pageId": "page-uuid",
      "versionNumber": 3,
      "comment": null,
      "pageSchemaJson": "{...}",
      "isLatestDraft": false,
      "isPublished": true,
      "publishedAt": "2024-01-10T12:00:00Z",
      "createdBy": "user-uuid",
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-10T12:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

## 错误处理

### HTTP 状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权，token无效或过期 |
| 403 | Forbidden | 禁止访问，权限不足 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": ["邮箱格式不正确", "密码不能为空"],
  "error": "Bad Request"
}
```

或

```json
{
  "statusCode": 500,
  "message": "服务错误",
  "error": "Internal Server Error"
}
```

---

## 环境变量配置

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| PORT | 4000 | 服务端口 |
| API_PREFIX | api | API前缀 |
| CORS_ORIGIN | * | CORS允许来源 |
| CORE_SERVICE_GRPC_URL | localhost:50051 | 核心服务gRPC地址 |

---

## 技术栈

- **框架**: NestJS v10
- **协议**: HTTP/REST + gRPC (内部通信)
- **认证**: JWT Bearer Token
- **文档**: Swagger/OpenAPI
- **验证**: class-validator

---

*文档版本: 1.0*
*最后更新: 2024-03-09*
