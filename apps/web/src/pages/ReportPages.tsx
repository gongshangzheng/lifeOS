import { useParams } from 'react-router-dom'
import { ReportList, type ReportListItem } from '@/components/ReportList'
import { ReportDetail, type ReportDetailItem } from '@/components/ReportDetail'
import { RelatedReports } from '@/components/RelatedReports'
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
  groupByCategory?: boolean
  listLoader: () => ReadonlyArray<{ slug: Slug; title: string; date?: string; summary?: string; category?: string }>
  detailLoader: (slug: string) =>
    | { title: string; slug: Slug; date?: string; summary?: string; body: string }
    | undefined
}

const COLLECTIONS = {
  daily: {
    label: 'Daily',
    description: '每日复盘 — 任务、进展、思考。',
    basePath: '/daily',
    empty: '还没有日报。',
    listLoader: getAllDaily,
    detailLoader: getDailyBySlug,
  },
  weekly: {
    label: 'Weekly',
    description: '周计划与周复盘。',
    basePath: '/weekly',
    empty: '还没有周报。',
    listLoader: getAllWeekly,
    detailLoader: getWeeklyBySlug,
  },
  monthly: {
    label: 'Monthly',
    description: '月度总结与下月规划。',
    basePath: '/monthly',
    empty: '还没有月报。',
    listLoader: getAllMonthly,
    detailLoader: getMonthlyBySlug,
  },
  quarterly: {
    label: 'Quarterly',
    description: '季度 OKR 与阶段回顾。',
    basePath: '/quarterly',
    empty: '还没有季报。',
    listLoader: getAllQuarterly,
    detailLoader: getQuarterlyBySlug,
  },
  annual: {
    label: 'Annual',
    description: '年度复盘与下年规划。',
    basePath: '/annual',
    empty: '还没有年报。',
    listLoader: getAllAnnual,
    detailLoader: getAnnualBySlug,
  },
  vision: {
    label: 'Vision',
    description: '愿景、五年与三年规划。',
    basePath: '/vision',
    empty: '还没有愿景文档。',
    listLoader: getAllVision,
    detailLoader: getVisionBySlug,
  },
  appendix: {
    label: 'Appendix',
    description: '职业规划、公司调研、生活随笔与收藏清单。',
    basePath: '/appendix',
    empty: '还没有文章。',
    groupByCategory: true,
    listLoader: getAllAppendix,
    detailLoader: getAppendixBySlug,
  },
} as const satisfies Record<string, CollectionConfig>

type CollectionKey = keyof typeof COLLECTIONS

function makeListPage(key: CollectionKey) {
  const cfg: CollectionConfig = COLLECTIONS[key]
  return function ListPage() {
    const items: ReportListItem[] = cfg
      .listLoader()
      .map((it) => ({ slug: it.slug, title: it.title, date: it.date, summary: it.summary, category: it.category }))
    return (
      <ReportList
        title={`${cfg.label} Reports`}
        description={cfg.description}
        items={items}
        basePath={cfg.basePath}
        emptyText={cfg.empty}
        groupByCategory={cfg.groupByCategory}
      />
    )
  }
}

function makeDetailPage(key: CollectionKey) {
  const cfg = COLLECTIONS[key]
  return function DetailPage() {
    const { slug = '' } = useParams<{ slug: string }>()
    const raw = cfg.detailLoader(slug)
    const item: ReportDetailItem | undefined = raw
      ? {
          title: raw.title,
          slug: raw.slug,
          date: raw.date,
          summary: raw.summary,
          body: raw.body,
        }
      : undefined
    const eventsDate = key === 'daily' && item?.date ? item.date.slice(0, 10) : undefined
    return (
      <>
        <ReportDetail
          item={item}
          backTo={cfg.basePath}
          backLabel={`${cfg.label} 列表`}
          notFoundTitle={`未找到 ${cfg.label}`}
          showEventsForDate={eventsDate}
        />
        {item?.date && (
          <RelatedReports type={key} slug={item.slug} date={item.date} />
        )}
      </>
    )
  }
}

export const DailyList = makeListPage('daily')
export const DailyDetail = makeDetailPage('daily')
export const WeeklyList = makeListPage('weekly')
export const WeeklyDetail = makeDetailPage('weekly')
export const MonthlyList = makeListPage('monthly')
export const MonthlyDetail = makeDetailPage('monthly')
export const QuarterlyList = makeListPage('quarterly')
export const QuarterlyDetail = makeDetailPage('quarterly')
export const AnnualList = makeListPage('annual')
export const AnnualDetail = makeDetailPage('annual')
export const VisionList = makeListPage('vision')
export const VisionDetail = makeDetailPage('vision')
export const AppendixList = makeListPage('appendix')
export const AppendixDetail = makeDetailPage('appendix')
