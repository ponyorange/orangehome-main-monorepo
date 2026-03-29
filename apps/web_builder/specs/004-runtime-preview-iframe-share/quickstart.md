# Quickstart: 004-runtime-preview-iframe-share

## 环境

在 `apps/web_builder/.env` 或 `.env.local` 增加（示例）：

```bash
VITE_RUNTIME_PREVIEW_URL_TEMPLATE=http://192.168.1.91:50055/orangehome/runtime/preview/{pageId}
```

将主机与路径换成你的 runtime 网关；`{pageId}` 勿改。

## 本地运行

```bash
cd apps/web_builder
rushx dev
```

打开带 `pageId` 的编辑页（与现有 `?pageId=` 约定一致）。

## 验收步骤

1. 点击 **预览** → 主区域为 **iframe**，加载上述模板对应地址（浏览器网络面板可见请求）。  
2. 点击 **分享** → 剪贴板内容为**同一**预览 URL（非 `#schema=`）。  
3. 在预览顶栏点击 **复制链接** → 再次得到相同 URL。  
4. 去掉 `pageId` 或清空模板 → 预览/分享应有提示，不写入无效链接。  
5. 若 iframe 被 CSP 拒绝 → 可见错误说明或「新窗口打开」（若已实现）。

## 质量门禁

```bash
cd apps/web_builder
rushx type-check
rushx lint
```
