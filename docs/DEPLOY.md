# 部署

## 部署目标

- **生产 URL**：<https://gongshangzheng.github.io/lifeOS/>
- **平台**：GitHub Pages
- **触发**：push 到 `main` 分支，或手动触发 `workflow_dispatch`
- **实际产物目录**：`apps/web/dist/`

## 流程

```
push main
  ↓
.github/workflows/ci.yml       跑 lint + typecheck + build
  ↓
.github/workflows/deploy.yml   构建并发布到 gh-pages 分支
  ↓
GitHub Pages 静态托管
```

## 首次启用 GitHub Pages

仓库 settings 里要：

1. **Settings → Pages**
2. **Source**：选 "GitHub Actions"（不是 "Deploy from a branch"）
3. 第一次 deploy workflow 跑完后会自动生成

## 自定义域名（可选）

如果要绑 `life.zack` 之类的域名：

1. 在 `apps/web/public/` 加 `CNAME` 文件，内容是域名
2. DNS 加 CNAME 记录指向 `gongshangzheng.github.io.`
3. 仓库 Settings → Pages → Custom domain 填上

## base path 注意事项

所有 `vite.config.ts` 的 `base` 必须等于 `'/lifeOS/'`，否则资源 404。

**测试方法**：
```bash
pnpm build
pnpm --filter @lifeos/web preview
# 访问 http://localhost:4173/lifeOS/
```

## Rollback

```bash
# 触发上一次成功的 deploy
gh workflow run deploy.yml

# 或者强制重新跑
gh workflow run deploy.yml --ref <commit-sha>
```

## 故障排查

| 现象 | 排查 |
|---|---|
| 404 资源 | 检查 `vite.config.ts` 的 `base` |
| Velite 报错 | 跑 `pnpm content:build` 看具体错误 |
| 部署失败 | 看 Actions 日志的 `Deploy` 步骤 |
| 页面空白 | 看 console 是否有 JS 错误；可能是 base path 不对 |

## 本地预览

```bash
pnpm install
pnpm dev          # http://localhost:5173/lifeOS/

# 验证 build 产物
pnpm build
pnpm preview      # http://localhost:4173/lifeOS/
```
