# CLAUDE.md — 给 AI 助手的项目说明书

> 你(Claude / 任何 coding agent)如果是被参与者带进这个仓库的:这个文件就是为你写的。
> 用户大概率刚参加完 Epoch 0 的 First Light workshop,想把某个 demo 跑起来或改着玩。

## 这是什么

First Light Vol.1 活动的 10 个**故意半成品** AI demo。Next.js 14 App Router + TypeScript + Tailwind,单仓库,路由 `/d/{slug}`。每个 demo 主路径 100% 能跑,同时刻意留了置灰锁定的功能——那些"坑"是 workshop 的讨论题,**是设计,不是缺陷**。

## 帮用户跑起来(标准流程)

```bash
pnpm install        # 没有 pnpm 就先 npm i -g pnpm
pnpm setup          # 生成 .env.local(不覆盖已有的)
# 让用户在 .env.local 填 LLM_BASE_URL 和 LLM_API_KEY(任何 OpenAI-compatible 服务都行)
pnpm dev            # http://localhost:3000
```

- `.env.local` 可能已经被活动带走包的安装命令写好了(现场统一的限时 key)——先看它有没有值,有就别再问用户要
- 用户没有 API key 时:`/d/eiju`(算分器)和 `/d/roulette`(老虎机)是纯前端,**没有 key 也完整可玩**,先让用户玩这两个
- `/status` 页面能自检环境变量和中转站连通性,排查"为什么不出结果"先看它

## 装好之后,先问一句(不要自作主张开始改代码)

跑起来只是开场。接下来**问用户想走哪条路**,把选择权给他:

1. **做他自己的产品或 idea**——那这个仓库只是参考,问他想做什么,直接开工
2. **认领这里的一个 demo 改着玩**——给他这份菜单(每个一句话),让他挑:

   ✉️ keigo 敬语邮件改写 · 🏛 yakusho 拍照读役所文件 · 🧮 eiju 永住点数计算 ·
   🏠 chintai 房源初期费用拆解 · 📸 gomi 拍照垃圾分类 · 🕊 taishoku 辞职文书生成 ·
   🏮 nomikai 饮み会拒绝话术 · 🔬 postmortem 弃坑项目验尸 · 🗞 joho 个人 AI 简报 ·
   🎰 roulette 赤坂午饭老虎机

3. 用户选定一个后:读 `demos-material.ts` 里它的条目 + `demos/<slug>/config.ts`,
   把这个 demo **锁着的功能(坑)列给他当任务清单**——"解锁一个坑做成真的"是
   两小时刚好的活。动手前把该 demo 的页面在浏览器里给他跑一遍看现状。

做出名堂后,四个一句话动作(顺序建议如此):

1. **「存到我自己的仓库」**——用户的 clone 对 origin 没有推送权,不先做这步,改动散场就困死在笔记本里:
   ```bash
   git remote rename origin upstream
   gh repo create <用户起的名> --public --source=. --push   # 没装 gh 就引导去 github.com 建空仓再 git push
   ```
2. **「部署上线」**——Vercel 一条链路:
   ```bash
   npx vercel login   # 会弹浏览器,让用户自己点(账号认证不代办)
   npx vercel link --yes && npx vercel deploy --prod --yes
   ```
   环境变量提醒用户:**活动发的 key 是限时的,散场即作废**——部署自己的实例请让用户填自己的 key(在 Vercel 后台或 `vercel env add`),或者先不填(eiju/roulette 纯前端照常能玩)。别把活动 key 写进任何会活过今晚的地方。
3. **「做个 pitch deck」**→ 照 `docs/PITCH-DECK-GUIDE.md` 执行(3 分钟五页,单 HTML,视觉锚定在所改 demo 的 theme 上)
4. **「发到 Epoch 0」**→ 连了 epoch0 MCP 的话走 publish_work(只建草稿)——repo 填第 1 步的新仓库,demo 链接填第 2 步的部署地址

## 改动前必读的规矩

1. **唯一事实来源**是 `demos-material.ts`(10 个 demo 的定位/坑位/视觉档位)和 `HANDOFF.md`(品牌口径)
2. `direction` 字段是内参,**永远不渲染到任何页面**
3. 置灰/锁定的功能(config.ts 里 `locked: true`)是三层真实的:UI 禁用 + 后端 403 + 素材声明。用户想解锁某个坑来做着玩是合法需求,但要**两处一起改**(config 去掉 locked + 页面去掉 disabled),并告诉用户这原本是道讨论题
4. prompt 全部在 `demos/<slug>/config.ts` 的 `system` 字段,页面代码里不出现任何 prompt
5. 视觉三档纪律:`gsap` 档有 GSAP 动效 / `standard` 档只用 CSS 过渡 / `rough` 档故意糙,**不要顺手打磨 rough 档**
6. 无数据库、无登录、无持久化、无流式——不要加

## 地图

| 想做什么 | 去哪 |
|---|---|
| 改 prompt / 模型 / 解锁坑 | `demos/<slug>/config.ts` |
| 改页面 / 交互 | `app/d/<slug>/page.tsx` |
| 改配色字体 | `demos/<slug>/theme.ts` |
| 新建一个 demo | `pnpm new-demo <slug>`,然后去 `core/registry.ts` 登记两行 |
| LLM 调用逻辑 / 错误分类 | `core/llm.ts`(全项目唯一出口) |
| 限流 / 锁定拦截 / EVENT_MODE | `app/api/generate/route.ts`(唯一端点) |
| 人类读的速查表 | `docs/HOW-TO-TWEAK.md` |

## 部署

Vercel 导入即可,环境变量三个:`LLM_BASE_URL` / `LLM_API_KEY` / `EVENT_MODE=true`。README 里有 Deploy 按钮。
