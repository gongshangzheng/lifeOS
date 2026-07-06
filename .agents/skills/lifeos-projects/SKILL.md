---
name: lifeos-projects
description: lifeOS 项目时间线管理系统。管理 content/projects/ 下的项目文件，维护项目 chronology 时间线。当用户提到项目进展、添加项目事件、更新项目时间线时触发。
---

# lifeOS Projects — 项目时间线管理

管理 lifeOS 中的项目文件。每个项目是一个 Markdown 文件，包含 frontmatter（状态、时间、标签）和 timeline 数组（按时间排列的事件）。

## 数据结构

**目录**: `apps/web/content/projects/`

每个 `.md` 文件是一个项目：

```yaml
---
title: 钉钉数字人              # 必填，项目名称
slug: dingtalk-digital-human  # 可选，URL 标识（默认从文件名推断）
status: active                # active | completed | paused | planned
startDate: 2026-06-01         # ISO 日期
endDate: null                 # null（进行中）或 ISO 日期
category: work                # work | research | side-project | learning
tags: [钉钉, 数字人]           # 标签数组
summary: 一句话描述             # 可选
timeline:                     # 时间线事件数组
  - date: 2026-06-01
    title: 入职
    type: milestone           # milestone | progress | blocker | decision | note
    description: 描述          # 可选
---

正文（可选）：项目详细说明、技术栈、当前阶段等。
```

### Timeline 事件类型

| type | 含义 | 用途 |
|------|------|------|
| `milestone` | 里程碑 | 重要节点：入职、立项、上线、验收 |
| `progress` | 进展 | 日常推进：完成调研、写出原型 |
| `blocker` | 阻碍 | 卡点：环境问题、方案瓶颈 |
| `decision` | 决策 | 关键选择：技术选型、方向调整 |
| `note` | 备注 | 补充说明、上下文记录 |

## 前端展示

- **路由**: `/projects`
- **功能**: 多选项目标签 → 时间线按日期倒序合并展示
- **布局**: 左侧项目概览卡片 + 右侧 chronology 时间线

## Agent 操作指南

### 添加新项目

在 `apps/web/content/projects/` 下创建 `.md` 文件，frontmatter 必须含 `title` 和 `startDate`。

### 添加时间线事件

编辑对应项目文件的 frontmatter，在 `timeline` 数组末尾追加：

```yaml
  - date: 2026-07-06
    title: 完成性能基准测试
    type: progress
    description: 在 RTX 4090 上达到 30fps 实时推理
```

### 更新项目状态

修改 frontmatter 的 `status` 字段。项目结束时设 `endDate` 并将 `status` 改为 `completed`。

## 已有项目

- `dingtalk-digital-human.md` — 钉钉数字人方向（2026.06 — 至今，active）

## 注意事项

1. **timeline 事件按 date 排序由前端处理** — 写入时无需手动排序
2. **endDate 为 null 时表示进行中** — 前端会显示"→ 至今"
3. **文件名即 slug** — 不写 slug 时从文件名推断，建议文件名用 kebab-case
4. **构建后生效** — 修改 content/ 后需重新 build，前端才能看到变化
