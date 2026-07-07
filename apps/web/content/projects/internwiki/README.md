---
title: InternWiki
slug: internwiki
status: active
startDate: 2026-07-07
endDate: null
category: work
tags:
  - 实习
  - 文档平台
  - Node.js
summary: 多人实习文档平台，每个实习生拥有独立项目空间，支持日报、周报、知识库文档和项目任务管理。
timeline: []
---

## 项目目标

构建多人实习文档平台，每个实习生有独立空间保存日报、周报、文档和项目任务。纯 Markdown + 自定义 Node.js SSG，编译为 HTML 静态页面。

## 核心特性

- **多人空间** — 每个实习生拥有独立的 `daily/`、`weekly/`、`docs/`、`projects/` 目录
- **日报 & 周报** — 结构化模板，自动生成摘要和统计
- **项目任务树** — JSON 定义的任务层级，支持级联完成和状态追踪
- **习惯追踪** — 从日报中自动提取打卡记录，生成热力图
- **知识库文档** — 支持 PDF 展示、Mermaid 图表、数学公式
- **全文搜索** — 中文拼音搜索，按实习生/类型/标签过滤
- **增量构建** — SHA1 缓存，仅重建变更页面
- **开发服务器** — 文件监听 + WebSocket LiveReload

## 技术栈

- 纯 Node.js 自定义 SSG（无 React/Vue）
- Markdown → HTML 编译
- SHA1 增量缓存
- WebSocket LiveReload

## 代码

- 路径：`~/InternWiki`
