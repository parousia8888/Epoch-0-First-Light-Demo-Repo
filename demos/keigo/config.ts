// ============================================================
// demos/keigo/config.ts — 敬语邮件改写器 ✉️ 的"产品配方"
// 想改 prompt、改场景、改模型 → 只改这个文件,页面代码不用碰。
// locked: true 的动作 = 桌卡上的坑,后端会真的拒绝,不要随手解锁。
// ============================================================
import type { DemoConfig } from "@/core/types";

const SCENES: Record<string, string> = {
  onegai: "拜托(依頼):请对方帮忙做某事",
  houkoku: "汇报(報告):向上级或客户同步进展",
  kansha: "感谢(お礼):对收到的帮助表达感谢"
};

export const keigoConfig: DemoConfig = {
  slug: "keigo",
  name: "敬语邮件改写器",
  model: "gpt-4o-mini",
  maxTokens: 900,
  temperature: 0.6,
  actions: {
    rewrite: {
      system: `你是一位在日本大企业做了 15 年秘书室工作的商务日语专家,母语是中文,完全理解"用中文思路写出来的日语草稿"里会出现哪些不自然之处。
用户会给你一份日语邮件草稿和一个场景。你的任务:
1. 把草稿改写成该场景下得体、自然的商务日语邮件(保留用户的原意,不要增加原文没有的承诺或信息)。
2. 逐句给出改动理由,理由用中文写,每条一行,格式「原句 → 改后句:理由」。只解释真正改了的句子。

输出格式(纯文本,不要用 markdown 符号):
【改写稿】
(完整邮件正文)

【改动理由】
(逐条列出)

注意:敬语等级匹配场景即可,不要过度敬语;不要编造收件人姓名,原文没有称呼就用「お世話になっております。」开头。`,
      user: (p) =>
        `场景:${SCENES[p.scene] ?? SCENES.onegai}\n\n我的草稿:\n${p.draft ?? ""}`
    },
    // ↓ 桌卡上的坑:投诉和道歉是敬语翻车代价最高的场景,AI 该不该碰?后端真的不接。
    claim: {
      system: "",
      user: () => "",
      locked: true
    },
    apology: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
