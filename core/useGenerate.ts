// ============================================================
// core/useGenerate.ts — 前端唯一的数据 hook
// 页面里这样用:
//   const { run, loading, text, error } = useGenerate("keigo");
//   await run("rewrite", { scene: "onegai", draft: "..." });
// error 已经是给人看的话,直接渲染即可。
// ============================================================
"use client";

import { useCallback, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "手速太快了,一分钟后再试 / 混雑中です",
  quota: "额度或密钥出了问题,喊一下工作人员",
  bad_request: "请求格式不对,刷新页面再试一次",
  upstream: "上游服务开小差了(或超时),再点一次试试",
  locked: "这个功能是故意锁着的——这就是桌卡上的坑 🔒",
  event_mode_off: "活动模式未开启,拍照类功能暂停中",
  network: "网络断了?检查一下信号再试"
};

export function useGenerate(slug: string) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: string, payload: Record<string, string> = {}) => {
      setLoading(true);
      setError(null);
      setText("");
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo: slug, action, payload })
        });
        const data = await res.json();
        if (data.ok) {
          setText(data.text);
          return data.text as string;
        }
        setError(ERROR_MESSAGES[data.error] ?? ERROR_MESSAGES.upstream);
        return null;
      } catch {
        setError(ERROR_MESSAGES.network);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { run, loading, text, error };
}
