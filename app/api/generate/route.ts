// ============================================================
// app/api/generate/route.ts — 全项目唯一的 API 端点
// 职责:限流(20次/分钟/IP)→ 校验 demo/action → 锁定动作真拒(403)
//       → EVENT_MODE 关闭时 vision 类返回 503 → 调 core/llm.ts
// 页面永远不直连中转站,密钥只活在服务端。
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/core/registry";
import { generate } from "@/core/llm";

// 内存限流:重启即清零,活动场景够用(无数据库是纪律)
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT = 20;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { demo?: string; action?: string; payload?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const demo = body.demo ? registry[body.demo] : undefined;
  const act = demo && body.action ? demo.actions[body.action] : undefined;
  if (!demo || !act) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // 置灰的坑是真的:锁定动作后端直接拒,绕过前端也没用
  if (act.locked) {
    return NextResponse.json({ ok: false, error: "locked" }, { status: 403 });
  }

  // 活动模式关闭时,拍照类 demo 停用(省钱 + 防滥用)
  if (demo.vision && process.env.EVENT_MODE !== "true") {
    return NextResponse.json({ ok: false, error: "event_mode_off" }, { status: 503 });
  }

  const result = await generate(demo.slug, body.action!, body.payload ?? {});
  if (result.ok) return NextResponse.json(result);

  const status =
    result.error === "rate_limited" ? 429 :
    result.error === "quota" ? 402 :
    result.error === "bad_request" ? 400 : 502;
  return NextResponse.json(result, { status });
}
