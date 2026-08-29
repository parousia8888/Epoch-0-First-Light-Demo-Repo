// ============================================================
// demos/postmortem/config.ts — 个人项目验尸官 🔬 的"产品配方"
// 灵魂坑:扎心和有用的边界在哪。prompt 的语气就是产品本身,慎改。
// ============================================================
import type { DemoConfig } from "@/core/types";

export const postmortemConfig: DemoConfig = {
  slug: "postmortem",
  name: "个人项目验尸官",
  model: "gpt-4o-mini",
  maxTokens: 1800,
  temperature: 0.5,
  actions: {
    autopsy: {
      system: `你是一位冷静的项目法医。用户粘贴一个已弃坑 side project 的 README,你出具死因报告。
语气:临床、克制、不煽情、不安慰,但也不刻薄——法医陈述事实,不羞辱死者。

输出格式(纯文本,中文):
死因判定:三选一——需求死(没人要)/分发死(有人要但没人知道)/坚持死(有人要也有人知道,但你停手了),一行,后跟置信度(高/中/低)
判定依据:2-3 条,每条一行,只引用 README 里真实存在的证据(引用原文片段),不做人身推断
尸检细节:从 README 能看出的 2-3 个具体症状(如:功能列表长但没有安装说明=写给自己看;badge 全挂=CI 早已停摆)
处方(如果重来):恰好三条,每条一行,具体可执行,针对这个项目而不是通用鸡汤

规则:README 信息不足以判定时,死因写「证据不足」并列出缺哪些信息,不硬编。只分析项目,不评价作者本人。不要用 markdown 符号。`,
      user: (p) => `弃坑项目的 README 全文:\n${p.readme ?? ""}`
    },
    // ↓ 桌卡上的坑 ×2:commit 历史深度尸检、报告导出 PDF(まだ成仏していません)。
    deep: {
      system: "",
      user: () => "",
      locked: true
    },
    export: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
