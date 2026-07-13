---
name: lifeos-projects
description: lifeOS 项目与任务管理。增删改查项目、任务树、状态切换、日期编辑。所有项目/任务操作都通过 plans.mjs CLI 完成，不要手动编辑 JSON。触发词：项目、任务、标记完成、更新状态、添加任务、删除任务、新建项目、项目列表、任务树、task。
---

# lifeOS Projects — 项目与任务管理

所有项目/任务的增删改查都通过 CLI 脚本 `scripts/plans.mjs` 完成。**不要手动编辑 tasks.json**——用 CLI 命令，它会处理 ID 生成、数据格式和级联逻辑。

## 脚本位置

```
scripts/plans.mjs   （相对于 ~/lifeOS）
```

所有命令前缀：`cd ~/lifeOS && node scripts/plans.mjs <command>`

---

## 命令速查

### 查看

| 命令 | 用途 | 示例 |
|------|------|------|
| `projects` | 列出所有项目 | `projects [--status active]` |
| `tasks` | 查看任务树 | `tasks --project <slug>` |
| `overview` | 综合概览 | `overview` |

### 任务操作

| 命令 | 用途 | 示例 |
|------|------|------|
| `task-add` | 添加任务 | `task-add --project slug --title "任务名" [--parent t1]` |
| `task-update` | 改状态（快捷） | `task-update --project slug --task-id t1-1 --status completed` |
| `task-edit` | 改任意字段 | `task-edit --project slug --task-id t1-1 --title "新名" --end-date 2026-07-09` |
| `task-delete` | 删除任务 | `task-delete --project slug --task-id t1-1 [--force]` |

### 项目操作

| 命令 | 用途 | 示例 |
|------|------|------|
| `project-create` | 创建新项目 | `project-create --slug my-project --title "项目名" [--category work]` |

---

## 常用操作流程

### 标记任务完成

```bash
# 方式一：task-update（只改状态）
node scripts/plans.mjs task-update --project dingtalk-digital-human --task-id t4-4-2 --status completed

# 方式二：task-edit（同时改状态 + 结束日期）
node scripts/plans.mjs task-edit --project dingtalk-digital-human --task-id t4-4-2 --status completed --end-date 2026-07-09
```

### 添加新任务

```bash
# 顶层任务（不加 --parent）
node scripts/plans.mjs task-add --project my-project --title "新功能开发" --status active

# 子任务（指定 --parent）
node scripts/plans.mjs task-add --project my-project --parent t1 --title "调研竞品" --status planned
```

task-add 支持的可选字段：`--status`、`--start-date`、`--end-date`、`--start-time`、`--end-time`、`--location`、`--category`、`--description`

### 编辑任务字段

`task-edit` 可以一次修改多个字段：

```bash
node scripts/plans.mjs task-edit --project my-project --task-id t1-1 \
  --title "新标题" \
  --status completed \
  --start-date 2026-07-01 \
  --end-date 2026-07-09 \
  --description "更新描述"
```

可编辑字段：`--title`、`--status`、`--start-date`、`--end-date`、`--start-time`、`--end-time`、`--location`、`--category`、`--description`

日期字段传 `null` 可清空：`--end-date null`

### 删除任务

```bash
# 无子任务：直接删除
node scripts/plans.mjs task-delete --project my-project --task-id t1-1

# 有子任务：需要 --force（会连带删除所有子任务）
node scripts/plans.mjs task-delete --project my-project --task-id t1 --force
```

### 创建新项目

```bash
node scripts/plans.mjs project-create \
  --slug my-new-project \
  --title "项目名称" \
  --category work \
  --summary "一句话描述" \
  --tags "标签1,标签2"
```

自动生成：
- `content/projects/{slug}/README.md`（含 frontmatter + 时间线起点）
- `content/projects/{slug}/tasks.json`（空任务树骨架）

category 可选值：`work` | `research` | `side-project` | `learning`

### 周期任务

```bash
# 添加周期任务
node scripts/plans.mjs recurring-add --project lifeos --title "每日代码提交" \
  --pattern daily --report-levels daily,weekly

# 列出所有周期任务
node scripts/plans.mjs recurring-list
```

---

## 数据结构（供理解，日常用 CLI 即可）

### 项目 Markdown (`content/projects/{slug}/README.md`)

```yaml
---
title: 项目名
slug: project-slug
status: active          # active | completed | paused | planned
startDate: 2026-06-01
endDate: null
category: work          # work | research | side-project | learning
tags: [标签1, 标签2]
summary: 一句话描述
timeline:
  - date: 2026-06-01
    title: 里程碑
    type: milestone     # milestone | progress | blocker | decision | note
    description: 描述
---
```

### 任务树 JSON (`content/projects/{slug}/tasks.json`)

```json
{
  "project": "slug",
  "tasks": [
    {
      "id": "t1",
      "title": "任务名",
      "status": "active",
      "startDate": "2026-07-01",
      "endDate": null,
      "description": "",
      "children": [...]
    }
  ]
}
```

Task status 枚举：`active` | `completed` | `planned` | `blocked` | `paused`

---

## 时间线事件

时间线写在项目 README.md 的 frontmatter `timeline` 数组里。添加时直接编辑 markdown 末尾追加：

```yaml
  - date: 2026-07-09
    title: 完成某事
    type: progress
    description: 详细描述
```

type 可选：`milestone` | `progress` | `blocker` | `decision` | `note`

---

## 前端展示

- **Projects 页面** (`/projects`)：项目标签选择 → Git 风格任务树 → 时间线 Tab
- **Calendar 页面** (`/calendar`)：有 startDate 的任务以项目颜色显示为日历事件
- **数据加载**：Markdown 经 Velite 构建；tasks.json 放在 `content/projects/{slug}/` 下，前端通过 fetch 加载

## 注意事项

1. **用 CLI，别手动编辑 JSON** — CLI 处理 ID 生成、格式、级联逻辑
2. **任务 ID 层级命名** — `t1`、`t1-1`、`t1-1-2`，CLI 自动生成
3. **有日期的任务显示在日历** — startDate 非空的任务会出现在 Calendar 页面
4. **修改 content/ 后需 rebuild** — public/ 下的 JSON 文件 Vite 直接复制
5. **task-edit vs task-update** — task-update 只改 status（快捷）；task-edit 改任意字段组合
