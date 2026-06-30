import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { internalLinkHref } from '@/lib/markdown'

type CodeProps = {
  className?: string
  children?: ReactNode
}

type PreProps = {
  children?: ReactNode
}

function CodeBlock({ className, children }: CodeProps) {
  const [copied, setCopied] = useState(false)
  const raw = String(children ?? '').replace(/\n$/, '')
  const langMatch = /language-([\w-]+)/.exec(className ?? '')
  const language = langMatch?.[1] ?? 'text'

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard might be unavailable in some contexts — ignore
    }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80">
      <div className="flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-500">
        <span>{language}</span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="复制代码"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '0.9rem 1rem',
          background: 'transparent',
          fontSize: '0.82rem',
          lineHeight: 1.55,
        }}
        PreTag="div"
      >
        {raw}
      </SyntaxHighlighter>
    </div>
  )
}

function InlineCode({ className, children, ...rest }: CodeProps) {
  // react-markdown wraps every code element — the Pre one passes `className="language-x"`,
  // inline ones don't. We use that to distinguish.
  if ((className ?? '').includes('language-')) {
    return <CodeBlock className={className}>{children}</CodeBlock>
  }
  return (
    <code
      className={cn(
        'rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-200',
        className,
      )}
      {...rest}
    >
      {children}
    </code>
  )
}

function MarkdownPre({ children }: PreProps) {
  // react-markdown wraps every code block in <pre>. We've already rendered
  // the CodeBlock in the `code` component above, so just pass through.
  return <>{children}</>
}

function MarkdownLink({
  href,
  children,
}: {
  href?: string
  children?: ReactNode
}) {
  const target = href ?? ''
  const internal = target ? internalLinkHref(target) : null

  if (internal) {
    return (
      <Link
        to={internal}
        className="text-indigo-300 underline decoration-indigo-500/40 underline-offset-2 transition-colors hover:text-indigo-200 hover:decoration-indigo-300"
      >
        {children}
      </Link>
    )
  }

  const isExternal = /^https?:\/\//i.test(target)
  return (
    <a
      href={target}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
      className="text-indigo-300 underline decoration-indigo-500/40 underline-offset-2 transition-colors hover:text-indigo-200 hover:decoration-indigo-300"
    >
      {children}
    </a>
  )
}

const components: Components = {
  a: MarkdownLink,
  code: InlineCode,
  pre: MarkdownPre,
  // tighten tables in dark theme
  table: ({ children, ...rest }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm" {...rest}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...rest }) => (
    <thead className="bg-zinc-900/70 text-zinc-200" {...rest}>
      {children}
    </thead>
  ),
  th: ({ children, ...rest }) => (
    <th className="border-b border-zinc-800 px-3 py-2 text-left font-medium" {...rest}>
      {children}
    </th>
  ),
  td: ({ children, ...rest }) => (
    <td className="border-b border-zinc-800/60 px-3 py-2 align-top text-zinc-300" {...rest}>
      {children}
    </td>
  ),
  blockquote: ({ children, ...rest }) => (
    <blockquote
      className="my-4 border-l-2 border-indigo-500/60 bg-indigo-500/5 px-4 py-1 text-zinc-300"
      {...rest}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className="my-6 border-zinc-800" {...props} />,
  // task list checkboxes (GFM)
  input: ({ type, checked, ...rest }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={!!checked}
          readOnly
          disabled
          className="mr-2 h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900 accent-indigo-500"
          {...rest}
        />
      )
    }
    return <input type={type} {...rest} />
  },
}

type MarkdownViewProps = {
  body: string
  className?: string
}

export function MarkdownView({ body, className }: MarkdownViewProps) {
  return (
    <div className={cn('md-body text-[0.92rem] leading-relaxed text-zinc-200', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
