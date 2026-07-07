import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MarkdownView } from '@/components/MarkdownView'
import { RelatedReports } from '@/components/RelatedReports'
import { stripMarkdown } from '@/lib/markdown'
import { extractToc } from '@/lib/utils'
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
  getAppendixGrouped,
} from '@/content/loader'

type CollectionKey = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'vision' | 'appendix'

type AnyReport = {
  slug: string
  title: string
  date?: string
  summary?: string
  body: string
  category?: string
}

const COLLECTION_CONFIG: Record<
  CollectionKey,
  {
    label: string
    basePath: string
    empty: string
    listLoader: () => AnyReport[]
    detailLoader: (slug: string) => AnyReport | undefined
  }
> = {
  daily: { label: '日报', basePath: '/daily', empty: '还没有日报。', listLoader: getAllDaily, detailLoader: getDailyBySlug },
  weekly: { label: '周报', basePath: '/weekly', empty: '还没有周报。', listLoader: getAllWeekly, detailLoader: getWeeklyBySlug },
  monthly: { label: '月报', basePath: '/monthly', empty: '还没有月报。', listLoader: getAllMonthly, detailLoader: getMonthlyBySlug },
  quarterly: { label: '季报', basePath: '/quarterly', empty: '还没有季报。', listLoader: getAllQuarterly, detailLoader: getQuarterlyBySlug },
  annual: { label: '年报', basePath: '/annual', empty: '还没有年报。', listLoader: getAllAnnual, detailLoader: getAnnualBySlug },
  vision: { label: '愿景', basePath: '/vision', empty: '还没有愿景文档。', listLoader: getAllVision, detailLoader: getVisionBySlug },
  appendix: { label: '附录', basePath: '/appendix', empty: '还没有文章。', listLoader: getAllAppendix, detailLoader: getAppendixBySlug },
}

const REPORT_TYPES: CollectionKey[] = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'vision', 'appendix']

function formatDate(iso?: string): string {
  return iso?.slice(0, 10) ?? ''
}

