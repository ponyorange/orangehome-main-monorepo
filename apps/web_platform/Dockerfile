# 构建阶段（DaoCloud 公共镜像，避免 Docker Hub 连接失败）
FROM docker.m.daocloud.io/library/node:20-alpine AS builder

WORKDIR /app

# 复制整个 monorepo（Rush 需要完整结构）
COPY rush.json ./
COPY common ./common
COPY apps ./apps

# 安装 Rush 并构建 web_platform
RUN corepack enable pnpm && \
    npm install -g @microsoft/rush@5.115.0 && \
    rush update && \
    rush build -t @orangehome/web_platform

# 运行阶段：Nginx 提供静态文件（DaoCloud 公共镜像）
FROM docker.m.daocloud.io/library/nginx:alpine

COPY --from=builder /app/apps/web_platform/dist /usr/share/nginx/html
COPY apps/web_platform/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
