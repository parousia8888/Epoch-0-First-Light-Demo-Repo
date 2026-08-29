# 把 Epoch 0 接进你的 AI · 完整教程

> First Light Vol.1 现场版 · 2026.08.30 · epoch0.tokyo

## 一、这是什么,和你见过的社群基建有什么不一样

Epoch 0 不是"一个社群 + 一个 bot"。**社区本身是一台 MCP 服务器**——你把它接进自己已经在用的 Claude Code / Cursor / ChatGPT,你的 AI 就长出了"社区手脚":发作品、补资料、找人、报名活动、拉 workshop 项目,全部说话完成,不用回网页填表。

和其他 AI 社群基础设施的区别,四条:

1. **AI 是一等公民接口,不是外挂 bot。** 一般社群的形态是 Discord 聊天 + Luma 报名 + 网页表单发作品,人肉在三个平台之间搬运;这里是把整个会员操作面暴露给**你自己的** agent——它认识你、替你干活,不是官方机器人在群里刷屏。
2. **AI 永远不能替你公开任何东西。** 发作品只建草稿,公开必须你本人回网页点;建活动同样只出草稿。这条线是硬的:令牌泄露、agent 抽风,最坏结果也只是多几份没人看见的草稿。别的平台的 bot 一发帖就是公开的。
3. **三语原生。** 发一次作品,你的 AI 顺手产出中/日/英三个版本——在日本的社区,一条内容三个语种的读者同时看得到。指望作者事后自己补译文,现实里等于永远不会发生。
4. **活动和代码仓库是打通的。** "参加 workshop"不再是"扫码看 PPT",而是对你的 AI 说一句话,它替你把活动项目 clone 好、环境配好——这个功能(`get_event_kit`)今天现场首发。

## 二、接入(5 分钟)

**前提**:在 epoch0.tokyo 注册,资料完整度 ≥ 40 分(不够的话,接上之后让 AI 调 `update_profile` 帮你补,它可以直接从你的 GitHub 读)。

**第 1 步 · 拿令牌**:登录 epoch0.tokyo → 会员后台 → 生成令牌。**一次性显示,离开页面就看不到了**,当场存好。

**第 2 步 · 接进你的客户端**:

Claude Code 一条命令:

```bash
claude mcp add --transport http epoch-0 https://epoch0.tokyo/mcp --header "Authorization: Bearer e0p_你的令牌"
```

Cursor / 其他支持 MCP 的客户端,配置文件里加:

```json
{
  "mcpServers": {
    "epoch-0": {
      "type": "http",
      "url": "https://epoch0.tokyo/mcp",
      "headers": { "Authorization": "Bearer e0p_你的令牌" }
    }
  }
}
```

**第 3 步 · 验证**:对你的 AI 说「调一下 epoch0 的 whoami」。它会报出你的身份、资料完整度、本周发布额度——通了。

## 三、全部 12 个功能一览

| 工具 | 干什么 | 读/写 |
|---|---|---|
| `whoami` | 你的身份、资料完整度、本周发布额度。写操作前先调 | 读 |
| `update_profile` | 补会员资料,可从你的 GitHub/简历直接读出来填 | 写(仅自己) |
| `list_my_works` | 列出你发过的作品(含草稿),防重复建 | 读 |
| `publish_work` | 发作品——**只建草稿**,三语介绍 AI 顺手写好,公开你自己点 | 写(草稿) |
| `update_work` | 给已上线作品发"这一版改了什么",不占额度 | 写(待审) |
| `search_members` | 按技能/角色/状态找人:「谁在招 Rust」「谁在融资」 | 读 |
| `list_needs` | 社群需求与供给板:谁在找人、找活、找资源 | 读 |
| `list_events` | 近期活动列表,带 🎒 的有 workshop 带走包 | 读 |
| `get_event_kit` | **今天首发**:拿活动的带走包,AI 直接替你装好项目 | 读 |
| `register_event` | 替你报名活动,满员自动候补 | 写 |
| `create_event` | 建活动草稿(需管理员签发的特权令牌) | 写(草稿) |
| `daily_digest` | 每早 7 点(JST)的 AI 日报,含日本本地政策产业动态 | 读 |

## 四、今天现场怎么用(重点)

**进场 · 一句话装项目**

组好队、打开笔记本,对你的 AI 说:

> 我在参加 Epoch 0 的活动,帮我把 workshop 的项目装起来

它会自己查到 First Light Vol.1 → 拿到带走包 → clone 仓库 → 配好环境 → 告诉你从哪个 URL 开始玩。仓库里有 CLAUDE.md,你的 AI 落地就懂全部规矩。没有 API key 也有两个 demo 能直接跑。

**选题 · 三条轨道任选**

1. 做你自己的产品(优先级最高,一直是)
2. 做你自己的 idea
3. 认领 demo 包里的一个"坑"——10 个半成品 demo,每个都有画出来但锁着的功能(不敢亮的按钮、拨不动的开关)。解锁一个坑、把它做成真的,就是一个 2 小时刚好的任务。先在菜单站把 10 个都玩一遍再挑:**https://epoch0-first-light.vercel.app**

**过程中 · 顺手可用**

- 缺队友:「用 epoch0 找一下会 Next.js 的人」(`search_members`)
- 找选题灵感:「拉今天的日报」(`daily_digest`)
- 看看社群缺什么:「现在有什么需求挂着」(`list_needs`)

**散场 · 一句话发作品**

> 把今天做的这个发到 Epoch 0

`publish_work` 建草稿、三语介绍自动写好,你回网页补张截图、点发布——今晚的榜单等你。**This Epoch's Top Ships.**

## 五、FAQ

- **令牌会不会不安全?** 令牌只能做上表里的事,且一切公开动作都停在草稿;泄露了去后台撤销即可。给 AI 的权限边界是服务端硬保证的,不靠客户端自觉。
- **投稿被拒说资料不够?** 完整度要 ≥40。对 AI 说「帮我把 epoch0 资料补一下」,让它调 `update_profile`。
- **我没装 Claude Code / 不写代码?** 带手机就行:扫码玩 demo 菜单站,和队友一起拆坑——坑本来就是产品题,不是代码题。

---

Epoch 0 · First Light Vol.1 · epoch0.tokyo — we're still at epoch zero.
