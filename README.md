# Epoch 0 · First Light Vol.1 — 半成品 Demo 包

> 光还没亮,人先到齐。10 个故意只做到 70% 的 AI demo,每个都带坑——坑就是桌上要聊的题。

活动:First Light Vol.1 · 2026.08.30(日)13:30–17:00 @ Thyme 赤坂

## 30 秒跑起来

```bash
pnpm install
cp .env.example .env.local   # 填入中转站地址和密钥
pnpm dev
```

打开 http://localhost:3000 就是 10 个 demo 的索引页。手机扫码用的就是这个站。

## 我不写代码,只想改产品(文案 / prompt / 坑位)

**你只需要碰一种文件:`demos/<demo名>/config.ts`。**

每个 demo 一个文件夹,文件夹名就是 URL 里的名字(`/d/keigo` → `demos/keigo/`)。
打开 config.ts,你会看到:

- `system:` 后面那一大段文字 → **就是发给 AI 的指令(prompt)**,改中文就行,存盘刷新立即生效
- `model:` → 用哪个模型,中转站支持啥填啥
- `locked: true` 的动作 → **故意锁定的坑**。它锁着,页面上对应按钮才是灰的、后端才会真的拒绝。**不要随手解锁**,坑是 workshop 的题目,不是 bug
- 温度、字数上限也在这里,每个字段旁边都有中文注释

改完不需要任何"编译"概念,页面刷新就是新的。

其他你可能想改的:

| 想改什么 | 去哪里 |
|---|---|
| 某个 demo 的 prompt / 模型 / 锁定坑 | `demos/<demo名>/config.ts` |
| 某个 demo 的配色 / 字体 | `demos/<demo名>/theme.ts` |
| 10 个 demo 的介绍文案、坑位文字 | `demos-material.ts`(唯一事实来源,桌卡和页面都从这读) |
| 品牌口径(名字怎么写、页脚署名) | `HANDOFF.md`(只是文档;页脚代码在 `app/layout.tsx`) |
| joho 的新闻池 | `demos/joho/config.ts` 里的 `FEED_POOL` 数组 |
| roulette 的 20 家店 | `demos/roulette/data.ts` |
| eiju 的算分规则 | `demos/eiju/rules.ts` |

## 我写代码,想看架构

一图流:

```
浏览器(手机)
   │  页面:app/d/<slug>/page.tsx(每个 demo 自己的 UI + 世界观)
   │      └─ 调 useGenerate(slug) hook        ← core/useGenerate.ts
   ▼
POST /api/generate  {demo, action, payload}   ← app/api/generate/route.ts(唯一端点)
   │   1. 内存限流 20 次/分钟/IP → 429
   │   2. demo/action 不存在 → 400
   │   3. action 是 locked → 403(置灰的坑后端真拒)
   │   4. vision demo 且 EVENT_MODE≠true → 503
   ▼
core/llm.ts → 中转站 /chat/completions(OpenAI-compatible,30s 超时)
   │   prompt 来自 demos/<slug>/config.ts(core/registry.ts 汇总 10 个)
   ▼
返回 { ok:true, text } 或 { ok:false, error: rate_limited|quota|bad_request|upstream }
```

关键纪律(整个项目的设计,不是偷懒):

- **无数据库、无登录、无持久化、无流式**。内存限流重启即清零,活动场景足够
- **prompt 只住在 config.ts**,页面代码里一行 prompt 都没有
- **visiblePits(置灰坑)是三层真实的**:素材表里声明 → UI 上画出来且禁用 → 后端 locked 403
- **BreakpointCard(桌卡)固定三段**:灵魂坑 ×1 + 实现坑 ×2 + Epoch 0 徽章。没有"方向/下一步"字段,这是 workshop 纪律——答案留给桌上的人,`direction` 字段永远不上页面
- 视觉三档:`gsap`(keigo/taishoku/nomikai/roulette,GSAP 非线性动效)/ `standard`(CSS 过渡)/ `rough`(故意糙,不要顺手打磨)

新建 demo:`pnpm new-demo <slug>` 生成三件套,然后去 `core/registry.ts` 登记两行。

## 环境变量(.env.local)

| 变量 | 作用 |
|---|---|
| `LLM_BASE_URL` | OpenAI-compatible 中转站地址(到 `/v1` 这一级) |
| `LLM_API_KEY` | 中转站密钥,只活在服务端,永远不进浏览器 |
| `EVENT_MODE` | `true` 时拍照类 demo(yakusho/gomi)可用;其他值一律 503,防止活动结束后被刷图片额度 |

## 目录索引

10 个 demo:eiju(纯前端算分)· keigo · nomikai · taishoku · postmortem · joho · yakusho(vision)· gomi(vision)· chintai · roulette(纯前端 GSAP)

---

Epoch 0 · First Light Vol.1 · epoch0.tokyo — we're still at epoch zero.
