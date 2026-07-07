import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_PROJECTS = resolve(__dirname, 'content/projects')

/**
 * Serve project files from content/projects/ during dev,
 * and copy tasks.json to dist/ during production build.
 * Supports: /{slug}.tasks.json and /{slug}/{path} for notes etc.
 */
function projectTasksPlugin(): Plugin {
  return {
    name: 'lifeos-project-tasks',

    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        // Match: /lifeOS/{slug}.tasks.json
        const tasksMatch = url.match(/\/lifeOS\/(.+?)\.tasks\.json$/)
        if (tasksMatch) {
          const slug = tasksMatch[1]
          const filePath = join(CONTENT_PROJECTS, slug, 'tasks.json')
          if (!existsSync(filePath)) return next()
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(readFileSync(filePath, 'utf-8'))
          return
        }
        // Match: /lifeOS/projects/{slug}/{path} for notes etc.
        const noteMatch = url.match(/\/lifeOS\/projects\/([^/]+)\/(.+)$/)
        if (noteMatch) {
          const slug = noteMatch[1]
          const relPath = decodeURIComponent(noteMatch[2])
          const filePath = join(CONTENT_PROJECTS, slug, relPath)
          if (!existsSync(filePath)) return next()
          if (relPath.endsWith('.md')) res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(readFileSync(filePath, 'utf-8'))
          return
        }
        next()
      })
    },

    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      if (!existsSync(outDir)) return
      const dirs = readdirSync(CONTENT_PROJECTS, { withFileTypes: true })
      for (const d of dirs) {
        if (!d.isDirectory()) continue
        const src = join(CONTENT_PROJECTS, d.name, 'tasks.json')
        const dest = join(outDir, `${d.name}.tasks.json`)
        if (existsSync(src)) copyFileSync(src, dest)
      }
      console.log('✓ Copied project tasks.json files to dist/')
    },
  }
}

export default defineConfig({
  base: '/lifeOS/',
  plugins: [react(), tailwindcss(), projectTasksPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-markdown',
      'remark-gfm',
      'rehype-raw',
      'lucide-react',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/interaction',
      '@fullcalendar/list',
      '@fullcalendar/timegrid',
      '@fullcalendar/core',
      'react-syntax-highlighter',
      'zustand',
      'clsx',
      'tailwind-merge',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@fullcalendar')) return 'vendor-fullcalendar'
          if (id.includes('react-syntax-highlighter')) return 'vendor-syntax-highlight'
          if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('rehype-raw')) return 'vendor-markdown'
          if (id.includes('react-router-dom') || /node_modules\/react(-dom)?\//.test(id)) return 'vendor-react'
        },
      },
    },
  },
})
