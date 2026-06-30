# 贡献指南

lifeOS 是个人项目，但欢迎你：
- 报告 Bug
- 提议新功能
- 改进文档
- 分享使用体验

## 提 Issue

- **Bug**：用 [Bug report 模板](.github/ISSUE_TEMPLATE/bug_report.md)
- **功能请求**：用 [Feature request 模板](.github/ISSUE_TEMPLATE/feature_request.md)

## 提 PR

> lifeOS 是个人使用为主的站点，**功能上不接受"重构/重写"** 类的 PR，但欢迎：
> - 修复明显的 bug
> - 改进文档/示例
> - 提升可访问性
> - 改进性能

### 流程

1. Fork + 创建 feature 分支
2. 提交前跑：
   ```bash
   pnpm install
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
3. PR 标题简洁，描述里写清楚动机

### Commit 规范

参考 Conventional Commits（不强求）：

```
feat: 新增 RSS 订阅
fix: 日历跳转 404
docs: 完善 README
chore: 升级 vite 到 6.0
```

## 本地开发

```bash
corepack enable
pnpm install
pnpm dev          # http://localhost:5173/lifeOS/
```

## 内容贡献

如果你想"贡献一篇日报/周报体验"——

- 在 `apps/web/content/{daily,weekly,monthly,quarterly,annual}/` 加 markdown
- frontmatter 必填字段：`title`, `slug`, `type`, `date`(可选), `summary`(可选), `tags`(可选)
- 提 PR 时附简短说明

## 行为准则

请保持友善、专业的交流。
