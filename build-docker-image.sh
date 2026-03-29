#!/usr/bin/env bash
# 构建包含全部 apps 的单一 Docker 镜像，并导出 tar 到 docker_images/
#
# 若拉取 node 基础镜像失败（Docker Hub / IPv6 超时），可先指定国内或私有镜像再构建，例如：
#   export BASE_IMAGE=docker.m.daocloud.io/library/node:22-bookworm-slim
#   ./build-docker-image.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "错误: 未找到 docker 命令，请先安装并启动 Docker。" >&2
  exit 1
fi

IMAGE_NAME="${IMAGE_NAME:-orangehome-monorepo}"
IMAGE_TAG="${IMAGE_TAG:-all}"
FULL_TAG="${IMAGE_NAME}:${IMAGE_TAG}"

# 默认 node:22-bookworm-slim（与 Dockerfile 一致）。可换镜像源，见文件头注释。
BASE_IMAGE="${BASE_IMAGE:-node:22-bookworm-slim}"

# 默认：项目根目录下的 docker_images；可 export DOCKER_IMAGES_DIR=其他路径 覆盖
OUT_DIR="${DOCKER_IMAGES_DIR:-$ROOT/docker_images}"
mkdir -p "$OUT_DIR"

TAR_NAME="${IMAGE_NAME}_${IMAGE_TAG}.tar"
OUT_FILE="${OUT_FILE:-$OUT_DIR/$TAR_NAME}"

echo "构建镜像: $FULL_TAG（并打标签 ${IMAGE_NAME}:latest），基础镜像: $BASE_IMAGE"
docker build \
  -f "$ROOT/docker/Dockerfile.all" \
  --build-arg "BASE_IMAGE=$BASE_IMAGE" \
  -t "$FULL_TAG" \
  -t "${IMAGE_NAME}:latest" \
  "$ROOT"

echo "导出为 tar: $OUT_FILE"
docker save -o "$OUT_FILE" "$FULL_TAG"

echo "完成。加载示例: docker load -i \"$OUT_FILE\""
echo "运行示例: docker run --rm -p 50054:50054 -p 50055:50055 -p 60061:60061 -p 60062:60062 ${IMAGE_NAME}:latest"
echo "  前端: http://localhost:60062/platform/  http://localhost:60062/builder/"
