import { NavLink } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'
import { stripMarkdown } from '@/lib/markdown'

export type ReportListItem = {
  slug: string
  title: string
  date?: string
  summary?: string
}

type ReportListProps = {
  title: string
  description?: string
  items: ReadonlyArray<ReportListItem>
  basePath: string
  emptyText?: string
}

function formatDate(iso?: string): string | null {
  if (!iso) return null
  // Velite serialises isodate() as ISO 8601; show the calendar date part only.
  return iso.slice(0, 10)
}

export function ReportList({
  title,
  description,
  items,
  basePath,
  emptyText = '还没有内容。',
}: ReportListProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        {description && <p className="text-sm text-zinc-400">{description}</p>}
      </header>

      {items.length === 0 ? (
        <p className="text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const date = formatDate(it.date)
            const preview = it.summary ? stripMarkdown(it.summary) : ''
            return (
              <li key={it.slug}>
                <NavLink
                  to={`${basePath}/${it.slug}`}
                  className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-indigo-500/50 hover:bg-zinc-900"
                >
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500 group-hover:text-indigo-300" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-medium text-zinc-100 group-hover:text-indigo-100">
                        {it.title}
                      </span>
                      {date && (
                        <span className="flex-shrink-0 font-mono text-[11px] text-zinc-500">
                          {date}
                        </span>
                      )}
                    </div>
                    {preview && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{preview}</p>
                    )}
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-indigo-300" />
                </NavLink>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
