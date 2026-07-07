---
title: InternWiki
slug: internwiki
status: completed
startDate: 2026-07-07
endDate: 2026-07-07
category: work
tags:
  - 实习
  - 文档平台
  - React
summary: 多人实习文档平台，基于 Vite 6 + React 19 + Velite，每个实习生拥有独立项目空间，支持日报、周报、月报、知识库文档和项目任务管理。
timeline:
  - date: 2026-07-07
    title: 全部 6 个 Phase 完成
    type: milestone
    description: 从脚手架到 CLI 工具，含任务树、日历、习惯追踪、搜索、暗亮模式、CI/CD 部署、使用指南、SKILL 文档
---

## 项目目标

构建多人实习文档平台，每个实习生有独立空间保存日报、周报、月报、文档和项目任务。技术栈对齐 lifeOS：Vite + React + Velite，Markdown 经 Velite 编译为类型化 JSON，React 客户端渲染，静态部署到 GitHub Pages。

## 当前进度

全部 6 个 Phase 已完成，项目已部署到 GitHub Pages。

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 项目骨架 + Velite 内容层 + 路由 | ✅ 完成 |
| Phase 2 | 内容模型（日/周/月报 + 文档 + 档案） | ✅ 完成 |
| Phase 3 | 任务体系（Git 风格任务树 + CLI 管理） | ✅ 完成 |
| Phase 4 | 仪表盘 + 日历 + 习惯追踪 | ✅ 完成 |
| Phase 5 | 搜索 + 暗亮模式 + CI/CD | ✅ 完成 |
| Phase 6 | CLI 工具 + 使用指南 + SKILL 文档 | ✅ 完成 |

### 已实现功能

- **多人空间** — 每个实习生拥有独立的 `daily/`、`weekly/`、`monthly/`、`docs/`、`projects/` 目录
- **日报 / 周报 / 月报 / 文档** — 结构化模板，Velite 编译为类型化 JSON，列表/详情页渲染
- **Git 风格任务树** — TaskTreeNode.tsx（278行）：递归分支线、状态圆点、展开/折叠、Hover tooltip、assignee/startTime 徽章
- **任务笔记** — TaskNoteView 组件，fetch notePath Markdown 渲染
- **级联完成** — 子任务全完成→父自动标记完成
- **CLI 管理** — cli.mjs（764行）：new-intern/new-report/new-doc/new-project + task add/done/remove/move/list/stats
- **实习生仪表盘** — InternHome.tsx（363行）：统计卡片、快速链接、最近报告、项目概览
- **FullCalendar 日历** — Calendar.tsx（688行）：实习生选择器、任务事件着色、侧边栏（待办/已完成/逾期）、重复任务展开、详情弹窗
- **习惯追踪** — useHabits.ts + Habits.tsx：从日报提取 #-tag 打卡记录、连续天数、完成率、热力图
- **全文搜索** — SearchModal.tsx（284行）：搜索所有内容类型，Cmd+K 快捷键
- **暗/亮模式** — useTheme.ts + ThemeToggle，localStorage 持久化
- **CI/CD 部署** — GitHub Actions → GitHub Pages 自动部署
- **使用指南页面** — Guide.tsx（255行）：框架使用指南、CLI 命令参考
- **SKILL.md 文档** — 渐进式披露架构，拆分为路由入口 + 4 个 reference 文件

## 技术栈

| 层 | 选型 |
|----|------|
| 构建 | Vite 6 |
| UI 框架 | React 19 + TypeScript 5 |
| 样式 | Tailwind CSS v4 |
| 内容层 | Velite（Markdown → Zod 类型化 JSON） |
| 路由 | React Router v7 |
| 部署 | GitHub Actions → GitHub Pages |

## 示例数据

- **alice** — 后端组实习生，搜索引擎项目（含 tasks.json + 周期任务）
- **bob** — 前端组实习生，前端组件项目（含 tasks.json + 周期任务）

## 代码

- 路径：`~/InternWiki`（已软链接到 `code/`）
