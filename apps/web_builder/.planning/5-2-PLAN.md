# 5-2-PLAN.md

## 计划 5-2: 拖拽系统实现

### 实现步骤

1. **创建 OrangeDrag 类**
   - 监听 mousedown/mousemove/mouseup
   - 计算拖拽距离
   - 生成拖拽镜像

2. **实现拖拽镜像**
   - 克隆被拖拽元素
   - 半透明样式
   - 跟随鼠标移动

3. **集成到组件拖拽**
   - 从组件面板拖拽到画布
   - 画布内组件位置调整

4. **拖拽区域检测**
   - 检测拖拽到画布
   - 计算放置位置

### 验收标准

- [ ] 拖拽时显示镜像
- [ ] 拖拽距离阈值生效
- [ ] 正确计算放置位置
- [ ] 释放后添加到画布

---

## 在 Cursor 中执行

```
请实现拖拽系统。

任务:
1. 创建 src/common/base/OrangeDrag/index.ts:
   - OrangeDrag 类
   - mousedown 事件监听
   - 拖拽距离计算 (threshold: 5px)
   - 拖拽镜像创建
   - mousemove 跟随
   - mouseup 完成

2. 创建 src/common/base/OrangeDrag/types.ts:
   - OrangeDragOptions 接口
   - DragEvent 类型

3. 创建 src/extensions/select-and-drag/hooks/useDrag.ts:
   - 封装 OrangeDrag
   - 处理拖拽开始/移动/结束

4. 创建 src/extensions/add/components/DraggableComponent.tsx:
   - 可拖拽的组件项
   - 从面板拖拽到画布

验证:
- 从面板拖拽组件到画布
- 拖拽时显示半透明镜像
- 释放后正确添加组件
```

---

*由 GSD 生成*
