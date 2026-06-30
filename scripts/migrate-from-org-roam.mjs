#!/usr/bin/env node
/**
 * migrate-from-org-roam.mjs
 * --------------------------------------------------------------
 * 从 `/Users/zhengxinyu/Org/roam/life/reports/` 把所有报告
 * 迁移到 `apps/web/content/{type}/`，并自动补 frontmatter。
 *
 * 跑法：
 *   pnpm migrate:from-org-roam
 *   # 或
 *   node scripts/migrate-from-org-roam.mjs --src <reports-dir> --dst <content-dir>
 *
 * 默认源/目标（可通过命令行覆盖）：
 *   src = /Users/zhengxinyu/Org/roam/life/reports
 *   dst = <repo>/apps/web/content
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// ---------- CLI args ----------
const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const SRC = path.resolve(arg(
  '--src',
  '/Users/zhengxinyu/Org/roam/life/reports',
));
const DST = path.resolve(arg('--dst', path.join(repoRoot, 'apps', 'web', 'content')));

const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const FORCE = args.includes('--force') || args.includes('-f');

// ---------- mappings ----------
// reports/{folder} -> content/{folder} + type tag
const TYPE_MAP = {
  '1-vision': 'vision',
  '2-annual': 'annual',
  '3-quarterly': 'quarterly',
  '4-monthly': 'monthly',
  '5-weekly': 'weekly',
  '6-daily': 'daily',
  appendix: 'appendix',
  study: 'study',
};

const SKIP_DIRS = new Set(['_templates', '.git']);
const SKIP_FILES = new Set(['README.md', 'readme.md']);

// ---------- helpers ----------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md') && !SKIP_FILES.has(d.name))
    .map((d) => d.name)
    .sort();
}

/**
 * 从文件内容第一行提取 `tags: a b c` 这种 inline 标签
 */
function extractInlineTags(content) {
  const m = content.match(/^`tags:\s*([^`]+)`\s*$/m);
  if (!m) return { tags: [], body: content };
  const tags = m[1].trim().split(/\s+/).filter(Boolean);
  const body = content.replace(m[0], '').replace(/^\s*\n/, '');
  return { tags, body };
}

/**
 * 提取第一行 H1 作为 title
 */
function extractTitle(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

/**
 * 提取第一个引用块作为 summary
 */
function extractSummary(body) {
  const lines = body.split('\n');
  const summaryLines = [];
  let inBlockquote = false;
  for (const line of lines) {
    const t = line.trim();
    if (!inBlockquote && t.startsWith('>')) {
      inBlockquote = true;
      summaryLines.push(t.replace(/^>\s*/, ''));
    } else if (inBlockquote) {
      if (t.startsWith('>')) {
        summaryLines.push(t.replace(/^>\s*/, ''));
      } else if (t === '') {
        // 空行结束
        break;
      } else {
        break;
      }
    }
  }
  const summary = summaryLines.join(' ').trim();
  return summary || null;
}

/**
 * 从文件名推断 slug 和 date
 */
function inferFromName(filename) {
  const base = filename.replace(/\.md$/, '');

  // daily: 2026-06-14
  let m = base.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (m) return { slug: m[1], date: m[1] };

  // weekly: 2026-06-W25 → 推算成该周周一的 ISO 日期
  m = base.match(/^(\d{4})-(\d{2})-W(\d{2})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const week = parseInt(m[3], 10);
    // ISO 8601: W01 是包含 1 月 4 日的那一周；周一是周的第一天
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7; // Mon=1, Sun=7
    const w01Monday = new Date(jan4);
    w01Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
    const weekMonday = new Date(w01Monday);
    weekMonday.setUTCDate(w01Monday.getUTCDate() + (week - 1) * 7);
    const isoDate = weekMonday.toISOString().slice(0, 10);
    return {
      slug: `${year}-${m[2]}-W${m[3]}`,
      date: isoDate,
      weekNumber: week,
    };
  }

  // quarterly: 2026-Q2
  m = base.match(/^(\d{4})-(Q[1-4])$/);
  if (m) {
    const qStart = { Q1: '01-01', Q2: '04-01', Q3: '07-01', Q4: '10-01' }[m[2]];
    return {
      slug: m[1] + '-' + m[2],
      date: `${m[1]}-${qStart}`,
      quarter: m[2],
    };
  }

  // monthly: 2026-06
  m = base.match(/^(\d{4}-\d{2})$/);
  if (m) {
    return {
      slug: m[1],
      date: `${m[1]}-01`,
    };
  }

  // annual: 2026 或 annual-2026-2027
  m = base.match(/^(\d{4})$/);
  if (m) {
    return { slug: m[1], date: `${m[1]}-01-01` };
  }
  m = base.match(/^annual-(\d{4})-(\d{4})$/);
  if (m) {
    return {
      slug: base,
      date: `${m[1]}-01-01`,
      yearRange: `${m[1]}-${m[2]}`,
    };
  }

  // vision: five-year-2026-2030 / three-year-career-2026-2028
  m = base.match(/^five-year-(\d{4})-(\d{4})$/);
  if (m) {
    return {
      slug: base,
      date: `${m[1]}-01-01`,
      yearRange: `${m[1]}-${m[2]}`,
      kind: 'five-year',
    };
  }
  m = base.match(/^three-year-career-(\d{4})-(\d{4})$/);
  if (m) {
    return {
      slug: base,
      date: `${m[1]}-01-01`,
      yearRange: `${m[1]}-${m[2]}`,
      kind: 'three-year-career',
    };
  }

  // fallback
  return { slug: base, date: null };
}

/**
 * 给原始内容加上 YAML frontmatter
 */
function buildFrontmatter({ type, title, slug, date, summary, tags, extra }) {
  const fm = {
    title,
    slug,
    type,
  };
  if (date) fm.date = date;
  if (summary) fm.summary = summary;
  if (tags && tags.length) fm.tags = tags;
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null) fm[k] = v;
    }
  }

  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return `${k}:\n${v.map((x) => `  - ${yamlEscape(x)}`).join('\n')}`;
      }
      return `${k}: ${yamlEscape(v)}`;
    })
    .join('\n');

  return `---\n${yaml}\n---\n\n`;
}

function yamlEscape(v) {
  if (typeof v !== 'string') return JSON.stringify(v);
  if (/[:#&*!|>'"%@`{}[\],\n]/.test(v) || /^\s|\s$/.test(v)) {
    return JSON.stringify(v);
  }
  return v;
}

