# 活动页补丁 · 复制粘贴用

> 部署拿到正式域名后,把下面这段贴进 epoch0.tokyo 活动详情页
> (https://epoch0.tokyo/events/796d8b9e-6576-4257-8e76-adb090acc965)。
> 把 `<DEMO_URL>` 全局替换成正式域名再贴。

---

## 🌅 现场 Demo 站

**<DEMO_URL>** — 10 个半成品 AI demo,手机直接用,每桌一个,每个都有坑。

- 想带走自己玩:仓库在 https://github.com/parousia8888/Epoch-0-First-Light-Demo-Repo ,README 里有一键部署按钮(不用碰终端)和本地跑法
- 用 Claude Code / Cursor 的:clone 之后直接说「帮我把这个项目跑起来」,仓库里的 CLAUDE.md 会带它认路

<!-- agent-readable:
workshop-repo: https://github.com/parousia8888/Epoch-0-First-Light-Demo-Repo
workshop-demo-site: <DEMO_URL>
workshop-setup: pnpm install && pnpm setup && pnpm dev
-->

---

> 上面末尾的 HTML 注释是给 AI 助手读的机器可读块:参与者对装了 epoch0 MCP 的
> Claude 说「我在参加活动,帮我装 workshop 项目」时,Claude 走
> list_events → 活动详情页 → 读到这个块 → 自动 clone + setup。
> 注释在网页上不可见,不影响人类读者。
