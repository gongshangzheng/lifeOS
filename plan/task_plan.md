# ~/lifeOS 重构规划

**作者**：铃音（Suzune）
**日期**：2026-06-30
**目标**：把当前散落在 `/Users/zhengxinyu/Org/roam/life` 的"规划系统"重构为一个独立的、有精美 UI 的、可对外展示的生活规划网站。

---

## 一、现状盘点

### 1.1 已有资产（要迁移的内容）

| 路径 | 内容 | 是否迁移 |
|---|---|---|
| `reports/1-vision/` | 五年愿景、三年职业规划（2 篇） | ✅ 核心 |
| `reports/2-annual/` | 年报（2 篇） | ✅ 核心 |
| `reports/3-quarterly/` | 季报（1 篇） | ✅ 核心 |
| `reports/4-monthly/` | 月报（2026-05, 2026-06） | ✅ 核心 |
| `reports/5-weekly/` | 周报（W22-W26 共 5 篇） | ✅ 核心 |
| `reports/6-daily/` | 日报（5-29 ~ 6-14 共 14 篇） | ✅ 核心 |
| `reports/appendix/` | 13 篇附录（钉钉、华为、面试等） | ✅ 全部 |
| `reports/study/` | 学习笔记 1 篇 | ✅ |
| `reports/_templates/` | 模板 | ✅ |
| `web/` | 现有 esbuild+React dashboard | ❌ 弃用重写 |
| `Music.org`, `sites.org`, `voyage.org`, `灵感.org` | org-roam 笔记 | ⚠️ 见决策 4 |
| `movies/` | 电影记录 | ⚠️ 见决策 4 |
| `简历/` | 简历 | ⚠️ 见决策 4 |
| `brainstorm` | 头脑风暴文件 | ⚠️ 见决策 4 |
| `public/` | 静态资源（含 reports-dashboard 旧版） | 部分迁移 |

### 1.2 现有技术栈

- **打包**：esbuild 0.25 + 纯手写构建脚本（`web/build.mjs`）
- **框架**：React 19.1（CDN 没有用，是 npm 依赖）
- **样式**：Tailwind CSS v4 浏览器版（jsdelivr CDN）+ 自写 CSS（4 个文件）
- **数据**：`web/generate-data.mjs` 手写 markdown 解析 → `data.js` 静态注入
- **入口**：`web/index.html` + `web/app.js`（构建产物）
- **类型**：TypeScript 5.9 源码
- **功能**：日/周/月/长期四视图、日历分类（La Tâche/Étude/Joie/Réunion/Gestion）、任务优先级 P0/P1/P2、ICS 导出、localStorage 状态持久化

### 1.3 现有"问题"

1. **位置混乱**：在 Org/roam 仓库里，主题是"life 规划"，但夹在大量 org-roam 笔记中
2. **没有独立仓库**：不能直接发 GitHub Pages
3. **不是正式框架**：esbuild + 手写打包脚本，维护成本高，热更新体验差
4. **手写 markdown 解析**：脆弱、难扩展
5. **没有 CI/CD**：手动跑 build
6. **Tailwind 用浏览器版**：性能差、无法用 PostCSS 生态（shadcn/ui 等）
7. **没有类型化的数据 schema**

---

## 二、目标架构

### 2.1 信息架构

```
~/lifeOS/
├── / (Landing)        仪表盘首页：本月概览 + 本周重点 + 今日任务
├── /calendar          精美月历 + 事件（来自日报的"今日重点"）
├── /daily             日报列表（按日期倒序）
│   └── /[date]        单篇日报（Markdown 渲染 + 关联周报/月报）
├── /weekly            周报列表
│   └── /[week]        单篇周报
├── /monthly           月报列表
│   └── /[month]       单篇月报
├── /quarterly         季报
├── /annual            年报
├── /vision            五年愿景 + 三年职业
├── /appendix          附录（钉钉/华为/面试等专题）
├── /about             关于这个网站
└── /studio            内部用：编辑/创建日报
```

### 2.2 技术栈选型（建议）

| 维度 | 推荐 | 备选 | 理由 |
|---|---|---|---|
| 框架 | **React 19 + TypeScript** | Vue 3 | 延续现有栈，AI/前端经验多 |
| 构建 | **Vite 6** | Next.js | 纯静态部署，零后端依赖 |
| 路由 | **React Router v7** | TanStack Router | 成熟、生态广 |
| 样式 | **Tailwind CSS v4 + shadcn/ui** | unocss | 已有 Tailwind 经验 |
| 内容 | **MDX + Contentlayer / Velite** | 手写解析 | 类型安全，扩展性强 |
| 状态 | **Zustand** | Jotai | 轻量、TS 友好 |
| 日历 | **FullCalendar React** | react-big-calendar | 功能完整、支持拖拽 |
| 图表 | **Recharts** | ECharts | 月度热力图、习惯打卡可视化 |
| 部署 | **GitHub Actions + gh-pages** | Vercel | 与 gh 工具链一致 |
| 包管理 | **pnpm** | npm | 快、节省空间，需先 `npm i -g pnpm` |

