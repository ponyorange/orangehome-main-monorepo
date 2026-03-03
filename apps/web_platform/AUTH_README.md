# @orangehome/web_platform - 登录注册功能

## 新增功能

✅ 邮箱验证码注册
✅ 邮箱密码登录  
✅ 登录状态保持
✅ 路由守卫

## 文件结构

```
src/
├── api/
│   └── auth.ts          # 认证相关 API
├── pages/
│   ├── Login.tsx        # 登录页面
│   ├── Register.tsx     # 注册页面
│   ├── Dashboard.tsx    # 登录后首页（示例）
│   └── Auth.css         # 认证页面样式
├── App.tsx              # 路由配置
└── ...
```

## 页面路由

| 路径 | 说明 |
|------|------|
| `/login` | 登录页面 |
| `/register` | 注册页面 |
| `/dashboard` | 登录后的首页（需登录） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 使用说明

### 注册流程
1. 访问 `/register`
2. 输入邮箱地址
3. 点击"获取验证码"（演示模式：任意验证码都可通过）
4. 设置密码（至少6位）
5. 点击注册

### 登录流程
1. 访问 `/login`
2. 输入注册时的邮箱和密码
3. 登录成功后跳转到 `/dashboard`

## 后端对接

当前实现为**前端模拟模式**，数据存储在 localStorage。

如需对接真实后端，修改 `src/api/auth.ts` 中的 API_BASE_URL：

```typescript
const API_BASE_URL = 'http://your-api-server.com/api';
```

后端需要提供以下接口：

### 1. 发送验证码
```http
POST /auth/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 2. 注册
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "password": "password123"
}
```

### 3. 登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# 响应
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "email": "user@example.com"
  }
}
```

## 技术栈

- React 18
- TypeScript
- React Router v6
- Vite

## 注意事项

- 当前为演示模式，验证码校验逻辑需要后端实现
- Token 存储在 localStorage，生产环境建议考虑安全性
- 密码明文传输，生产环境需要 HTTPS + 加密
