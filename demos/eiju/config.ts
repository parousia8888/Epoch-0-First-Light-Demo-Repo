// ============================================================
// demos/eiju/config.ts — 永住点数计算器 🧮
// 这个 demo 没有 LLM:算分逻辑全部在前端(demos/eiju/rules.ts)。
// config 仍然登记在 registry 里,是为了让"生成证明材料清单"这个
// 置灰按钮在后端也真的被拒绝(403)——坑是真的,不是演的。
// ============================================================
import type { DemoConfig } from "@/core/types";

export const eijuConfig: DemoConfig = {
  slug: "eiju",
  name: "永住点数计算器",
  model: "none",
  actions: {
    // ↓ 桌卡上的坑:证明材料清单按钮置灰。
    evidence_list: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