// ---------- main ----------
function migrate() {
  console.log('📦 lifeOS content migration');
  console.log(`   src: ${SRC}`);
  console.log(`   dst: ${DST}`);
  if (DRY_RUN) console.log('   ⚠️  DRY RUN (no files will be written)');
  console.log('');

  if (!fs.existsSync(SRC)) {
    console.error(`❌ Source directory not found: ${SRC}`);
    process.exit(1);
  }

  ensureDir(DST);

  const stats = {
    total: 0,
    written: 0,
    skipped: 0,
    errors: 0,
    byType: {},
  };

  for (const [subdir, type] of Object.entries(TYPE_MAP)) {
    const srcDir = path.join(SRC, subdir);
    if (!fs.existsSync(srcDir)) {
      if (VERBOSE) console.log(`⏭️  skip (no dir): ${subdir}`);
      continue;
    }

    const files = listMarkdown(srcDir);
    if (files.length === 0) continue;

    const dstDir = path.join(DST, subdir);
    if (!DRY_RUN) ensureDir(dstDir);
    stats.byType[type] = 0;

    for (const file of files) {
      stats.total += 1;
      try {
        const srcFile = path.join(srcDir, file);
        const raw = fs.readFileSync(srcFile, 'utf-8');

        const { tags, body } = extractInlineTags(raw);
        const title = extractTitle(body) || file.replace(/\.md$/, '');
        const summary = extractSummary(body);
        const inferred = inferFromName(file);

        // 优先用 frontmatter-derived slug，fallback 到文件名
        const slug = inferred.slug || file.replace(/\.md$/, '');
        const fmExtra = {};
        if (inferred.weekNumber !== undefined) fmExtra.weekNumber = inferred.weekNumber;
        if (inferred.quarter !== undefined) fmExtra.quarter = inferred.quarter;
        if (inferred.yearRange !== undefined) fmExtra.yearRange = inferred.yearRange;
        if (inferred.kind !== undefined) fmExtra.kind = inferred.kind;

        const frontmatter = buildFrontmatter({
          type,
          title,
          slug,
          date: inferred.date,
          summary,
          tags,
          extra: fmExtra,
        });

        const newContent = frontmatter + body.trim() + '\n';
        const dstFile = path.join(dstDir, file);

        if (DRY_RUN) {
          console.log(`   [dry] ${subdir}/${file} → type=${type} slug=${slug} tags=${tags.join(',')}`);
        } else {
          if (fs.existsSync(dstFile) && !FORCE) {
            // 不覆盖原文件，但记录
            if (VERBOSE) console.log(`   ↺  exists: ${subdir}/${file}`);
            stats.skipped += 1;
          } else {
            fs.writeFileSync(dstFile, newContent, 'utf-8');
            stats.written += 1;
            stats.byType[type] += 1;
            if (VERBOSE) {
              console.log(`   ✓ ${subdir}/${file} (type=${type}, slug=${slug})`);
            }
          }
        }
      } catch (err) {
        stats.errors += 1;
        console.error(`   ❌ ${subdir}/${file}: ${err.message}`);
      }
    }
  }

  console.log('');
  console.log('─── migration summary ───');
  console.log(`  total:   ${stats.total}`);
  console.log(`  written: ${stats.written}`);
  console.log(`  skipped: ${stats.skipped} (already exist)`);
  console.log(`  errors:  ${stats.errors}`);
  console.log('  by type:');
  for (const [t, n] of Object.entries(stats.byType)) {
    if (n > 0) console.log(`    - ${t}: ${n}`);
  }
  if (stats.errors > 0) process.exit(1);
}

migrate();
