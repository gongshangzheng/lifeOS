---
name: lifeos-report
description: lifeOS 报告生成系统。创建新的日报、周报、月报、季报时自动调用生成脚本，从模板生成文件并写入正确目录。触发词：创建日报、新建日报、写日报、今天日报、本周周报、本月月报、本季度季报、generate report、new daily、new weekly。
---

# lifeOS Report — 报告生成

生成 lifeOS 各级报告文件（日报/周报/月报/季报），使用标准模板和正确的导航链接。

## 生成脚本

**路径**: `scripts/generate-report.mjs`
**运行**: `node scripts/generate-report.mjs <type> [--date <date>]`

| 类型 | 日期格式 | 默认值 | 示例 |
|------|---------|--------|------|
| `daily` | YYYY-MM-DD | 今天 | `node scripts/generate-report.mjs daily` |
| `weekly` | YYYY-MM-DD | 本周（自动计算周一） | `node scripts/generate-report.mjs weekly` |
| `monthly` | YYYY-MM | 本月 | `node scripts/generate-report.mjs monthly --date 2026-07` |
| `quarterly` | YYYY-QN | 本季 | `node scripts/generate-report.mjs quarterly --date 2026-Q3` |

## 生成行为

- 自动计算：星期、ISO 周数、上下层导航链接、同层连续导航
- 自动检测：如果文件已存在，报错并退出（不覆盖）
- 输出路径：生成后打印文件路径供后续操作

## 输出目录

| 类型 | 目录 | 文件命名 |
|------|------|---------|
| 日报 | `apps/web/content/6-daily/` | `YYYY-MM-DD.md` |
| 周报 | `apps/web/content/5-weekly/` | `YYYY-MM-WNN.md` |
| 月报 | `apps/web/content/4-monthly/` | `YYYY-MM.md` |
| 季报 | `apps/web/content/3-quarterly/` | `YYYY-QN.md` |

## Agent 操作指南

### 当用户要求"创建/新建/写日报/周报/月报/季报"时

**必须**先调用脚本生成文件，然后再编辑填充内容：

```bash
# 1. 生成今天的日报
node scripts/generate-report.mjs daily

# 2. 生成本周周报
node scripts/generate-report.mjs weekly

# 3. 生成指定日期的日报
node scripts/generate-report.mjs daily --date 2026-07-07

# 4. 生成指定月的月报
node scripts/generate-report.mjs monthly --date 2026-08
```

脚本输出示例：
```
已创建: /Users/tangwen/lifeOS/apps/web/content/6-daily/2026-07-06.md
标题: 日报 - 2026-07-06 周一
```

### 生成后的流程

1. 读取生成的文件
2. 根据用户需求填充具体内容（今日计划、任务列表等）
3. 如需关联项目任务树，读取 `public/{project-slug}.tasks.json`
4. 使用 Write 或 SearchReplace 工具更新文件内容

### 模板结构

**日报**包含：今日优先（表格）、时间安排（表格）、规划（今日目标+备注）、进展记录、总结（完成/未完成/收获/明日跟进）、日记

**周报**包含：本周主题、本周核心目标（3条）、本周重点任务（工作/学习/生活/社交四个维度）

**月报**包含：本月主题、月度计划（核心方向+阶段划分）、关键数据表格、月度反思

**季报**包含：本季度核心目标、各维度进展表格、季度反思（做得好/需改进/感悟）、下季度计划

### 注意事项

- 不要手动创建报告文件，始终使用脚本（确保导航链接和 frontmatter 格式正确）
- 如果文件已存在，脚本会报错，此时改用 SearchReplace 编辑现有文件
- 周报的 slug 格式为 `YYYY-MM-WNN`，其中 MM 是该周周一所在的月份
