# 提案:epoch0 MCP 加一个 workshop 工具

> 这是给 epoch0.tokyo MCP 服务器(另一个代码库)的功能提案,不是本仓库的代码。
> 目标体验:参与者对装了 epoch0 MCP 的 Claude 说「我在参加活动,帮我装 workshop
> 的项目」,Claude 一条链路走完:找到活动 → 找到项目 → 装好环境。

## 现状(2026-08-29 审计)

- `list_events` 只返回活动标题/id/详情页 URL,**没有结构化的项目信息**
- Claude 目前的绕行方案:fetch 活动详情页 → 依赖页面里手工埋的
  `agent-readable` HTML 注释块(见 EVENT-PAGE-SNIPPET.md)——能用,但脆:
  改版页面就断,而且要求每场活动的主办方都记得埋这个块

## 提案:`get_event_kit`

```
get_event_kit({ eventId?: string })
```

- `eventId` 缺省时:取当前时间落在 [startsAt - 24h, endsAt + 7d] 内的活动
  (workshop 项目在活动前一天到散场后一周都是高频安装期)
- 返回:

```json
{
  "event": { "id": "…", "title": "First Light Vol.1", "startsAt": "…" },
  "kit": {
    "repo": "https://github.com/…",
    "demoSite": "https://…",
    "setup": ["git clone <repo>", "pnpm install", "pnpm setup", "pnpm dev"],
    "envNeeded": ["LLM_BASE_URL", "LLM_API_KEY", "EVENT_MODE=true"],
    "noKeyDemos": ["/d/eiju", "/d/roulette"],
    "agentNotes": "仓库根目录有 CLAUDE.md,规矩都在里面"
  }
}
```

- 服务端数据来源:活动表加一个可选 `kit` JSON 字段,管理后台建活动时填;
  没填的活动返回 `kit: null`,Claude 就回退到读详情页
- 权限:纯读,无需特殊令牌

## 为什么值得做

1. 每场 workshop 的"上手摩擦"从口头讲解/贴链接,变成参与者对自己的 Claude 说一句话
2. `setup` 数组是声明式的,Claude 逐条执行并在缺依赖时自己补,**不需要参与者会终端**
3. 散场后一周仍然有效——"回家想起来玩"是转化率最高的时段,现在这个时段全靠翻聊天记录找链接

## 顺手可做的小项

- `list_events` 返回里带上 `startsAt` 的 ISO 字符串(现在的输出是 UTC 字符串,
  agent 要自己猜时区)和报名人数,host 备场时有用
