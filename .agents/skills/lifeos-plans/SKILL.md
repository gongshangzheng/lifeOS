---
name: lifeos-plans
description: lifeOS 计划与项目快速查看/创建系统。查看项目列表、日报/周报/月报/季报/年报的待办与进展、项目任务树。创建新的日/周/月计划文件。触发词：查看计划、今天计划、本周计划、本月计划、项目列表、overview、日报、周报、月报、创建计划、任务树、任务列表。
---

# lifeOS Plans — 计划与项目查看/创建

查看和管理 lifeOS 中各级计划（日报→周报→月报→季报→年报）和项目。

## 内容层级结构

```
content/
├── 1-vision/          # 愿景层：五年计划、三年职业规划
├── 2-annual/          # 年报：年度目标与关键结果
├── 3-quarterly/       # 季报：季度 OKR
├── 4-monthly/         # 月报：月度计划与阶段划分
├── 5-weekly/          # 周报：每周核心目标与重点任务
├── 6-daily/           # 日报：每日优先事项与时间安排
├── projects/          # 项目：独立项目的时间线管理
├── appendix/          # 附录：参考资料
├── study/             # 学习笔记
└── topics/            # 主题笔记
```

**层级关系**: 愿景 → 年报 → 季报 → 月报 → 周报 → 日报，每层在 `summary` 字段中记录上下层导航链接。

## 各级计划 Frontmatter 格式

### 日报 (`6-daily/`)

```yaml
---
title: 日报 - 2026-06-14 周日    # 或简短标题
slug: 2026-06-14                 # 日期标识（YYYY-MM-DD）
type: daily
date: 2026-06-14
summary: "上层： [月报](...) ｜ [周报](...) 同层连续： [前一天](...) ｜ [后一天](...)"
tags: [daily, report, 2026-06]
---
```

或简化格式（无 slug）：

```yaml
---
title: 2026-06-30 周二
summary: 一句话总结
date: 2026-06-30
metadata:
  weather: sunny
  mood: focused
---
```

### 周报 (`5-weekly/`)

```yaml
---
title: 周报 - 2026年6月第26周 (06.22 - 06.30)
slug: 2026-06-W26                # 格式：YYYY-MM-WNN
type: weekly
date: 2026-06-22                 # 该周周一日期
summary: "上层： [月报](...) ｜ [季报](...)"
tags: [weekly, plan, 2026-06]
weekNumber: 26
---
```

### 月报 (`4-monthly/`)

```yaml
---
title: 月报 - 2026年6月
slug: 2026-06                    # 格式：YYYY-MM
type: monthly
date: 2026-06-01
summary: "上层： [季报](...) ｜ [年报](...) 下层： [W23](...) ｜ [W24](...) ｜ ..."
tags: [monthly, report, 2026-06]
---
```

### 季报 (`3-quarterly/`)

```yaml
---
title: 季报 - 2026年Q2（4-6月）
slug: 2026-Q2                    # 格式：YYYY-QN
type: quarterly
date: 2026-04-01
summary: "上层： [年报](...) ｜ [五年计划](...) 下层： [月报](...) ｜ ..."
tags: [quarterly, report, 2026-Q2]
quarter: Q2
---
```

### 年报 (`2-annual/`)

```yaml
---
title: 年报 - 2026年
slug: "2026"
type: annual
date: 2026-01-01
summary: "上层： [五年计划](...) ｜ [三年规划](...) 下层： [Q1](...) ｜ [Q2](...) ｜ ..."
tags: [annual, report, 2026]
---
```

### 项目 (`projects/`)

参见 `lifeos-projects` skill，frontmatter 包含 `status`、`startDate`、`endDate`、`category`、`tags`、`timeline` 数组。

## CLI 脚本

**路径**: `scripts/plans.mjs`
**运行**: `node scripts/plans.mjs <command> [options]`

### 命令一览

