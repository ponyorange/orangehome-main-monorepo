#!/bin/bash
# 本地构建后打包为 Docker 镜像（无需在 Docker 内拉取 node）
# 适用于网络受限环境

set -e
cd "$(dirname "$0")/../.."

echo ">>> 本地构建 web_platform..."
rush build -t @orangehome/web_platform

echo ">>> 构建 Docker 镜像（仅需拉取 nginx，约 40MB）..."
docker build -f apps/web_platform/Dockerfile.dist -t orangehome/web_platform:latest .

echo ">>> 完成！运行: docker run -d -p 8080:80 orangehome/web_platform:latest"
