# lifeOS

> 我的生活操作系统 —— 把愿景、规划、日报、周报、月报、季报、年报整合成一个可以公开访问的个人站点。

[![deploy](https://github.com/gongshangzheng/lifeOS/actions/workflows/deploy.yml/badge.svg)](https://github.com/gongshangzheng/lifeOS/actions)
![License](https://img.shields.io/github/license/gongshangzheng/lifeOS)

🌐 **线上地址**：<https://gongshangzheng.github.io/lifeOS/>

## 这是什么

`lifeOS` 是把分散在 Org/roam 里的"个人规划笔记"重构后的产物：

- **愿景层**（5 年 / 3 年）
- **年度计划**（年报）
- **季度复盘**（季报）
- **月度总结**（月报）
- **每周记录**（周报）
- **每日打卡**（日报）
- **专题附录**（钉钉、华为、面试准备等）

所有内容以 Markdown 形式存在 `apps/web/content/`，通过 [Velite](https://velite.js.org/) 编译为类型化 JSON，再由 Vite + React 渲染。

## 技术栈

- **Vite 6** + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui**
- **Velite**（内容层：Markdown → Zod 类型化）
- **React Router v7**（路由）
- **FullCalendar**（日历视图）
- **Zustand**（状态）
- **GitHub Actions** → **GitHub Pages**（部署）

## 目录结构

```
lifeOS/
├── apps/
│   └── web/                # 主站（Vite + React）
│       ├── content/        # 所有 Markdown 原文
│       └── src/            # React 源码
├── scripts/                # 一次性脚本（内容迁移等）
├── plan/                   # 重构规划文档
├── .github/workflows/      # CI/CD
└── pnpm-workspace.yaml
```

## 快速开始

```bash
# 1. 启用 corepack
corepack enable

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

打开 <http://localhost:5173/lifeOS/>。

## 部署

`main` 分支推送后，GitHub Actions 自动构建并发布到 `gh-pages` 分支。

## License

MIT
