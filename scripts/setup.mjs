// ============================================================
// scripts/setup.mjs — 一键初始化(pnpm setup)
// 零依赖纯 Node 脚本:生成 .env.local 并告诉你下一步。
// 对着终端复制粘贴恐惧症患者友好。
// ============================================================
import fs from "node:fs";

const ENV = ".env.local";

if (fs.existsSync(ENV)) {
  console.log(`✅ ${ENV} 已存在,没有动它。`);
} else {
  fs.copyFileSync(".env.example", ENV);
  console.log(`✅ 已生成 ${ENV}`);
}

const env = fs.readFileSync(ENV, "utf8");
const keyFilled = /^LLM_API_KEY=.+/m.test(env);

console.log(`
┌─────────────────────────────────────────────┐
│  Epoch 0 · First Light demo pack            │
└─────────────────────────────────────────────┘

下一步:
${keyFilled ? "  ✅ API key 已填过了" : `  1. 打开 ${ENV},填两行:
     LLM_BASE_URL=你的 OpenAI-compatible 服务地址(到 /v1 一级)
     LLM_API_KEY=对应的密钥`}
  2. 运行:pnpm dev
  3. 打开:http://localhost:3000

小抄:
  · 没有 API key?/d/eiju 和 /d/roulette 是纯前端,直接就能玩
  · 出问题先看 http://localhost:3000/status(健康自检)
  · 想改什么看 docs/HOW-TO-TWEAK.md,或者直接问你的 AI 助手(它会读 CLAUDE.md)
`);