### 2.3 目标目录结构

```
~/lifeOS/
├── .git/                              # 独立 Git 仓库
├── .github/
│   └── workflows/
│       └── deploy.yml                 # 推送 main → 自动部署到 gh-pages
├── apps/
│   └── web/                           # Vite + React 项目
│       ├── public/                    # 静态资源
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── routes/                # 路由配置
│       │   ├── pages/                 # 页面组件
│       │   │   ├── Home.tsx
│       │   │   ├── Calendar.tsx
│       │   │   ├── Daily.tsx
│       │   │   ├── Weekly.tsx
│       │   │   ├── Monthly.tsx
│       │   │   ├── Quarterly.tsx
│       │   │   ├── Annual.tsx
│       │   │   ├── Vision.tsx
│       │   │   └── Appendix.tsx
│       │   ├── components/            # 复用组件
│       │   │   ├── ui/                # shadcn 组件
│       │   │   ├── Calendar/
│       │   │   ├── ReportCard/
│       │   │   ├── Timeline/
│       │   │   └── Sidebar/
│       │   ├── content/               # 内容层（从 markdown 加载）
│       │   │   ├── schema.ts          # Zod 数据模型
│       │   │   └── loader.ts          # Velite 构建产物加载器
│       │   ├── lib/                   # 工具
│       │   └── styles/                # CSS
│       ├── content/                   # 原始 Markdown
│       │   ├── 1-vision/
│       │   ├── 2-annual/
│       │   ├── 3-quarterly/
│       │   ├── 4-monthly/
│       │   ├── 5-weekly/
│       │   ├── 6-daily/
│       │   ├── appendix/
│       │   ├── study/
│       │   └── _templates/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── README.md
├── scripts/                           # 跨项目脚本
│   ├── migrate-from-org-roam.mjs      # 从 Org/roam 迁内容（一次性）
│   └── check-links.mjs                # 检查内部链接有效性
├── content.config.ts                  # Velite 配置
├── package.json                       # 根工作区（pnpm workspace）
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── .editorconfig
├── .nvmrc
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

### 2.4 数据流

```
Markdown (content/6-daily/2026-06-14.md)
    ↓ Velite build-time 解析
类型化 JSON (apps/web/src/content/.velite/...)
    ↓ Vite 构建
打包产物 (apps/web/dist/...)
    ↓ GitHub Actions
gh-pages 分支
    ↓
