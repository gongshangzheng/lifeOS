# lifeOS 项目级记忆

> 本文件供所有 agent 读取。记录 lifeOS 项目的架构事实、开发约定和关键路径。
> 修改后立即生效，不需要 reindex。

## 项目身份

- **名称**: lifeOS — 个人生活操作系统
- **仓库**: /Users/zhengxinyu/lifeOS
- **部署**: gongshangzheng.github.io/lifeOS（gh-pages）
- **技术栈**: React + Vite + Velite（Markdown 驱动）+ Tailwind CSS

## 架构关键路径

| 路径 | 作用 |
|------|------|
| `apps/web/content/` | 所有 Markdown 内容源（velite root） |
| `apps/web/velite.config.ts` | Velite collection + schema 定义 |
| `apps/web/src/content/loader.ts` | 前端数据加载函数 |
| `apps/web/src/content/.velite/` | velite 生成的类型化 JSON（不要手动改） |
| `apps/web/src/App.tsx` | 路由 + 导航栏 |
| `apps/web/src/pages/` | 页面组件 |
| `apps/web/public/events.json` | 日历事件数据（lifeos-events skill 管） |
| `scripts/events.mjs` | 事件 CLI 工具 |
| `.agents/skills/` | 项目级 skill |
| `.agents/memory/` | 项目级记忆（本文件） |

## 内容 Collections

| Collection | 目录 | Schema 文件 |
|-----------|------|------------|
| daily | `6-daily/` | reportSchema |
| weekly | `5-weekly/` | reportSchema |
| monthly | `4-monthly/` | reportSchema |
| quarterly | `3-quarterly/` | reportSchema |
| annual | `2-annual/` | reportSchema |
| vision | `1-vision/` | reportSchema |
| appendix | `appendix/` | reportSchema |
| topics | `topics/` | reportSchema |
| **projects** | **`projects/`** | **projectSchema（含 timeline）** |
| resume | `resume.md` | reportSchema |

## 开发约定

1. **新增 collection 必须三步走**: velite.config.ts → loader.ts → App.tsx
2. **Schema 变更后必须 `npx velite`** 重新生成 .velite 类型
3. **构建验证**: `npx tsc --noEmit -p apps/web/tsconfig.app.json` + `pnpm build`
4. **颜色用 Tailwind 变量**: `text-heading`, `text-dim`, `bg-card`, `border-border` 等
5. **卡片样式统一用 `lo-card`** class
6. **events.json 不要手动编辑** — 用 `scripts/events.mjs`

## 已有 Skills

| Skill | 路径 | 职责 |
|-------|------|------|
| lifeos-events | `.agents/skills/lifeos-events/` | 日历事件管理（events.json + CLI） |
| lifeos-projects | `.agents/skills/lifeos-projects/` | 项目时间线管理（content/projects/） |
