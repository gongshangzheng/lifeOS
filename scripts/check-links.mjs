#!/usr/bin/env node
/**
 * check-links.mjs
 * --------------------------------------------------------------
 * 扫描 content/ 下所有 markdown 文件，检查内部链接是否都能解析。
 *
 * 跑法：
 *   node scripts/check-links.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(repoRoot, 'apps', 'web', 'content');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');

function* walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdown(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

function findMarkdownFiles() {
  return [...walkMarkdown(CONTENT_ROOT)];
}

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function checkFile(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const dir = path.dirname(mdFile);
  const issues = [];

  let m;
  while ((m = LINK_RE.exec(content)) !== null) {
    const [, text, target] = m;
    // 跳过外链、锚点、mailto
    if (/^(https?:|mailto:|#|javascript:)/.test(target)) continue;
    // 跳过 Velite 内部链接（带查询参数如 ?type=）等
    if (target.startsWith('?')) continue;

    // 去掉锚点
    const [filePath] = target.split('#');

    if (!filePath) continue; // 纯锚点

    const absPath = path.resolve(dir, filePath);
    if (!fs.existsSync(absPath)) {
      issues.push({ text, target, line: contentLine(content, m.index) });
    }
  }
  return issues;
}

function contentLine(content, index) {
  return content.slice(0, index).split('\n').length;
}

function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`❌ Content directory not found: ${CONTENT_ROOT}`);
    console.error('   先跑 `pnpm migrate:from-org-roam` 迁内容。');
    process.exit(1);
  }

  const files = findMarkdownFiles();
  console.log(`🔗 Checking links in ${files.length} markdown files...\n`);

  let totalIssues = 0;
  for (const file of files) {
    const issues = checkFile(file);
    if (issues.length === 0) {
      if (VERBOSE) console.log(`   ✓ ${path.relative(repoRoot, file)}`);
      continue;
    }
    totalIssues += issues.length;
    console.log(`   ✗ ${path.relative(repoRoot, file)}`);
    for (const i of issues) {
      console.log(`       line ${i.line}: [${i.text}](${i.target})`);
    }
  }

  console.log('');
  if (totalIssues === 0) {
    console.log('✅ All links valid.');
  } else {
    console.log(`❌ ${totalIssues} broken link(s) found.`);
    process.exit(1);
  }
}

main();
