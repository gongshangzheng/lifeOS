# lifeOS 架构

## 数据流

```
┌─────────────────────────────┐
│  Markdown (content/...)     │   ← 人工编辑，git 友好
└──────────────┬──────────────┘
               │ Velite 构建时解析
               ▼
┌─────────────────────────────┐
│  TypeScript 类型化 JSON     │   ← Zod schema 校验
│  (.velite/...)              │
└──────────────┬──────────────┘
               │ Vite 静态打包
               ▼
┌─────────────────────────────┐
│  React 组件 + Tailwind UI   │   ← 客户端渲染
└──────────────┬──────────────┘
               │ gh-pages 部署
               ▼
┌─────────────────────────────┐
│  gongshangzheng.github.io   │
└─────────────────────────────┘
```

## 命名空间

- `@lifeos/web`：主站应用
- `@lifeos/scripts`：迁移、辅助脚本

## 内容 Schema

每个 Markdown 文件经 Velite 解析后形如：

```ts
type Report = {
  slug: string;            // URL 友好的标识
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'vision' | 'appendix';
  date?: string;           // ISO date (daily/weekly/monthly/quarterly/annual)
  title: string;
  summary?: string;
  body: string;            // 原始 markdown
  metadata: Record<string, unknown>;
  tasks?: Task[];          // 从 - [ ] 列表提取
}
```

详细 schema 见 `apps/web/src/content/schema.ts`。
