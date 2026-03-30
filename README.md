# Orangehome Monorepo

基于 [Rush](https://rushjs.io/) 的 monorepo，包含以下项目：

| 项目 | 说明 | 技术栈 |
|------|------|--------|
| `@orangehome/web_platform` | Web 平台前端 | React + Vite + TypeScript |
| `@orangehome/web_builder` | Web 搭建器前端 | React + Vite + TypeScript |
| `@orangehome/server_bside` | B 端服务 | Nest.js |
| `@orangehome/server_cside` | C 端服务 | Nest.js |

## 环境要求

- Node.js：建议使用 **20.x LTS** 及以上（与工具链及团队约定一致）；Rush 校验的版本范围为 `>=18.12.0 <23.0.0`（见根目录 `rush.json` 中的 `nodeSupportedVersionRange`）
- 全局安装 Rush：`npm install -g @microsoft/rush`

## 快速开始

```bash
# 安装依赖（在仓库根目录执行）
rush update

# 构建所有项目
rush build

# 按项目开发
cd apps/web_platform && rushx dev          # 开发 web_platform (端口 3000)
cd apps/web_builder && rushx dev          # 开发 web_builder (端口 3001)
cd apps/server_bside && rushx start:dev   # 开发 server_bside (端口 4000)
cd apps/server_cside && rushx start:dev   # 开发 server_cside (端口 4001)
```

## 常用命令

- `rush update` - 安装/更新依赖
- `rush build` - 构建所有项目
- `rushx <script>` - 在当前项目下执行 package.json 中的脚本（需先 cd 到对应 app 目录）
- `rush list` - 列出所有项目

## 目录结构

```
main-monorepo/
├── apps/
│   ├── web_platform/    # React 前端 - 平台
│   ├── web_builder/     # React 前端 - 搭建器
│   ├── server_bside/    # Nest.js B 端服务
│   └── server_cside/    # Nest.js C 端服务
├── common/
│   └── config/
│       └── rush/        # Rush 公共配置
├── rush.json
└── README.md
```
