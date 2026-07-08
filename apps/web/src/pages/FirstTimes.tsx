import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface FirstTime {
  date: string
  title: string
  note?: string
}

export function FirstTimesPage() {
  const [items, setItems] = useState<FirstTime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/lifeOS/first-times.json')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.firstTimes ?? [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
      })
  }, [])

  // Group by year-month
  const grouped: Record<string, FirstTime[]> = {}
  for (const item of items) {
    const key = item.date.slice(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  const sortedKeys = Object.keys(grouped).sort().reverse()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h1 className="lo-section-title">初体验</h1>
        </div>
        <p className="text-sm text-dim">那些第一次发生的事，不管多小，都值得留下一笔。</p>
      </header>

      {loading ? (
        <div className="py-12 text-center text-sm text-dim">加载中…</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-dim">还没有记录初体验。</div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <div key={key} className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {key}
                <span className="text-placeholder">{grouped[key].length}</span>
              </h2>
              <div className="space-y-2">
                {grouped[key].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                  >
                    <span className="text-amber-500/60">✦</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-heading">{item.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-dim">
                        <span className="font-mono">{item.date.slice(5)}</span>
                        {item.note && <span>— {item.note}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
