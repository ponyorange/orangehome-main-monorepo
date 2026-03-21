# 4-CONTEXT.md

## 阶段 4: 画布与渲染系统

### 目标
实现画布容器和 Schema 渲染器，包括：
- 画布组件（Canvas）
- 标尺系统（Ruler）
- 网格显示
- SchemaRenderer 基础实现

### 设计决策

#### 画布结构

```
Canvas (容器)
├── Ruler (顶部标尺)
├── Ruler (左侧标尺)
└── CanvasContent (内容区)
    ├── Grid (网格背景)
    └── SchemaRenderer (渲染的组件树)
```

#### 画布尺寸

- 默认: 375 x 667 (iPhone 8 尺寸)
- 支持自定义尺寸
- 支持缩放 (zoom: 0.5 - 2.0)

#### 标尺功能

- 显示坐标刻度
- 拖拽时显示辅助线
- 支持像素/百分比切换

#### SchemaRenderer 职责

- 接收 ISchema 树
- 递归渲染组件
- 通过 ComponentManager 获取组件实现

---

*由 GSD 生成*
