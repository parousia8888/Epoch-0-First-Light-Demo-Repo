# 现场救急速查表 · HOW-TO-TWEAK

> 活动当天最可能的临时改动,每条都是「想改 X → 去 Y 改 Z」。
> 改完存盘,页面刷新即生效(Vercel 上则需要 push 触发重新部署)。

## 最高频

| 症状 / 想法 | 怎么办 |
|---|---|
| AI 回答不对味 / 想换语气 | `demos/<demo名>/config.ts` → 改 `system:` 里的中文指令 |
| 换模型(某模型挂了/太慢) | 同上文件 → 改 `model:` 字段,中转站支持的名字都行 |
| 回答被截断 | 同上文件 → `maxTokens` 调大(默认 800) |
| 回答太飘 | 同上文件 → `temperature` 调低(如 0.3) |
| 全场 AI 都报错「额度或密钥」 | `.env.local` 的 `LLM_API_KEY` / `LLM_BASE_URL` 有问题,改完**重启 pnpm dev** |
| 拍照类 demo 全部 503 | `.env.local` 里 `EVENT_MODE=true` 没写对,改完**重启** |
| 有人狂点被限流(429) | `app/api/generate/route.ts` → `LIMIT = 20` 调大;重启后计数清零 |

## 产品向

| 想法 | 怎么办 |
|---|---|
| 改某个 demo 的坑位文字(桌卡上那三条) | `demos-material.ts` → 对应条目的 `soulPit` / `visiblePits`。页面和桌卡都从这读,一处改全场生效 |
| 想临时解锁一个置灰功能 | **先想清楚:坑是题目,不是 bug。** 真要解:`demos/<demo名>/config.ts` 删掉那个 action 的 `locked: true`,再去 `app/d/<demo名>/page.tsx` 把对应按钮的 disabled/pit-locked 去掉。两处都要改 |
| joho 的新闻太旧 | `demos/joho/config.ts` → `FEED_POOL` 数组,按现有格式「日期\|标签\|内容」增删行 |
| roulette 想换店 | `demos/roulette/data.ts` → 20 家店的数组,name/genre/walkMin 三个字段 |
| eiju 算分规则被行政书士挑刺 | `demos/eiju/rules.ts` → 分数表都在里面,注释齐全 |

## 视觉向

| 想法 | 怎么办 |
|---|---|
| 某 demo 配色不对 | `demos/<demo名>/theme.ts` → 颜色都集中在这里 |
| 桌卡(BreakpointCard)在某页看不清 | 同上文件 → `bpVars` 三个变量:`--bp-bg` 底色 / `--bp-fg` 文字 / `--bp-accent` 强调色 |
| 动效太吵 / 想关掉 | `app/d/<demo名>/page.tsx` → 搜 `gsap`,把对应 useEffect 整块注释掉,页面不会崩 |

## 部署向

| 症状 | 怎么办 |
|---|---|
| Vercel 上环境变量 | 项目 Settings → Environment Variables,三个变量同名照填,填完 Redeploy |
| 想在局域网给手机预览 | `pnpm dev` 后用电脑局域网 IP:3000 访问(手机同一 Wi-Fi) |
| build 挂了 | `pnpm build` 看第一条报错;十有八九是某个 page.tsx 的 TS 类型问题,报错会带文件名行号 |

## 三条铁律(动手前默念)

1. `direction` 字段永远不上页面——它是 host 内参
2. BreakpointCard 永远三段,不加"下一步"
3. rough 档的 demo 丑是故意的,不要顺手打磨
