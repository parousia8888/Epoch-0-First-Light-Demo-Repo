// ============================================================
// app/status/page.tsx — 现场健康自检页(host 专用,不在首页索引里)
// 开场前打开看一眼:全绿 = 放心开场。
// 每 30 秒自动刷新;「再チェック」手动重测。
// ============================================================
"use client";

import { useCallback, useEffect, useState } from "react";

interface Status {
  env: { baseUrl: boolean; apiKey: boolean; eventMode: boolean; modelOverride: string | null };
  relay: { ok: boolean; ms: number | null; detail: string };
  demos: { slug: string; model: string; vision: boolean; lockedActions: string[] }[];
  checkedAt: string;
}

function Light({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-800">
      <span className={`mt-0.5 w-3 h-3 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-red-500 animate-pulse"}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {detail && <p className="text-xs opacity-60 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      setStatus(await res.json());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [check]);

  const allGreen =
    status && status.env.baseUrl && status.env.apiKey && status.env.eventMode && status.relay.ok;

  return (
    <main className="max-w-md mx-auto px-5 pt-12 pb-8">
      <p className="text-[10px] tracking-[0.4em] uppercase opacity-50 mb-2">Host Console</p>
      <h1 className="text-2xl font-bold mb-1">现场自检 · Status</h1>
      <p className="text-sm opacity-60 mb-6">
        {allGreen ? "✅ 全绿,放心开场" : status ? "⚠️ 有红灯,处理方法见 docs/HOW-TO-TWEAK.md" : "检测中…"}
      </p>

      {status && (
        <>
          <Light ok={status.env.baseUrl} label="LLM_BASE_URL 已配置" detail={status.env.baseUrl ? undefined : ".env.local / Vercel 环境变量里填上中转站地址"} />
          <Light ok={status.env.apiKey} label="LLM_API_KEY 已配置" detail={status.env.apiKey ? "(内容不在此显示)" : "同上,填好后重启/重新部署"} />
          <Light ok={status.relay.ok} label="中转站连通性(真实请求)" detail={`${status.relay.detail}${status.relay.ms !== null ? ` · ${status.relay.ms}ms` : ""}`} />
          <Light ok={status.env.eventMode} label="EVENT_MODE 开启(拍照类 demo 可用)" detail={status.env.eventMode ? undefined : "EVENT_MODE=true 才能用 yakusho / gomi"} />
          {status.env.modelOverride && (
            <Light ok label={`全场模型覆盖生效:${status.env.modelOverride}`} detail="LLM_MODEL_OVERRIDE 环境变量,清空即恢复各 demo 自己的模型" />
          )}

          <h2 className="text-xs tracking-widest uppercase opacity-50 mt-8 mb-2">10 个 demo</h2>
          <table className="w-full text-xs">
            <tbody>
              {status.demos.map((d) => (
                <tr key={d.slug} className="border-b border-neutral-800/60">
                  <td className="py-2 pr-2 font-medium">
                    /d/{d.slug}
                    {d.vision && <span className="ml-1 opacity-60">📷</span>}
                  </td>
                  <td className="py-2 pr-2 opacity-70">{d.model}</td>
                  <td className="py-2 text-right opacity-50">🔒 ×{d.lockedActions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] opacity-40 mt-3">上次检测:{new Date(status.checkedAt).toLocaleTimeString()} · 每 30 秒自动刷新</p>
        </>
      )}

      <button
        onClick={check}
        disabled={loading}
        className="mt-6 w-full py-3 rounded-lg border border-neutral-700 text-sm active:opacity-60 disabled:opacity-40"
      >
        {loading ? "検査中…" : "再チェック"}
      </button>
    </main>
  );
}
