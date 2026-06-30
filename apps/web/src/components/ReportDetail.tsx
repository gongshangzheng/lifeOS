import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { stripMarkdown } from '@/lib/markdown'
import { MarkdownView } from './MarkdownView'

export type ReportDetailItem = {
  title: string
  slug: string
  date?: string
  summary?: string
  body: string
}

type ReportDetailProps = {
  title?: string
  item: ReportDetailItem | undefined
  backTo: string
  backLabel: string
  notFoundTitle?: string
}

function formatDate(iso?: string): string | null {
  if (!iso) return null
  return iso.slice(0, 10)
}

export function ReportDetail({
  title,
  item,
  backTo,
  backLabel,
  notFoundTitle = '未找到',
}: ReportDetailProps) {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!item) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{notFoundTitle}</h1>
        <p className="text-zinc-400">
          没有找到 slug 为 <code className="text-indigo-300">{slug}</code> 的报告。
        </p>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回 {backLabel}
        </Link>
      </section>
    )
  }

  const date = formatDate(item.date)
  const summary = item.summary ? stripMarkdown(item.summary) : ''

  return (
    <article className="space-y-5">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-indigo-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <header className="space-y-2 border-b border-zinc-800/60 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {title ?? item.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {date && <span className="font-mono">{date}</span>}
          <span className="font-mono text-zinc-600">/{item.slug}</span>
        </div>
        {summary && <p className="text-sm text-zinc-300">{summary}</p>}
      </header>

      <MarkdownView body={item.body} />
    </article>
  )
}
