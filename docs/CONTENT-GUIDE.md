# 内容贡献指南

`apps/web/content/` 下放所有 Markdown 内容。每个文件会被 [Velite](https://velite.js.org/) 解析为类型化 JSON。

## 目录结构

```
content/
├── 1-vision/         五年/三年愿景
├── 2-annual/         年报
├── 3-quarterly/      季报
├── 4-monthly/        月报
├── 5-weekly/         周报
├── 6-daily/          日报
├── appendix/         附录（专题）
└── study/            学习笔记
```

## 文件命名

| 类型 | 命名格式 | 示例 |
|---|---|---|
| daily | `YYYY-MM-DD.md` | `2026-06-30.md` |
| weekly | `YYYY-MM-WXX.md` | `2026-06-W26.md` |
| monthly | `YYYY-MM.md` | `2026-06.md` |
| quarterly | `YYYY-QN.md` | `2026-Q2.md` |
| annual | `YYYY.md` 或 `annual-YYYY-YYYY.md` | `2026.md` |
| vision | 描述性 slug | `five-year-2026-2030.md` |
| appendix | 描述性 slug | `dingtalk-reputation.md` |

## frontmatter

```yaml
---
title: 日报 - 2026-06-14 周日
slug: 2026-06-14          # URL 友好的标识（默认 = 文件名去后缀）
type: daily               # daily | weekly | monthly | quarterly | annual | vision | appendix | study
date: 2026-06-14          # ISO 日期（年报可以只填年份）
summary: 推进学校作业，准备转正
tags: [daily, report, 2026-06]
---
```

**必填**：`title`, `type`
**推荐**：`date`, `summary`, `tags`
**可选**：`slug`（缺省 = 文件名）

## 支持的 Markdown 语法

- 标题（# ~ ######）
- 段落
- 列表（有序/无序）
- 任务列表 `- [ ]` / `- [x]`
- 表格
- 行内代码、代码块
- 链接
- 引用 `> `
- 分隔线 `---`
- 强调 `**bold**` / `*italic*`
- 图片（暂未启用，UI 还在做）

## 内部链接

推荐使用**相对路径**：

```markdown
[2026-06 月报](../4-monthly/2026-06.md)
[前一天日报](../6-daily/2026-06-13.md)
```

链接会在渲染时被自动转换成实际路由。

## 表格示例

日报里"今日优先"和"时间安排"用表格：

```markdown
| 事项 | 优先级 | 日历 | 状态 |
|------|--------|------|------|
| 认知心理学论文 | P0 | L'Etude | |
| 跑步 6km | P1 | La Joie | ✅ |
```

### 日历分类

| 分类 | 含义 |
|---|---|
| `La Tâche` | 任务/工作 |
| `L'Etude` | 学习/研究 |
| `La Joie` | 生活/运动/娱乐 |
| `La Réunion` | 会议/沟通 |
| `La Gestion` | 管理/规划 |
| `Le Vie` | 日常起居 |

### 优先级

- `P0` 紧急且重要
- `P1` 重要不紧急
- `P2` 其他

## 任务列表

```markdown
- [ ] 待办事项
- [x] 已完成
```

会自动识别为 `tasks` 字段，可用于日历视图渲染。

## 校验

迁移或新增后跑：

```bash
pnpm content:build    # 验证 Velite 解析
node scripts/check-links.mjs   # 验证内部链接
```
