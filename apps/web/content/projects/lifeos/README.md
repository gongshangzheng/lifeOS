---
title: lifeOS
slug: lifeos
status: active
startDate: 2026-06-30
endDate: null
category: side-project
tags:
  - lifeOS
  - React
  - TypeScript
  - 个人项目
summary: 个人生活操作系统。基于 Vite + React 19 + TypeScript，统一数据源管理日/周/月/季/年计划、项目任务树、日历事件和习惯追踪。
timeline:
  - date: 2026-06-30
    title: 项目初始化
    type: milestone
    description: 搭建 Vite + React 19 + TS 脚手架，配置 Tailwind v4、Velite、ESLint，路由与 10 个页面。
  - date: 2026-07-06
    title: 核心功能完成
    type: milestone
    description: 日历系统（统一数据源+侧边栏+逾期检测）、项目任务树、习惯追踪、首页热力图、全局搜索、暗亮模式、日报生成系统。
  - date: 2026-07-07
    title: 习惯页面重构
    type: progress
    description: 参考 InternWiki 方案重构 Habits 页面，改为卡片式布局，新增 streak 计算和 30 天热力图。
---

## 项目背景

lifeOS — 一个个人生活操作系统。

用结构化的方式管理愿景、年/季/月/周/日计划、项目和日历事件。技术上基于 Vite 6 + React 19 + TypeScript 5 + Tailwind v4，内容用 Markdown 驱动，通过 Velite 构建为 JSON。

## 技术栈

- 框架：Vite 6 + React 19 + TypeScript 5
- 样式：Tailwind CSS v4
- 内容：Velite（Markdown → JSON）
- 日历：FullCalendar
- 部署：GitHub Pages (gh-pages)

## 当前阶段

核心功能全部完成（8 个模块），仅剩部署与 CI/CD 待实现。

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 基础框架 | ✅ | Vite 6 + React 19 + TS 5，10 个页面，lazy-loaded 路由分割 |
| 内容系统 | ✅ | Velite 9 collection + resume，ReportList/ReportDetail/RelatedReports |
| 日历系统 | ✅ | FullCalendar，统一数据源（tasks.json），侧边栏，逾期置顶，ICS 导出 |
| 项目管理 | ✅ | Git 风格任务树，plans.mjs CLI（888行），级联完成，notePath 笔记 |
| 习惯追踪 | ✅ | 卡片式布局，streak 计算，30 天热力图，今日打卡进度 |
| 首页增强 | ✅ | 贡献热力图，快速导航，全局搜索（Cmd+K） |
| 主题系统 | ✅ | 暗亮模式切换，localStorage 持久化 |
| 日报生成 | ✅ | generate-report.mjs（779行），自动注入今日计划任务 |
| 部署 CI/CD | 📋 | gh-pages / Vercel 待实现 |
