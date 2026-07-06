---
name: lifeos-projects
description: lifeOS 项目与任务树管理系统。管理 content/projects/ 下的项目文件和独立任务树 JSON。支持 Git 风格的任务树查看、CLI 任务管理、日历集成。当用户提到项目进展、任务树、添加项目事件、更新任务状态时触发。
---

# lifeOS Projects — 项目与任务树管理

管理 lifeOS 中的项目。每个项目是一个文件夹，包含所有相关文件：
1. **项目文件夹** (`content/projects/{slug}/`) — 项目的所有文件都在这个目录下
2. **README** (`content/projects/{slug}/README.md`) — 项目概览、状态、时间线里程碑
3. **任务树** (`content/projects/{slug}/tasks.json`) — Git 风格的可展开任务树
4. **笔记** (`content/projects/{slug}/notes/`) — 任务描述文章（可选，notePath 引用）

## 数据结构

### 项目 Markdown (`content/projects/`)

```yaml
---
title: 钉钉数字人
slug: dingtalk-digital-human
status: active                # active | completed | paused | planned
startDate: 2026-06-01
endDate: null
category: work                # work | research | side-project | learning
tags: [钉钉, 数字人]
summary: 一句话描述
timeline:
  - date: 2026-06-01
    title: 入职
    type: milestone           # milestone | progress | blocker | decision | note
    description: 描述
---
正文（可选）
```

### 任务树 JSON (`content/projects/{slug}/tasks.json`)

```json
{
  "project": "dingtalk-digital-human",
  "tasks": [
    {
      "id": "t1",
      "title": "卡通数字人",
      "status": "active",
      "startDate": "2026-07-01",
      "endDate": null,
      "description": "相关算法、主观测试和客观指标测试",
      "children": [
        { "id": "t1-1", "title": "算法调研", "status": "active", "startDate": null, "endDate": null, "description": "", "children": [] }
      ]
    }
  ]
}
```

**Task 字段:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | Y | 唯一标识（如 t1, t1-1, t1-1-2）|
| title | string | Y | 任务名称 |
| status | enum | Y | `active` / `completed` / `planned` / `blocked` / `paused` |
| startDate | string? | N | ISO 日期，有值则显示在日历 |
| endDate | string? | N | ISO 日期 |
| description | string? | N | 详细描述 |
| children | Task[] | Y | 子任务（可为空数组）|

### 前端展示

- **Projects 页面** (`/projects`): 项目标签选择 → Git 风格任务树（展开/折叠子树、点击查看详情）→ 时间线 Tab
- **Calendar 页面** (`/calendar`): 有 startDate 的任务以项目颜色显示为日历事件，点击可查看详情和子任务

## CLI 脚本

**路径**: `scripts/plans.mjs`

### 任务树命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `tasks` | 列出任务树 | `node scripts/plans.mjs tasks --project dingtalk-digital-human` |
| `task-update` | 更新任务状态 | `node scripts/plans.mjs task-update --project slug --task-id t1-1 --status completed` |
| `task-add` | 添加子任务 | `node scripts/plans.mjs task-add --project slug --parent t1 --title "新任务" [--status active]` |

### 其他命令

| 命令 | 说明 |
|------|------|
| `projects` | 列出所有项目 `[--status active]` |
| `daily/weekly/monthly/quarterly/annual` | 查看各级计划 |
| `overview` | 综合概览 |

## Agent 操作指南

### 查看任务树

```bash
node scripts/plans.mjs tasks --project dingtalk-digital-human
```

### 更新任务状态

```bash
node scripts/plans.mjs task-update --project dingtalk-digital-human --task-id t3-1 --status completed
```

### 添加子任务

```bash
node scripts/plans.mjs task-add --project dingtalk-digital-human --parent t3 --title "新评测维度" --status planned
```

### 添加新项目

1. 在 `content/projects/` 下创建 `{slug}.md`
2. 在 `apps/web/public/` 下创建 `{slug}.tasks.json`

### 添加时间线事件

编辑对应项目 markdown 的 frontmatter，在 `timeline` 数组末尾追加：

```yaml
  - date: 2026-07-06
    title: 完成性能基准测试
    type: progress
    description: 在 RTX 4090 上达到 30fps 实时推理
```

### 数据加载

- **Markdown**: 通过 Velite 构建为 JSON，前端 `getAllProjects()` / `getProjectBySlug()` 读取
- **任务树 JSON**: 放在 `apps/web/public/`，Vite 直接复制到 dist，前端 `getProjectTasks(slug)` 通过 fetch 加载
- **日历集成**: Calendar 页面同时加载 events.json 和所有项目的 tasks.json，将有日期的任务显示为日历事件

## 已有项目

- `dingtalk-digital-human.md` + `dingtalk-digital-human.tasks.json` — 钉钉数字人（active）
- `lifeos.md` + `lifeos.tasks.json` — lifeOS 个人项目（active）
- `infrared-contour-compression.md` + `infrared-contour-compression.tasks.json` — 红外轮廓图像压缩（active）
- `pet-action-recognition.md` + `pet-action-recognition.tasks.json` — 宠物动作识别（active）

## 注意事项

1. **任务树 JSON 独立于 Velite** — 放在 `apps/web/public/` 而非 `content/`，不经过 Velite 构建
2. **任务 ID 唯一性** — 同一项目内 task ID 必须唯一，建议用 `t1`, `t1-1`, `t1-1-2` 层级命名
3. **有日期的任务显示在日历** — startDate 非空的任务会在 Calendar 页面显示
4. **endDate 为 null 时** — 日历中显示为单日事件（startDate 当天）
5. **修改后需 rebuild** — content/ 修改后需重新 build；public/ 下的 JSON 文件 Vite 直接复制，无需 rebuild
