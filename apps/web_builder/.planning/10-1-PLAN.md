# 10-1-PLAN.md

## 计划 10-1: 撤销/重做系统

### 实现步骤

1. **创建历史管理服务**
   - HistoryService
   - 存储历史记录
   - 管理当前位置

2. **实现命令模式**
   - Command 接口
   - ExecuteCommand
   - 记录可撤销操作

3. **集成到操作**
   - 修改 Schema 前记录
   - 支持批量操作

4. **实现快捷键**
   - Ctrl+Z 撤销
   - Ctrl+Y 重做
   - 按钮触发

### 验收标准

- [ ] 操作可撤销
- [ ] 撤销后可重做
- [ ] 历史记录限制 50 条
- [ ] 快捷键工作正常

---

## 在 Cursor 中执行

```
请实现撤销/重做系统。

任务:
1. 创建 src/extensions/undo-redo/services/HistoryService.ts:
   - 历史记录栈
   - 当前位置指针
   - 最大 50 条限制
   - undo(), redo() 方法

2. 创建 src/extensions/undo-redo/types.ts:
   - HistoryState 接口
   - Command 接口

3. 创建 src/extensions/undo-redo/components/UndoRedoButtons.tsx:
   - 撤销按钮
   - 重做按钮
   - 禁用状态

4. 集成到 Schema 操作:
   - 修改前保存快照
   - 批量操作合并
   - 监听 store 变化

5. 添加快捷键:
   - Ctrl+Z undo
   - Ctrl+Y redo
   - Ctrl+Shift+Z redo

验证:
- 添加组件后可撤销
- 撤销后可重做
- 历史记录不超 50 条
- 快捷键有效
```

---

*由 GSD 生成*
