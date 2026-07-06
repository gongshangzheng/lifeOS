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
    const fallback = (meta.path ?? '').replace(/\.md$/, '').split('/').pop() ?? ''
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
    const fallback = (meta.path ?? '').replace(/\.md$/, '').split('/').pop() ?? ''
    return {
      ...data,
      title: data.title ?? fallback,
      slug: data.slug ?? fallback,
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
    appendix: report('appendix', 'appendix/**/*.md'),
    topics: report('topics', 'topics/**/*.md'),
    projects: project('projects', 'projects/**/*.md'),
    resume: report('resume', 'resume.md'),
  },
  mdx: {},
  markdown: {
    gfm: true,
    removeComments: true,
  },
})
