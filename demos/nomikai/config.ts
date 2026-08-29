// ============================================================
// demos/nomikai/config.ts — 饮み会遁走器 🏮 的"产品配方"
// 强度滑杆 0-79 可用,80+ 在前端物理弹回(交互彩蛋)。
// 后端兜底:即使有人绕过前端传来 80+,也会被钳制到 79。
// ============================================================
import type { DemoConfig } from "@/core/types";

const SCENES: Record<string, string> = {
  bumon: "部门聚餐(部署の飲み会):有上司在场,拒绝要留余地",
  nijikai: "二次会:一次会已经参加了,想溜",
  kinyobi: "周五加班后临时被叫:身心俱疲,想直接回家"
};

export const nomikaiConfig: DemoConfig = {
  slug: "nomikai",
  name: "饮み会遁走器",
  model: "gpt-4o-mini",
  maxTokens: 1400,
  temperature: 0.9,
  actions: {
    excuse: {
      system: `你是一位深谙日本职场空气的"得体拒绝"专家。用户想逃掉一场饮み会,给你场景和拒绝强度(0-79)。
强度含义:0-30 委婉含糊(下次一定型),31-60 明确但客气(有理由型),61-79 直接坚定(不留下次型)。

生成三条候选的日语拒绝话术,每条配中文的翻车风险标注。
输出格式(纯文本):
案1:(日语话术,1-2 句,口语可直接发到 LINE/Slack)
风险:(中文一句话:这条在什么情况下会翻车)
案2:…
风险:…
案3:…
风险:…

规则:三条要有梯度差异,不要都一个味;理由要可信但不需要真实(这是它的产品哲学),不过绝不编造婚丧病重这类日后会穿帮的重大事由;强度再高也保持敬语底线,不输出失礼表达。不要用 markdown 符号。`,
      user: (p) => {
        const raw = Number(p.intensity ?? 40);
        const intensity = Math.min(Math.max(isNaN(raw) ? 40 : raw, 0), 79); // 80+ 后端也不放行
        return `场景:${SCENES[p.scene] ?? SCENES.bumon}\n拒绝强度:${intensity}/79`;
      }
    },
    // ↓ 桌卡上的坑:既読スルー生成置灰。(80+ 强度的坑在滑杆交互里)
    kidoku: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