https://gongshangzheng.github.io/life/
```

**关键优势**：内容是 Git 友好的 Markdown，UI 是类型安全的 React 组件。

---

## 三、执行阶段

### Phase 0：决策确认（✅ 完成）
- [x] Zack 拍板：React + Vite + TS、pnpm、GitHub Actions、只迁 reports、纯静态、`gongshangzheng/lifeOS`、Org/roam 保留

### Phase 1：基础建设
- [x] 创建 `~/lifeOS/` 目录（✅ 重命名自 `~/life/`）
- [x] 初始化 pnpm workspace（✅ pnpm 11.9.0）
- [x] 初始化 Vite + React + TS 项目在 `apps/web/`（✅ Alex 跑通）
- [x] 配置 Tailwind v4（✅）
- [x] 配置 Velite（✅ 修正了 root 路径、collection pattern、metadata schema）
- [x] ESLint flat config（✅ v9 + globals）
- [x] .gitignore / .gitattributes / .nvmrc / .editorconfig（✅）
- [x] Prettier 配置（✅）
- [x] README / CONTRIBUTING / LICENSE / CHANGELOG（✅）
- [x] GitHub Actions: ci.yml + deploy.yml（✅）
- [x] Issue / PR 模板（✅）
- [x] VSCode 配置（settings.json + extensions.json）（✅）
- [x] 迁移脚本 `migrate-from-org-roam.mjs`（✅ 修复 weekly ISO date 推算 + 加 --force）
- [x] 链接检查脚本 `check-links.mjs`（✅）
- [x] 文档：ARCHITECTURE.md / DEPLOY.md / CONTENT-GUIDE.md（✅）

### Phase 2：内容迁移
- [x] 写 `scripts/migrate-from-org-roam.mjs`（✅ dry-run + 真实迁移）
- [x] 处理 `tags: ...` inline 标签 → frontmatter tags（✅）
- [x] 处理相对路径链接保留原状（✅，UI 层负责解析）
- [x] 修复 weekly date 推算（✅ W22→05-25, W23→06-01, ...）
- [x] 实际迁移 36 个文件（✅ 36 written, 0 errors）
- [x] 验证：velite 编译 + build 通过（✅ 0 错误）

### Phase 3：UI 重构
- [x] 路由 + 布局（✅ Layout/NavBar/9 个路由）
- [x] 仪表盘首页（✅ StatCard + 实时时钟）
- [x] 日历页面（✅ FullCalendar 接 daily events + task trees）
- [x] 日报列表 + 详情（✅ ReportPages 工厂函数）
- [x] 周报/月报/季报/年报列表 + 详情（✅ makeListPage/makeDetailPage）
- [x] 附录专题页（✅ topics + appendix 集合）
- [x] 愿景/三年规划页（✅ vision 集合）
- [x] 响应式 + 暗色模式（✅ Tailwind v4 + .dark）

### Phase 4：交互增强
- [x] 日历事件点击跳转日报（✅ 事件 modal 中显示“查看当日日报”按钮）
- [x] 日报 ↔ 周报 ↔ 月报互链（✅ RelatedReports 组件，底部显示关联报告）
- [x] 习惯打卡可视化（✅ Habits 页面，GitHub 风格热力图）
- [x] 全文搜索（✅ SearchModal，Cmd+K 快捷键，客户端索引）
- [x] ICS 日历导出（✅ generate-ics.mjs 脚本，Calendar 页面下载按钮）

### Phase 5：发布
- [ ] `gh repo create gongshangzheng/lifeOS --public --source=. --push`（待手动执行）
- [x] 写 `.github/workflows/deploy.yml`（✅ 已配置）
- [ ] 启用 GitHub Pages（待手动执行）
- [ ] 验证线上访问（待手动执行）

### Phase 6：清理
- [ ] Org/roam 仓库里的 `life/` 标记为 archived（待手动执行）
- [ ] README 引导到新仓库（待手动执行）
- [x] 迁移指南（✅ 本 plan 文档）

---

## 四、待你拍板的关键决策

### 决策 1：框架
- **A. React + Vite**（推荐，延续栈）
- B. Vue 3 + Vite

### 决策 2：包管理器
- **A. pnpm**（推荐：快、节省空间、现代 monorepo 工具）
- B. npm（无新增安装，但 workspace 体验差）

### 决策 3：部署方式
- **A. GitHub Actions → gh-pages 分支**（推荐：完全自动）
- B. 手动 `gh repo deploy`
- C. Cloudflare Pages / Vercel（需外部账号）

### 决策 4：内容范围
- **A. 只迁 reports/ + 配套模板/附录**（最干净）
- B. 全迁（movies/, Music.org, sites.org, 简历, 灵感, brainstorm）

### 决策 5：是否要"内嵌编辑"功能
- **A. 只读展示**（最简单，纯静态）
- B. 站内编辑（要加后端或 git API，复杂度 ↑）

### 决策 6：仓库命名 ✅ 已确定
- **A. `gongshangzheng/lifeOS`** ← 已选

### 决策 7：原 Org/roam 仓库
- **A. 保留，把 life 目录标记 deprecated**
- B. 删掉 `Org/roam/life/` 子树

---

## 五、风险与缓解

| 风险 | 缓解 |
|---|---|
| 迁移过程丢数据 | 迁移前完整 git tag 一份 Org/roam 快照 |
| Markdown 解析不兼容 | 用 Velite + 写迁移预览脚本，diff 前后 |
| 现有 dashboard 数据契约破坏 | 先用旧脚本导出 JSON 对比 |
| GitHub Pages 部署失败 | 先在本地 `vite preview` 验证 dist |
| 域名 / 路径冲突 | 用 `gongshangzheng.github.io/lifeOS` 子路径，配置 `base` |

---

## 六、成功标准

- [x] 打开 `gongshangzheng.github.io/lifeOS` 能看到精美仪表盘（本地验证通过，待线上验证）
- [x] 所有现有 reports（17+ 篇）都能正确渲染（✅ Velite 构建 + React 渲染）
- [x] 日历视图能看到所有日报对应的事件（✅ FullCalendar + events.json）
- [ ] 推送 `main` 分支 → 1 分钟内自动部署（待验证）
- [ ] Lighthouse 分数 > 90（待测试）
- [x] 移动端可用（✅ Tailwind 响应式布局）
