# @orangehome/web_platform - 登录注册模块

基于 **Semi UI** 组件库重构的专业级登录注册模块。

## 技术栈

- **框架**: React 18 + TypeScript
- **UI 组件库**: @douyinfe/semi-ui (字节跳动设计体系)
- **样式**: SCSS
- **路由**: React Router v6
- **构建工具**: Vite

## 目录结构

```
src/
├── components/          # 通用组件
│   ├── AuthLayout/     # 认证页面布局
│   ├── LoginForm/      # 登录表单
│   └── RegisterForm/   # 注册表单
├── containers/          # 页面容器（业务逻辑）
│   ├── LoginContainer/
│   ├── RegisterContainer/
│   └── DashboardContainer/
├── hooks/               # 自定义 Hooks
│   ├── useAuth.ts      # 认证状态管理
│   └── useCountdown.ts # 倒计时
├── services/            # API 服务
│   ├── auth.ts         # 认证 API
│   └── config.ts       # 配置
├── styles/              # 全局样式
│   └── global.scss
├── types/               # TypeScript 类型
│   └── auth.ts
└── utils/               # 工具函数
    └── validators.ts
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 页面路由

| 路径 | 说明 | 权限 |
|------|------|------|
| `/login` | 登录页面 | 公开 |
| `/register` | 注册页面 | 公开 |
| `/dashboard` | 工作台首页 | 需登录 |

## 功能特性

### 登录
- 邮箱 + 密码登录
- 记住我选项
- 表单验证
- 错误提示 (Toast)

### 注册
- 邮箱 + 验证码 + 密码
- 60秒验证码倒计时
- 密码强度验证（≥6位）
- 二次密码确认

### 认证状态
- 登录状态持久化 (localStorage)
- 路由守卫（未登录自动跳转）
- 已登录用户访问登录页自动跳转 Dashboard

## 后端对接

当前实现为前端模拟模式，数据存储在 localStorage。

如需对接真实后端，修改 `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-api-server.com/api',
  // ...
};
```

后端需提供以下接口：

### 1. 发送验证码
```http
POST /api/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "register"
}

Response:
{
  "success": true,
  "code": 200,
  "message": "验证码已发送"
}
```

### 2. 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "password": "password123"
}
```

### 3. 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "1",
      "email": "user@example.com"
    }
  }
}
```

### 4. 获取当前用户
```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 自定义 Hooks

### useAuth
```typescript
const { user, isAuthenticated, loading, login, register, sendCode, logout } = useAuth();
```

### useCountdown
```typescript
const [countdown, start, reset, isRunning] = useCountdown(60);
```

## 组件使用

### LoginForm
```tsx
<LoginForm 
  onSubmit={async (values) => {}}
  loading={false}
/>
```

### RegisterForm
```tsx
<RegisterForm 
  onSubmit={async (values) => {}}
  onSendCode={async (email) => {}}
  loading={false}
/>
```

## 开发规范

1. **组件**: 使用函数组件 + TypeScript
2. **样式**: SCSS，组件级样式放在组件目录
3. **类型**: 统一放在 `src/types/` 目录
4. **API**: 统一放在 `src/services/` 目录
5. **Hooks**: 业务逻辑抽离到自定义 hooks

## 注意事项

- 当前为演示模式，验证码任意填写均可通过
- 生产环境需要 HTTPS + 后端验证码验证
- Token 存储在 localStorage，生产环境建议使用 httpOnly cookie
