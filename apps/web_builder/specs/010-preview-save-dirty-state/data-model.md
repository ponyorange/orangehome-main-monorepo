# Data Model: 010 已保存状态与预览前保存

## Store: 文档与持久化对齐（建议名 `documentSyncStore`）

| 字段 / 方法 | 类型 | 说明 |
|-------------|------|------|
| `isDirty` | `boolean` | `true` = 当前编辑区 schema **可能**未与上次成功保存或初始加载版本对齐；`false` = 已对齐 |
| `markClean` | `() => void` | 持久化回填完成或保存成功回调中调用 |
| `markDirty` | `() => void` | 用户编辑、导入、undo/redo（MVP）等调用 |

## 与 `schemaStore` 的关系

- **权威文档**：仍为 `schemaStore.schema`。  
- **isDirty**：不持久化到服务端；刷新页面后以重新拉取的 `pageVersion` 为准再次 `markClean()`。

## `setSchema` 扩展（概念）

| `syncSource`（示例枚举） | 行为 |
|--------------------------|------|
| `remote-bootstrap` | 应用服务端 `pageSchema`；`markClean()` |
| `save-success` | 可选：保存成功后若 schema 未再变，仅 `markClean()`（通常保存不写回新 schema 时只需 `markClean()`） |
| `user`（默认） | 用户编辑、导入等；`markDirty()` |

实际 API 形状由实现选用 `setSchema` 第三参或独立 action，以代码审阅为准。

## 预览编排状态（可选）

| 字段 | 类型 | 说明 |
|------|------|------|
| `isPreviewPreparing` | `boolean` | 预览前保存进行中；控制预览按钮 loading |

可合并入 Toolbar 局部 state，不强制全局 store。

## 状态转移（摘要）

```
加载 pageVersion 并 setSchema(remote-bootstrap)
  → markClean()

用户编辑 setSchema(user)
  → markDirty()

保存成功
  → markClean()

保存失败
  → isDirty 不变（仍为 true 若曾脏）

点击预览 & isDirty
  → isPreviewPreparing=true → await save → 成功 → openPreview → false
                                → 失败 → Toast，不 openPreview → false

点击预览 & !isDirty
  → openPreview()
```
