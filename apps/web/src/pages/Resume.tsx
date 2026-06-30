import { ArrowLeft, FileText, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MarkdownView } from '@/components/MarkdownView'
import { getResume } from '@/content/loader'

export function ResumePage() {
  const resume = getResume()

  if (!resume) {
    return (
      <section className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回首页
        </Link>
        <h1 className="lo-section-title">未找到简历</h1>
        <p className="text-body">简历内容尚未生成，请稍后再试。</p>
      </section>
    )
  }

  const pdfUrl = `${import.meta.env.BASE_URL}resume/郑鑫裕-简历.pdf`
  const texUrl = `${import.meta.env.BASE_URL}resume/郑鑫裕-简历.tex`

  return (
    <article className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回首页
      </Link>

      <header className="lo-divider space-y-3 border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">{resume.title}</h1>
        <p className="text-sm text-body">{resume.summary}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FileText className="h-4 w-4" />
            下载 PDF
          </a>
          <a
            href={texUrl}
            download
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            LaTeX 源码
          </a>
        </div>
      </header>

      <MarkdownView body={resume.body} />
    </article>
  )
}
