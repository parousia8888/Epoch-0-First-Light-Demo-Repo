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

- 用户没有 API key 时:`/d/eiju`(算分器)和 `/d/roulette`(老虎机)是纯前端,**没有 key 也完整可玩**,先让用户玩这两个
- `/status` 页面能自检环境变量和中转站连通性,排查"为什么不出结果"先看它

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