| 命令 | 说明 | 示例 |
|------|------|------|
| `projects` | 列出所有项目 | `node scripts/plans.mjs projects [--status active]` |
| `daily` | 查看日报 | `node scripts/plans.mjs daily [--date YYYY-MM-DD]`（默认今天）|
| `weekly` | 查看周报 | `node scripts/plans.mjs weekly [--date YYYY-MM-DD \| --week YYYY-WNN]`（默认本周）|
| `monthly` | 查看月报 | `node scripts/plans.mjs monthly [--date YYYY-MM]`（默认本月）|
| `quarterly` | 查看季报 | `node scripts/plans.mjs quarterly [--date YYYY-QN]`（默认本季）|
| `annual` | 查看年报 | `node scripts/plans.mjs annual [--year YYYY]`（默认今年）|
| `overview` | 综合概览 | `node scripts/plans.mjs overview`（项目+日+周+月一览）|
| `tasks` | 列出任务树 | `node scripts/plans.mjs tasks --project slug` |
| `task-update` | 更新任务状态 | `node scripts/plans.mjs task-update --project slug --task-id id --status completed` |
| `task-add` | 添加子任务 | `node scripts/plans.mjs task-add --project slug --parent id --title "..."` |

### 输出内容

- **projects**: 项目名、状态、类别、时间范围、标签、最新进展
- **daily/weekly/monthly/quarterly/annual**: 标题、导航、待办事项（`- [ ]`）、已完成（`- [x]`）
- **overview**: 活跃项目 + 今日待办 + 本周待办 + 本月待办

## Agent 操作指南

### 当用户说"查看计划/今天计划/本周计划/本月计划"时

运行对应命令，把输出整理后展示给用户：

```bash
# 今日计划
node scripts/plans.mjs daily

# 本周计划
node scripts/plans.mjs weekly

# 本月计划
node scripts/plans.mjs monthly

# 综合概览
node scripts/plans.mjs overview
```

如果当天/当周/当月没有对应文件，脚本会提示"暂无"并列出可用文件。

### 当用户说"查看项目"时

```bash
node scripts/plans.mjs projects
# 或只看活跃的
node scripts/plans.mjs projects --status active
```

### 创建新报告

**始终使用生成脚本**，不要手动创建报告文件。详见 `lifeos-report` skill。

```bash
# 日报
node scripts/generate-report.mjs daily [--date YYYY-MM-DD]

# 周报
node scripts/generate-report.mjs weekly [--date YYYY-MM-DD]

# 月报
node scripts/generate-report.mjs monthly [--date YYYY-MM]

# 季报
node scripts/generate-report.mjs quarterly [--date YYYY-QN]
```

脚本会自动生成正确的 frontmatter、导航链接和模板结构。生成后再用 SearchReplace 填充具体内容。

## 已有文件索引

### 日报（6-daily）
2026-05-29, 2026-05-30, 2026-05-31, 2026-06-02, 2026-06-08~2026-06-14, 2026-06-30, 2026-07-06

### 周报（5-weekly）
2026-05-W22, 2026-06-W23, 2026-06-W24, 2026-06-W25, 2026-06-W26

### 月报（4-monthly）
2026-05, 2026-06

### 季报（3-quarterly）
2026-Q2

### 年报（2-annual）
2026, annual-2026-2027

### 项目（projects）
dingtalk-digital-human（钉钉数字人，active）

## 注意事项

1. **文件名即标识** — 日报用 `YYYY-MM-DD.md`，周报用 `YYYY-MM-WNN.md`，月报用 `YYYY-MM.md`
2. **summary 字段存导航** — 包含上下层级的 markdown 链接，方便跳转
3. **任务标记** — `- [ ]` 待办，`- [x]` 已完成，脚本会自动提取
4. **修改后需 rebuild** — content/ 文件修改后需重新 build 才能在 web 端看到变化
5. **日历数据独立** — 日历事件存在 `apps/web/public/events.json`，由 `lifeos-events` skill 管理，不在 markdown 中
