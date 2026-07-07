import { defineConfig, defineCollection, s } from 'velite'

const reportSchema = s
  .object({
    title: s.string().optional(),
    slug: s.string().optional(),
    date: s.isodate().optional(),
    summary: s.string().optional(),
    metadata: s.record(s.string(), s.unknown()).default({}),
    body: s.raw(),
  })
  .transform((data, { meta }) => {
    const parts = ((meta.path ?? '').replace(/\.md$/, '')).split('/')
    // For README.md, use parent dir name as slug; otherwise use filename
    const filename = parts.pop() ?? ''
    const fallback = filename === 'README' ? (parts.pop() ?? '') : filename
    return {
      ...data,
      title: data.title ?? fallback,
      slug: data.slug ?? fallback,
    }
  })

// ── Project schema ────────────────────────────────────────────

const timelineEventSchema = s.object({
  date: s.isodate(),
  title: s.string(),
  type: s
    .enum(['milestone', 'progress', 'blocker', 'decision', 'note'])
    .default('progress'),
  description: s.string().optional(),
})

const projectSchema = s
  .object({
    title: s.string().optional(),
    slug: s.string().optional(),
    status: s.enum(['active', 'completed', 'paused', 'planned']).default('active'),
    startDate: s.isodate().optional(),
    endDate: s.isodate().nullish(),
    category: s.string().default('work'),
    tags: s.array(s.string()).default([]),
    summary: s.string().optional(),
    timeline: s.array(timelineEventSchema).default([]),
    metadata: s.record(s.string(), s.unknown()).default({}),
    body: s.raw(),
  })
  .transform((data, { meta }) => {
    const parts = ((meta.path ?? '').replace(/\.md$/, '')).split('/')
    const filename = parts.pop() ?? ''
    const fallback = filename === 'README' ? (parts.pop() ?? '') : filename
    return {
      ...data,
      title: data.title ?? fallback,
      slug: data.slug ?? fallback,
    }
  })

// ── Appendix schema (categorized, like InternWiki guide) ─────

const APPENDIX_CATEGORY_MAP: Record<string, string> = {
  career: '职业规划',
  company: '公司与组织',
  life: '生活',
  essays: '随笔',
  collection: '收藏',
}

const appendixSchema = s
  .object({
    title: s.string().optional(),
    slug: s.string().optional(),
    date: s.isodate().optional(),
    category: s.string().optional(),
    order: s.number().default(0),
    summary: s.string().optional(),
    tags: s.array(s.string()).default([]),
    metadata: s.record(s.string(), s.unknown()).default({}),
    body: s.raw(),
  })
  .transform((data, { meta }) => {
    const parts = ((meta.path ?? '').replace(/\.md$/, '')).split('/')
    const filename = parts.pop() ?? ''
    const fallback = filename === 'README' ? (parts.pop() ?? '') : filename
    // Derive category from parent subdirectory name
    const dirName = parts[parts.length - 1] ?? ''
    const derivedCategory = APPENDIX_CATEGORY_MAP[dirName] ?? '其他'
    return {
      ...data,
      title: data.title ?? fallback,
      slug: data.slug ?? fallback,
      category: data.category ?? derivedCategory,
    }
  })

const report = (name: string, pattern: string) =>
  defineCollection({
    name,
    pattern,
    schema: reportSchema,
  })

const project = (name: string, pattern: string) =>
  defineCollection({
    name,
    pattern,
    schema: projectSchema,
  })

export default defineConfig({
  root: 'content',
  output: {
    data: 'src/content/.velite',
    assets: 'src/content/.velite/assets',
    base: '/lifeOS/assets/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: {
    daily: report('daily', '6-daily/**/*.md'),
    weekly: report('weekly', '5-weekly/**/*.md'),
    monthly: report('monthly', '4-monthly/**/*.md'),
    quarterly: report('quarterly', '3-quarterly/**/*.md'),
    annual: report('annual', '2-annual/**/*.md'),
    vision: report('vision', '1-vision/**/*.md'),
    appendix: defineCollection({
      name: 'appendix',
      pattern: 'appendix/**/*.md',
      schema: appendixSchema,
    }),
    projects: project('projects', 'projects/*/README.md'),
    resume: report('resume', 'resume.md'),
  },
  mdx: {},
  markdown: {
    gfm: true,
    removeComments: true,
  },
})
