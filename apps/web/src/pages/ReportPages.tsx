import { useParams } from 'react-router-dom'
import { NotebookPen, CalendarRange, Calendar as CalendarIcon, Target, Compass, BookOpen, Library } from 'lucide-react'
import { ReportLayout, type ReportTab } from '@/components/ReportLayout'
import {
  getAllDaily,
  getDailyBySlug,
  getAllWeekly,
  getWeeklyBySlug,
  getAllMonthly,
  getMonthlyBySlug,
  getAllQuarterly,
  getQuarterlyBySlug,
  getAllAnnual,
  getAnnualBySlug,
  getAllVision,
  getVisionBySlug,
  getAllAppendix,
  getAppendixBySlug,
} from '@/content/loader'

type CollectionConfig<Slug extends string = string> = {
  label: string
  description: string
  basePath: string
  empty: string
  showEventsForDate?: boolean
  showFirstTimesForDate?: boolean
  listLoader: () => ReadonlyArray<{ slug: Slug; title: string; date?: string; summary?: string; category?: string }>
  detailLoader: (slug: string) =>
    | { title: string; slug: Slug; date?: string; summary?: string; body: string }
    | undefined
}

const COLLECTIONS = {
  daily: {
    label: '日报',
    description: '每日复盘 — 任务、进展、思考。',
    basePath: '/report/daily',
    empty: '还没有日报。',
    showEventsForDate: true,
    showFirstTimesForDate: true,
    listLoader: getAllDaily,
    detailLoader: getDailyBySlug,
  },
  weekly: {
    label: '周报',
    description: '周计划与周复盘。',
    basePath: '/report/weekly',
    empty: '还没有周报。',
    listLoader: getAllWeekly,
    detailLoader: getWeeklyBySlug,
  },
  monthly: {
    label: '月报',
    description: '月度总结与下月规划。',
    basePath: '/report/monthly',
    empty: '还没有月报。',
    listLoader: getAllMonthly,
    detailLoader: getMonthlyBySlug,
  },
  quarterly: {
    label: '季报',
    description: '季度 OKR 与阶段回顾。',
    basePath: '/report/quarterly',
    empty: '还没有季报。',
    listLoader: getAllQuarterly,
    detailLoader: getQuarterlyBySlug,
  },
  annual: {
    label: '年报',
    description: '年度复盘与下年规划。',
    basePath: '/report/annual',
    empty: '还没有年报。',
    listLoader: getAllAnnual,
    detailLoader: getAnnualBySlug,
  },
  vision: {
    label: '愿景',
    description: '愿景、五年与三年规划。',
    basePath: '/report/vision',
    empty: '还没有愿景文档。',
    listLoader: getAllVision,
    detailLoader: getVisionBySlug,
  },
  appendix: {
    label: '附录',
    description: '职业规划、公司调研、生活随笔与收藏清单。',
    basePath: '/report/appendix',
    empty: '还没有文章。',
    listLoader: getAllAppendix,
    detailLoader: getAppendixBySlug,
  },
} as const satisfies Record<string, CollectionConfig>

type CollectionKey = keyof typeof COLLECTIONS

// 报告类型标签页配置
const REPORT_TABS: ReportTab[] = [
  { key: 'daily', label: '日报', path: '/report/daily', icon: NotebookPen },
  { key: 'weekly', label: '周报', path: '/report/weekly', icon: CalendarRange },
  { key: 'monthly', label: '月报', path: '/report/monthly', icon: CalendarIcon },
  { key: 'quarterly', label: '季报', path: '/report/quarterly', icon: Target },
  { key: 'annual', label: '年报', path: '/report/annual', icon: BookOpen },
  { key: 'vision', label: '愿景', path: '/report/vision', icon: Compass },
  { key: 'appendix', label: '附录', path: '/report/appendix', icon: Library },
]

function makeReportPage(key: CollectionKey) {
  const cfg: CollectionConfig = COLLECTIONS[key]
  return function ReportPage() {
    const { slug = '' } = useParams<{ slug: string }>()
    const items = cfg
      .listLoader()
      .map((it) => ({ slug: it.slug, title: it.title, date: it.date, summary: it.summary, category: it.category }))

    const raw = slug ? cfg.detailLoader(slug) : undefined

    // Debug logging
    if (slug) {
      console.log(`[${key}] Looking up slug:`, slug)
      console.log(`[${key}] Found item:`, !!raw)
      console.log(`[${key}] Available slugs:`, items.slice(0, 5).map(i => i.slug))
    }

    const detail = raw
      ? {
          title: raw.title,
          slug: raw.slug,
          date: raw.date,
          summary: raw.summary,
          body: raw.body,
        }
      : undefined

    return (
      <ReportLayout
        type={key}
        label={cfg.label}
        description={cfg.description}
        basePath={cfg.basePath}
        empty={cfg.empty}
        tabs={REPORT_TABS}
        items={items}
        detail={detail}
        showEventsForDate={cfg.showEventsForDate}
        showFirstTimesForDate={cfg.showFirstTimesForDate}
        relatedType={key}
      />
    )
  }
}

export const DailyList = makeReportPage('daily')
export const DailyDetail = makeReportPage('daily')
export const WeeklyList = makeReportPage('weekly')
export const WeeklyDetail = makeReportPage('weekly')
export const MonthlyList = makeReportPage('monthly')
export const MonthlyDetail = makeReportPage('monthly')
export const QuarterlyList = makeReportPage('quarterly')
export const QuarterlyDetail = makeReportPage('quarterly')
export const AnnualList = makeReportPage('annual')
export const AnnualDetail = makeReportPage('annual')
export const VisionList = makeReportPage('vision')
export const VisionDetail = makeReportPage('vision')
export const AppendixList = makeReportPage('appendix')
export const AppendixDetail = makeReportPage('appendix')

