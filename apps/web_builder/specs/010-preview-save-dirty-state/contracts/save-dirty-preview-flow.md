# Contract: 保存对齐状态与预览前保存流程

## 参与者

- **编辑器会话**：持有 `schemaStore` 与「脏」状态。
- **持久化 API**：现有 `saveBuilderPageVersion`（或封装函数 `performSave`）。

## 不变量

1. **`isDirty === false`** 表示产品语义上的「与最近一次成功持久化或本次初始加载版本对齐」（实现细节见 plan / research）。  
2. **保存失败**不得执行 `markClean()`。  
3. **预览打开**（`openPreview` 变为 true）在「曾脏」的路径上，仅允许发生在 **保存成功**之后（或用户已手动保存使 `isDirty` 已为 false）。

## 预览入口序列

```
用户点击「预览」
  IF isDirty
    展示 loading（禁用重复提交或排队）
    TRY performSave()
      IF 失败 → 错误提示，终止，不打开预览
      IF 成功 → markClean()，openPreview()
    FINALLY 清除预览 loading
  ELSE
    openPreview()
```

## 与工具栏「保存」的关系

- `performSave` 与「保存」按钮共用同一持久化逻辑与校验（`pageId`、`user` 等）。  
- 预览路径**不得**使用绕过校验的私有 API。

## 版本

- **010**：首版引入脏标记与预览前保存。
