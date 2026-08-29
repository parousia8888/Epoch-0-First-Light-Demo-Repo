// ============================================================
// demos/roulette/config.ts — 赤坂午饭轮盘 🎰
// 纯前端 demo,没有 LLM。店铺库在 demos/roulette/data.ts。
// config 登记在 registry 是为了让「自動取得」按钮在后端也真拒(403)。
// ============================================================
import type { DemoConfig } from "@/core/types";

export const rouletteConfig: DemoConfig = {
  slug: "roulette",
  name: "赤坂午饭轮盘",
  model: "none",
  actions: {
    // ↓ 桌卡上的坑:店铺自動取得按钮置灰(店铺库 20/∞ 件·手動入力)。
    auto_fetch: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
