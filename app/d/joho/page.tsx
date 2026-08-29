// ============================================================
// app/d/joho/page.tsx — 在日 AI 情报官 🗞(standard 档)
// 8 个固定 tag 选 3(选第 4 个时替换最早选的)→ LLM 从 E0 日报
// 最近 7 天池子里筛出 3 条个人简报,按 ■ 切卡逐条淡入。
// 坑位:カスタムタグ输入框禁用、毎朝プッシュ开关拨不动。
// ============================================================
"use client";

import { useState } from "react";
import { TAGS } from "@/demos/joho/config";
import { theme } from "@/demos/joho/theme";
import { useGenerate } from "@/core/useGenerate";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "joho")!;

/* loading 时逐行打出来的假终端输出 */
const LOADING_LINES = [
  "> fetching E0 feed (last 7 days)…",
  "> matching tags…",
  "> ranking by relevance…",
  "> composing brief…"
];

interface BriefCard {
  title: string;
  body: string[];
}

/** 把 LLM 文本按 ■ 切成三条简报;切不出任何一条时返回 null,调用方原样显示 */
function parseBrief(text: string): BriefCard[] | null {
  if (!text.includes("■")) return null;
  const cards = text
    .split("■")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const lines = seg
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return { title: lines[0] ?? "", body: lines.slice(1) };
    })
    .filter((c) => c.title !== "");
  return cards.length > 0 ? cards : null;
}

export default function Page() {
  const [selected, setSelected] = useState<string[]>([]);
  const { run, loading, text, error } = useGenerate("joho");

  /* 已选 3 个时再点新 tag:替换最早选的那个(FIFO) */
  const toggle = (tag: string) => {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 3) return [...prev.slice(1), tag];
      return [...prev, tag];
    });
  };

  const ready = selected.length === 3;
  const cards = text ? parseBrief(text) : null;

  return (
    <main className={`min-h-dvh px-4 pt-6 pb-8 ${theme.page} ${theme.font}`}>
      <style>{`
        @keyframes joho-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .joho-cursor {
          display: inline-block; width: 0.55em; height: 1em; margin-left: 2px;
          vertical-align: text-bottom; background: currentColor;
          animation: joho-blink 1.1s steps(1) infinite;
        }
        @keyframes joho-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .joho-in { opacity: 0; animation: joho-in 0.5s ease-out forwards; }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* 世界观:假 prompt 行 + 闪烁光标 */}
        <div className="text-[12px] leading-relaxed break-all mb-5" style={{ color: theme.dim }}>
          <span>epoch0@joho:~$ </span>
          <span style={{ color: theme.accent }}>
            brief --tags {selected.length > 0 ? selected.join(",") : "…"}
            {!loading && <span className="joho-cursor" />}
          </span>
        </div>

        <header className="mb-6">
          <h1 className="text-xl font-bold leading-tight">
            {material.emoji} {material.name}
          </h1>
          <p className="text-[11px] mt-1" style={{ color: theme.dim }}>
            E0日報 · 直近7日プール · 8タグから3つ選ぶ
          </p>
        </header>

        {/* tag 8 选 3 */}
        <section className="mb-5">
          <div className="grid grid-cols-2 gap-2">
            {TAGS.map((tag) => {
              const on = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  aria-pressed={on}
                  className="border px-3 py-2.5 text-[13px] text-left transition-colors duration-150"
                  style={
                    on
                      ? { background: theme.accent, color: "#000", borderColor: theme.accent }
                      : { borderColor: theme.faint, color: theme.accent }
                  }
                >
                  [{on ? "x" : " "}] {tag}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] mt-2" style={{ color: theme.dim }}>
            {selected.length}/3 選択
            {ready ? " · 4つ目を押すと最初の選択と入れ替わる" : " · 3つ選ぶと生成できる"}
          </p>
        </section>

        {/* 生成按钮:选满 3 个才亮 */}
        <button
          type="button"
          disabled={!ready || loading}
          onClick={() => void run("brief", { tags: selected.join(",") })}
          className="w-full border py-3 text-[14px] font-bold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={
            ready && !loading
              ? { background: theme.accent, color: "#000", borderColor: theme.accent }
              : { background: "transparent", color: theme.accent, borderColor: theme.faint }
          }
        >
          {loading ? "生成中…" : "$ ブリーフを生成"}
        </button>

        {/* loading:终端输出逐行载入 */}
        {loading && (
          <div className="mt-5 text-[12px] leading-relaxed" style={{ color: theme.dim }}>
            {LOADING_LINES.map((line, i) => (
              <p key={line} className="joho-in" style={{ animationDelay: `${i * 0.5}s` }}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* 报错(useGenerate 已翻译成人话) */}
        {error && (
          <p className="mt-5 text-[13px] border px-3 py-2.5" style={{ color: theme.alert, borderColor: theme.alert }}>
            ! {error}
          </p>
        )}

        {/* 结果:按 ■ 切成卡片逐条淡入;切不开就整段原样显示 */}
        {!loading && text && (
          <section className="mt-6 space-y-3">
            {cards ? (
              cards.map((card, i) => (
                <article
                  key={i}
                  className="joho-in border p-4"
                  style={{ borderColor: theme.faint, animationDelay: `${0.15 + i * 0.35}s` }}
                >
                  <h2 className="text-[15px] font-bold mb-2" style={{ color: theme.accent }}>
                    ■ {card.title}
                  </h2>
                  {card.body.map((line, j) =>
                    line.startsWith("出典") ? (
                      <p key={j} className="text-[11px] mt-2" style={{ color: theme.dim }}>
                        {line}
                      </p>
                    ) : (
                      <p key={j} className="text-[13px] leading-relaxed">
                        {line}
                      </p>
                    )
                  )}
                </article>
              ))
            ) : (
              <pre
                className="joho-in border p-4 text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                style={{ borderColor: theme.faint }}
              >
                {text}
              </pre>
            )}
          </section>
        )}

        {/* 设置区:两个坑位 */}
        <section className="mt-8 border-t pt-5" style={{ borderColor: theme.faint }}>
          <h2 className="text-[11px] tracking-[0.25em] mb-3" style={{ color: theme.dim }}>
            # SETTINGS
          </h2>

          {/* ↓ 桌卡坑位①:カスタムタグ输入框禁用(后端 joho/custom_tag 也是 locked) */}
          <label className="block mb-4">
            <span className="text-[12px] block mb-1.5">カスタムタグ 🔒</span>
            <input
              type="text"
              disabled
              placeholder="固定タグのみ"
              className="pit-locked w-full bg-transparent border px-3 py-2.5 text-[13px] placeholder:text-[#1f9a54]"
              style={{ borderColor: theme.dim, color: theme.accent }}
            />
          </label>

          {/* ↓ 桌卡坑位②:毎朝プッシュ开关拨不动(后端 joho/push 也是 locked) */}
          <div
            className="pit-locked flex items-center justify-between border px-3 py-2.5"
            style={{ borderColor: theme.dim }}
          >
            <span className="text-[12px]">毎朝プッシュ(7:00 JST)🔒</span>
            <span
              role="switch"
              aria-checked={false}
              aria-disabled="true"
              className="relative inline-block w-10 h-5 rounded-full border shrink-0"
              style={{ borderColor: theme.dim }}
            >
              <span
                className="absolute left-0.5 top-0.5 w-3.5 h-3.5 rounded-full"
                style={{ background: theme.dim }}
              />
            </span>
          </div>
        </section>

      </div>
    </main>
  );
}
