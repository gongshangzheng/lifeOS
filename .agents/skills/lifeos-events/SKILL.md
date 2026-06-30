# lifeOS Events Skill

管理 lifeOS 日历事件系统的 Skill。所有事件数据存储在 `apps/web/public/events.json`，不再从日报 markdown 中提取。

## 数据源

**文件**: `apps/web/public/events.json`

```json
{
  "events": [
    {
      "id": "evt-20260701-0900-dsp",
      "title": "复习数字信号处理",
      "date": "2026-07-01",
      "startTime": "09:00",
      "endTime": "19:00",
      "location": "工位",
      "category": "study",
      "description": "数字信号处理复习（含午休）"
    }
  ],
  "recurring": [
    {
      "id": "recur-run-daily",
      "title": "跑步 6km",
      "pattern": "daily",
      "startTime": "06:30",
      "endTime": "07:15",
      "location": "",
      "category": "health",
      "description": "每日跑步 6 千米",
      "activeFrom": "2026-06-01",
      "activeUntil": null,
      "excludeDates": []
    }
  ],
  "categories": {
    "study": { "label": "学习", "color": "#3b82f6" },
    "health": { "label": "健康", "color": "#22c55e" },
    "work": { "label": "工作", "color": "#f59e0b" },
    "social": { "label": "社交", "color": "#ec4899" },
    "life": { "label": "生活", "color": "#8b5cf6" },
    "other": { "label": "其他", "color": "#6b7280" }
  }
}
```

### 字段说明

**events[]** — 具体事件（单次）
- `id`: 唯一标识，格式 `evt-{date}-{hash}` 或自动生成
- `title`: 事件标题（必填）
- `date`: 日期 `YYYY-MM-DD`（必填）
- `startTime`: 开始时间 `HH:MM`（可选，无则为全天事件）
- `endTime`: 结束时间 `HH:MM`（可选）
- `location`: 地点（可选）
- `category`: 分类，见 categories（可选，默认 other）
- `description`: 备注（可选）
- `_recurringId`: 如果由周期任务展开生成，记录来源周期任务 ID（可选）

**recurring[]** — 周期任务模板
- `id`: 唯一标识，格式 `recur-{name}`
- `title`: 事件标题
- `pattern`: 周期模式 — `daily`（每天）/ `weekly`（每周同一天）/ `every-N-days`（每 N 天）
- `every`: 当 pattern 为 `every-N-days` 时的 N 值
- `startTime` / `endTime`: 时间
- `activeFrom`: 生效起始日期
- `activeUntil`: 生效结束日期（null 表示无限期）
- `excludeDates`: 排除日期数组（如节假日跳过）

## CLI 脚本

**路径**: `scripts/events.mjs`
**运行**: `node scripts/events.mjs <command> [options]`

### 命令一览

| 命令 | 说明 | 示例 |
|------|------|------|
| `list` | 列出事件 | `node scripts/events.mjs list --from 2026-07-01 --to 2026-07-07 --category study` |
| `add` | 添加单个事件 | `node scripts/events.mjs add --title "复习DSP" --date 2026-07-01 --start 09:00 --end 19:00 --location 工位 --category study` |
| `add-recurring` | 添加周期任务 | `node scripts/events.mjs add-recurring --title "跑步6km" --pattern daily --start 06:30 --end 07:15 --category health` |
| `update` | 更新事件 | `node scripts/events.mjs update --id evt-xxx --title "新标题" --date 2026-07-02` |
| `delete` | 删除事件或周期任务 | `node scripts/events.mjs delete --id evt-xxx` |
| `expand` | 展开周期任务为具体事件 | `node scripts/events.mjs expand --from 2026-07-01 --to 2026-07-31` |
| `batch-add` | 从 JSON 文件批量添加 | `node scripts/events.mjs batch-add --file events-batch.json` |

### expand 命令详解

周期任务（recurring）只是模板，不会自动出现在日历上。需要定期运行 `expand` 将模板展开为具体事件：

```bash
# 展开未来 30 天的周期任务（默认）
node scripts/events.mjs expand

# 展开指定范围
node scripts/events.mjs expand --from 2026-07-01 --to 2026-07-31

# 预览不写入
node scripts/events.mjs expand --dry-run
```

expand 会跳过已存在的事件（通过 ID 去重），所以可以安全地重复运行。

## Agent 使用指南

### 当用户说"帮我安排 xxx"时

1. **解析需求**：提取标题、日期、时间、地点、分类
2. **调用 CLI 添加**：
   ```bash
   node scripts/events.mjs add --title "复习数字信号处理" --date 2026-07-01 --start 09:00 --end 19:00 --location 工位 --category study
   ```
3. **确认**：告诉用户已添加到日历

### 当用户说"每天 xxx"或"每 N 天 xxx"时

1. 使用 `add-recurring`：
   ```bash
   node scripts/events.mjs add-recurring --title "健身房" --pattern every-N-days --every 3 --start 18:00 --end 19:30 --location 健身房 --category health
   ```
2. 然后运行 `expand` 生成近期具体事件：
   ```bash
   node scripts/events.mjs expand --from 2026-07-01 --to 2026-07-31
   ```

### 当用户说"查看某天的事件"时

```bash
node scripts/events.mjs list --from 2026-07-01 --to 2026-07-01
```

### 当用户说"修改/取消/删除 xxx"时

1. 先用 `list` 找到事件 ID
2. 再用 `update` 或 `delete`

### 批量添加场景

当用户一次性给出多个事件（如一周的学习计划），创建一个临时 JSON 文件：

```json
[
  { "title": "复习DSP", "date": "2026-07-01", "startTime": "09:00", "endTime": "19:00", "location": "工位", "category": "study" },
  { "title": "刷题", "date": "2026-07-01", "startTime": "19:00", "endTime": "22:00", "location": "工位", "category": "study" },
  { "title": "复习DSP", "date": "2026-07-02", "startTime": "09:00", "endTime": "19:00", "location": "工位", "category": "study" }
]
```

然后：
```bash
node scripts/events.mjs batch-add --file /tmp/events-batch.json
```

### 健康硬约束

Zack 的健康日程是硬约束，在安排其他事件时应注意：
- 每天跑步 6km（约 06:30-07:15）
- 每 2-3 天健身房
- 吃轻食

如果用户安排的时间与运动冲突，应主动提醒。

## 前端展示

### Calendar 页面
- 从 `/lifeOS/events.json` fetch 数据
- 按 category 显示不同颜色的事件标签
- 点击事件弹出详情 modal
- 顶部显示"今日事件"卡片

### 日报详情页（待实现）
- 在日报正文顶部自动展示当日事件列表
- 数据来源同样是 events.json，按 date 过滤

## 注意事项

1. **不要手动编辑 events.json** — 使用 CLI 脚本，保证 ID 唯一性和格式正确
2. **expand 后需要重新 build** — events.json 在 public/ 目录下，Vite 会直接复制到 dist/，所以 expand 后无需 rebuild，但 push 后 GitHub Actions 会自动部署
3. **周期任务不会自动出现在日历** — 必须定期运行 expand
4. **ID 格式约定**：单次事件 `evt-{timestamp}-{hash}`，周期任务 `recur-{name}`，展开事件 `evt-{date}-{recurringId}`