/** Unified report page — wiki layout with sidebar + content + TOC */
function ReportPage({ type }: { type: CollectionKey }) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const cfg = COLLECTION_CONFIG[type]
  const collection = cfg.listLoader()

  // Empty state
  if (collection.length === 0) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="lo-section-title">{cfg.label}</h1>
        </header>
        <p className="py-8 text-center text-sm text-dim">{cfg.empty}</p>
      </section>
    )
  }

  // Redirect to first report if no slug
  if (!slug) {
    return <Navigate to={`${cfg.basePath}/${collection[0].slug}`} replace />
  }

  const article = cfg.detailLoader(slug)

  // Not found
  if (!article) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-dim">未找到{cfg.label}: {slug}</p>
        <Link to={cfg.basePath} className="mt-2 inline-block text-xs text-primary hover:underline">
          返回{cfg.label}
        </Link>
      </div>
    )
  }

  // Find prev/next (collection is sorted by date desc, so prev = newer, next = older)
  const currentIdx = collection.findIndex((r) => r.slug === article.slug)
  const prevReport = currentIdx > 0 ? collection[currentIdx - 1] : null
  const nextReport = currentIdx < collection.length - 1 ? collection[currentIdx + 1] : null

  // Extract TOC from article body
  const tocItems = extractToc(article.body)
  const date = formatDate(article.date)
  const summary = article.summary ? stripMarkdown(article.summary) : ''

  // For appendix, get grouped categories for sidebar
  const appendixGroups = type === 'appendix' ? getAppendixGrouped() : null

  return (
    <div className="flex gap-6">
      {/* ── Left sidebar: two-layer report list ── */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {/* Layer 1: report type tabs */}
          <div className="report-type-tabs">
            {REPORT_TYPES.map((rt) => (
              <Link
                key={rt}
                to={COLLECTION_CONFIG[rt].basePath}
                className={`report-type-tab ${rt === type ? 'active' : ''}`}
              >
                {COLLECTION_CONFIG[rt].label}
              </Link>
            ))}
          </div>
          {/* Layer 2: article list */}
          {appendixGroups ? (
            <nav>
              {appendixGroups.map(({ category, items }) => (
                <div key={category}>
                  <div className="guide-sidebar-category">{category}</div>
                  {items.map((item) => (
                    <Link
                      key={item.slug}
                      to={`${cfg.basePath}/${item.slug}`}
                      className={`guide-sidebar-link ${item.slug === article.slug ? 'active' : ''}`}
                    >
                      <div className="truncate">{item.title}</div>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          ) : (
            <nav>
              {collection.map((item) => (
                <Link
                  key={item.slug}
                  to={`${cfg.basePath}/${item.slug}`}
                  className={`guide-sidebar-link ${item.slug === article.slug ? 'active' : ''}`}
                >
                  <div className="truncate">{item.title}</div>
                  {item.date && (
                    <div className="mt-0.5 font-mono text-[10px] text-placeholder">
                      {formatDate(item.date)}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>

      {/* ── Center: article content ── */}
      <article className="min-w-0 flex-1">
        {/* Mobile article selector */}
        <div className="mb-4 lg:hidden">
          <label className="mb-1 block text-xs font-medium text-dim">选择{cfg.label}</label>
          <select
            value={article.slug}
            onChange={(e) => navigate(`${cfg.basePath}/${e.target.value}`)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-heading"
          >
            {collection.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-xs text-dim">
          <Link to={cfg.basePath} className="hover:text-heading">
            {cfg.label}
          </Link>
          {article.category && (
            <>
              <span>/</span>
              <span className="text-body">{article.category}</span>
            </>
          )}
        </div>

        {/* Article header */}
        <header className="mb-6 border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-heading">{article.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-dim">
            {date && <span className="font-mono">{date}</span>}
            <span className="font-mono text-placeholder">/{article.slug}</span>
          </div>
          {summary && <p className="mt-2 text-sm text-dim">{summary}</p>}
        </header>

        {/* Article body */}
        <div className="lo-card p-6">
          <MarkdownView body={article.body} />
        </div>

        {/* Related reports */}
        {article.date && (
          <RelatedReports type={type} slug={article.slug} date={article.date} />
        )}

        {/* Prev / Next navigation */}
        <div className="mt-6 flex items-stretch gap-3">
          {prevReport ? (
            <Link
              to={`${cfg.basePath}/${prevReport.slug}`}
              className="lo-card group flex flex-1 items-center gap-3 p-4 transition-colors hover:border-primary/40"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 text-dim transition-colors group-hover:text-primary" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-placeholder">较新</div>
                <div className="truncate text-sm font-medium text-heading">
                  {prevReport.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextReport ? (
            <Link
              to={`${cfg.basePath}/${nextReport.slug}`}
              className="lo-card group flex flex-1 items-center justify-end gap-3 p-4 text-right transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-placeholder">较旧</div>
                <div className="truncate text-sm font-medium text-heading">
                  {nextReport.title}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-dim transition-colors group-hover:text-primary" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </article>

      {/* ── Right sidebar: TOC ── */}
      {tocItems.length > 0 && (
        <aside className="hidden w-48 shrink-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="mb-2 px-2 text-xs font-semibold text-heading">
              目录
            </div>
            <nav>
              {tocItems.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.slug}`}
                  className={`guide-toc-link ${item.level === 3 ? 'level-3' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  )
}

// Exported page components — list and detail both render the unified ReportPage
export const DailyList = () => <ReportPage type="daily" />
export const DailyDetail = () => <ReportPage type="daily" />
export const WeeklyList = () => <ReportPage type="weekly" />
export const WeeklyDetail = () => <ReportPage type="weekly" />
export const MonthlyList = () => <ReportPage type="monthly" />
export const MonthlyDetail = () => <ReportPage type="monthly" />
export const QuarterlyList = () => <ReportPage type="quarterly" />
export const QuarterlyDetail = () => <ReportPage type="quarterly" />
export const AnnualList = () => <ReportPage type="annual" />
export const AnnualDetail = () => <ReportPage type="annual" />
export const VisionList = () => <ReportPage type="vision" />
export const VisionDetail = () => <ReportPage type="vision" />
export const AppendixList = () => <ReportPage type="appendix" />
export const AppendixDetail = () => <ReportPage type="appendix" />
