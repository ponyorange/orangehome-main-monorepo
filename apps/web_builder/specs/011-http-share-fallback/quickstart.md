# Quickstart: 011 HTTP 分享与复制兜底

## 前置

- 配置 `VITE_RUNTIME_PREVIEW_URL_TEMPLATE` 且含 `{pageId}`。  
- 打开带有效 `pageId` 的编辑器页。

## 1. HTTP（非 localhost）

1. 使用 `http://<局域网 IP 或域名>/...` 访问（非 `https://`，非 `http://localhost`）。  
2. 点击「分享」。  
3. **预期**：不应**仅**出现「请使用 HTTPS」类终止提示；应出现复制成功 Toast，或出现含完整 URL 的弹窗并可「新标签页打开」。

## 2. HTTPS 或 localhost

1. 在正常可写剪贴板环境点击「分享」。  
2. **预期**：与改进前一致的成功 Toast；**不**无故弹出完整链接 Modal。

## 3. 强制 Modal 路径（可选）

1. 使用浏览器权限禁止剪贴板，或选用两种复制均失败的场景。  
2. 点击「分享」。  
3. **预期**：Modal 展示与 `buildRuntimePreviewUrl` 一致的 URL；点击「新标签页打开」在未拦截时打开正确地址。

## 4. 弹窗拦截

1. 浏览器阻止 `window.open`。  
2. 在 Modal 内点击打开。  
3. **预期**：有明确 Toast 或提示；用户仍可通过手动复制 URL 访问。

## 5. 连点「分享」

1. 在一次分享请求尚未结束时再次点击「分享」或「复制链接」。  
2. **预期**：重复点击被忽略（`inFlight`），不叠加多次保存或重复打开多个 Modal。  
3. Modal 已打开时再次分享：若本次自动复制成功，应关闭 Modal 并出现成功 Toast；若仍失败，Modal 内 URL 更新为当前 `pageId` 对应链接。

## 开发者

```bash
cd apps/web_builder && npm run type-check
```
