// ============================================================
// app/api/status/route.ts — 健康自检端点(/status 页面的数据源)
// 检查:环境变量是否配置、中转站是否真的连得通(发一个 1 token 的
// 真实请求)、EVENT_MODE、每个 demo 的模型。
// 不返回任何机密:key 只报告"已配置/未配置"。
// ============================================================
import { NextResponse } from "next/server";
import { registry } from "@/core/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (process.env.LLM_BASE_URL ?? "").replace(/\/$/, "");
  const key = process.env.LLM_API_KEY ?? "";
  const override = process.env.LLM_MODEL_OVERRIDE || null;

  // 找一个非 vision 的 LLM demo 的模型来做连通性探测
  const probeModel =
    override ??
    Object.values(registry).find((d) => d.model !== "none" && !d.vision)?.model ??
    "gpt-4o-mini";

  let relay: { ok: boolean; ms: number | null; detail: string } = {
    ok: false,
    ms: null,
    detail: "未测试"
  };

  if (!base || !key) {
    relay.detail = "LLM_BASE_URL 或 LLM_API_KEY 未配置";
  } else {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const t0 = Date.now();
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: probeModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1
        }),
        signal: controller.signal
      });
      relay = {
        ok: res.ok,
        ms: Date.now() - t0,
        detail: res.ok ? `连通正常(${probeModel})` : `中转站返回 HTTP ${res.status}`
      };
    } catch {
      relay = { ok: false, ms: Date.now() - t0, detail: "连不上或超时(8s)" };
    } finally {
      clearTimeout(timer);
    }
  }

  return NextResponse.json({
    env: {
      baseUrl: Boolean(base),
      apiKey: Boolean(key),
      eventMode: process.env.EVENT_MODE === "true",
      modelOverride: override
    },
    relay,
    demos: Object.values(registry).map((d) => ({
      slug: d.slug,
      model: d.model === "none" ? "无 LLM(纯前端)" : override ?? d.model,
      vision: Boolean(d.vision),
      lockedActions: Object.entries(d.actions)
        .filter(([, a]) => a.locked)
        .map(([name]) => name)
    })),
    checkedAt: new Date().toISOString()
  });
}
