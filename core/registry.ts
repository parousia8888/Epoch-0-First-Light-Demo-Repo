// ============================================================
// core/registry.ts — 10 个 demo 的花名册
// 后端(/api/generate)只认这里登记过的 demo 和 action。
// 用 pnpm new-demo 新建 demo 后,记得来这里加两行(import + 登记)。
// ============================================================
import type { DemoConfig } from "./types";
import { keigoConfig } from "@/demos/keigo/config";
import { yakushoConfig } from "@/demos/yakusho/config";
import { eijuConfig } from "@/demos/eiju/config";
import { chintaiConfig } from "@/demos/chintai/config";
import { gomiConfig } from "@/demos/gomi/config";
import { taishokuConfig } from "@/demos/taishoku/config";
import { nomikaiConfig } from "@/demos/nomikai/config";
import { postmortemConfig } from "@/demos/postmortem/config";
import { johoConfig } from "@/demos/joho/config";
import { rouletteConfig } from "@/demos/roulette/config";

export const registry: Record<string, DemoConfig> = {
  keigo: keigoConfig,
  yakusho: yakushoConfig,
  eiju: eijuConfig,
  chintai: chintaiConfig,
  gomi: gomiConfig,
  taishoku: taishokuConfig,
  nomikai: nomikaiConfig,
  postmortem: postmortemConfig,
  joho: johoConfig,
  roulette: rouletteConfig
};
