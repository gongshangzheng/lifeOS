# 调研发现（重构前）

## 环境

- **OS**: Darwin 25.5.0
- **Node**: v25.8.1
- **git**: 2.52.0
- **gh CLI**: 2.86.0（已登录 `gongshangzheng`）
- **包管理器**: 只有 npm（无 pnpm/yarn/bun）
- **当前目录**: `/Users/zhengxinyu/Org/roam/life`（属于更大的 Org/roam 仓库）

## 现有 Org/roam 仓库

- 已在 master 分支，但与 origin 出现 21 vs 29 commits 分叉
- 历史都是 "Nightly auto sync"
- 当前在子目录 `Org/roam/life`，有一个子模块修改待处理
- **风险点**：直接在这个仓库里搞容易把分叉问题搞复杂，建议独立新仓库

## 现有 web dashboard 关键能力

阅读 `web/src/app/App.tsx` 发现现有 dashboard 已经有：

- 4 个视图：`three` / `week` / `month` / `longterm`
- 5 个日历分类色：La Tâche / L'Étude / La Joie / La Réunion / La Gestion
- 任务优先级：P0/P1/P2
- 工具函数：`downloadICS`、`formatDateKey`、`parseTimeRange`、`startOfWeek`、`tasksForDate`
- localStorage 持久化：`planner_view` / `planner_selected_date` / `planner_collapsed`
- DOW: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

**结论**：现有功能不弱，主要是**架构/工程化/可维护性**问题，不是功能缺失。

## 数据规模

- 日报：14 篇（5-29 ~ 6-14）
- 周报：5 篇（W22-W26）
- 月报：2 篇（5, 6）
- 季报：1 篇（Q2）
- 年报：2 篇
- 愿景/规划：2 篇
- 附录：13 篇
- 模板：1 篇
- 学习：1 篇
- **总计：~40 篇 Markdown**

## 笔记格式观察

日报文件命名：`YYYY-MM-DD.md`
周报命名：`YYYY-MM-WW.md`（如 `2026-06-W25.md`）
季报命名：`YYYY-QN.md`
内容用 markdown 表格 + 任务列表（`- [ ]` / `- [x]`）组织

## 结论

1. **核心痛点不是"内容多"，是"工程化"**——手写构建、Tailwind CDN、缺乏类型化
2. **功能已经够用**，重构应该保留核心交互，重在架构升级
3. **数据量小**（~40 篇），Velite/Contentlayer 完全能 hold
4. **新仓库独立** 风险更低（避免和 Org/roam 分叉冲突）
