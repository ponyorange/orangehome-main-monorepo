# 6-2-PLAN.md

## 计划 6-2: 组件删除与复制粘贴

### 实现步骤

1. **实现删除功能**
   - Delete 键监听
   - 右键菜单删除
   - 批量删除

2. **实现复制粘贴**
   - Ctrl+C 复制
   - Ctrl+V 粘贴
   - 粘贴时偏移位置

3. **实现剪切**
   - Ctrl+X 剪切
   - 先复制后删除

4. **快捷键服务**
   - 统一快捷键管理
   - 可配置快捷键

### 验收标准

- [ ] Delete 键删除选中组件
- [ ] Ctrl+C/V 复制粘贴
- [ ] Ctrl+X 剪切
- [ ] 粘贴时位置偏移

---

## 在 Cursor 中执行

```
请实现组件删除与复制粘贴。

任务:
1. 创建 src/common/services/KeyboardService.ts:
   - 键盘事件监听
   - 快捷键映射
   - 支持 Ctrl/Cmd 键

2. 创建 src/extensions/add/services/ClipboardService.ts:
   - 复制组件 Schema
   - 粘贴时生成新 ID
   - 位置偏移 (20px)

3. 实现删除功能:
   - Delete 键监听
   - 调用 schemaOperator.removeById
   - 批量删除支持

4. 创建右键菜单:
   - 复制、粘贴、删除
   - 置顶、置底

验证:
- Delete 删除选中组件
- Ctrl+C/V 复制粘贴
- 粘贴位置有偏移
```

---

*由 GSD 生成*
