// ============================================================
// app/d/postmortem/page.tsx — 个人项目验尸官 🔬(standard 档)
// 粘贴弃坑项目的 README → LLM 出具死因报告(需求死/分发死/坚持死)。
// 报告用 CSS 打字机逐行打出;解析尽量宽松,解析不出也整段照打不崩。
// 坑位:深度尸检(commit 履历)置灰、報告書PDF出力置灰(まだ成仏していません)。
// ============================================================
"use client";

import { useState } from "react";
import { theme } from "@/demos/postmortem/theme";
import { useGenerate } from "@/core/useGenerate";
import { BreakpointCard } from "@/core/BreakpointCard";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "postmortem")!;

/* 预填的示例 README:典型三分钟热度 side project(功能列表长、
   安装说明缺失、最后 commit 久远),现场一点就能跑 */
const SAMPLE_README = `# TaskFlow Pro

自分専用の最強タスク管理アプリ(仮)。既存のツールは全部微妙なので自作した。

## Features
- タスクの作成 / 編集 / 削除 / アーカイブ
- タグ・プロジェクト・サブタスク無限ネスト
- ポモドーロタイマー内蔵
- ダークモード(こだわりポイント)
- ドラッグ&ドロップ並び替え
- GitHub 連携(予定)
- AI による優先度自動判定(予定)
- Notion 同期(検討中)

## Roadmap
- [ ] モバイル対応
- [ ] チーム共有機能
- [ ] 有料プラン…?

## Install
TODO: あとで書く

## Screenshots
(coming soon)

---
Last commit: 2024-11-03 "fix typo"`;

/** 报告的四个段落头。命中就当节标题渲染;一个都命不中也照常整段逐行打出 */
const SECTION_RE = /^(死因判定|判定依据|判定依據|尸检细节|尸檢細節|处方|處方)/;

/** 宽松解析:按行拆开,标出哪些行是节标题。永远返回可渲染的行,不会抛错 */
function toLines(text: string): { text: string; isHead: boolean }[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => ({ text: l, isHead: SECTION_RE.test(l) }));
}

export default function Page() {
  const [readme, setReadme] = useState(SAMPLE_README);
  const [caseNo, setCaseNo] = useState<string | null>(null);
  const { run, loading, text, error } = useGenerate("postmortem");

  const startAutopsy = () => {
    if (loading || !readme.trim()) return;
    // 案件编号在开检时随机分配(客户端事件里生成,避免 SSR 水合不一致)
    setCaseNo(String(Math.floor(1000 + Math.random() * 9000)));
    void run("autopsy", { readme });
  };

  const lines = text ? toLines(text) : [];
  const lineStep = 0.3; // 每行打印间隔(秒)

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`} style={theme.bpVars}>
      {/* 报告逐行打字机:clip-path steps 从左往右揭开,换行也不崩 */}
      <style>{`
        @keyframes pm-type {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
        .pm-line {
          clip-path: inset(0 100% 0 0);
          animation: pm-type 0.55s steps(24, end) forwards;
        }
        @keyframes pm-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .pm-cursor { animation: pm-blink 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pm-line { animation-duration: 0.01s; animation-delay: 0s !important; }
        }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* 报告抬头 */}
        <header className="border-b pb-3 mb-5" style={{ borderColor: theme.line }}>
          <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: theme.dim }}>
            Forensic Report Terminal
          </p>
          <h1 className="text-xl font-bold leading-tight mt-1">
            {material.emoji} {material.name}
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: theme.dim }}>
            {material.nameJa} · 死因:需求死 / 分发死 / 坚持死
          </p>
        </header>

        {/* 检体投入口 */}
        <section className="mb-4">
          <label className="block text-[11px] tracking-widest mb-1.5" style={{ color: theme.accent }}>
            ▸ 検体(弃坑项目的 README 全文)
          </label>
          <textarea
            value={readme}
            onChange={(e) => setReadme(e.target.value)}
            spellCheck={false}
            rows={12}
            className="w-full text-[12px] leading-relaxed bg-[#0f130f] border rounded-none p-3 outline-none resize-y focus:border-[#8fb096]"
            style={{ borderColor: theme.line, color: "#b9c6ba" }}
          />
        </section>

        <button
          onClick={startAutopsy}
          disabled={loading || !readme.trim()}
          className="w-full border py-3 text-[13px] tracking-[0.2em] transition-colors duration-200 hover:bg-[#182018] disabled:opacity-50"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          {loading ? "検死中…" : "検死を開始する"}
        </button>

        {/* 状态行 */}
        {loading && (
          <p className="text-[11px] mt-3" style={{ color: theme.dim }}>
            解剖台の照明を点灯…READMEを開腹しています
            <span className="pm-cursor">▌</span>
          </p>
        )}
        {error && (
          <p className="text-[12px] mt-3 border px-3 py-2" style={{ borderColor: theme.line, color: theme.accent }}>
            ⚠ {error}
          </p>
        )}

        {/* 死因报告:逐行打出 */}
        {!loading && text && (
          <section
            key={text}
            className="mt-6 border p-4 bg-[#0d110e]"
            style={{ borderColor: theme.line }}
          >
            <div
              className="flex justify-between text-[10px] tracking-widest border-b pb-2 mb-3"
              style={{ color: theme.dim, borderColor: theme.line }}
            >
              <span>検死報告書 · AUTOPSY REPORT</span>
              <span>CASE No. {caseNo ?? "----"}</span>
            </div>

            {lines.map((l, i) => (
              <p
                key={i}
                className={`pm-line text-[12.5px] leading-relaxed whitespace-pre-wrap ${
                  l.isHead ? "font-bold mt-3 pt-3 border-t first:mt-0 first:pt-0 first:border-t-0" : "mt-1"
                }`}
                style={{
                  animationDelay: `${i * lineStep}s`,
                  color: l.isHead ? theme.accent : undefined,
                  borderColor: theme.line
                }}
              >
                {l.text}
              </p>
            ))}

            <p
              className="pm-line text-[10px] tracking-widest mt-4 pt-2 border-t"
              style={{
                animationDelay: `${lines.length * lineStep}s`,
                color: theme.dim,
                borderColor: theme.line
              }}
            >
              — 以上、検死終了 —<span className="pm-cursor">▌</span>
            </p>
          </section>
        )}

        {/* ↓ 桌卡坑位 ×2:后端 deep / export 也是 locked,前端如实置灰 */}
        <div className="mt-6 space-y-2.5">
          <button
            disabled
            className="pit-locked w-full border py-3 text-[12px] tracking-wider"
            style={{ borderColor: theme.line }}
          >
            🔒 コミット履歴を解析(深度尸检)
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="pit-locked flex-1 border py-3 text-[12px] tracking-wider"
              style={{ borderColor: theme.line }}
            >
              🔒 報告書をPDF出力
            </button>
            <span className="text-[10px] shrink-0" style={{ color: theme.dim }}>
              まだ成仏していません
            </span>
          </div>
        </div>

        <BreakpointCard soulPit={material.soulPit} visiblePits={material.visiblePits} />
      </div>
    </main>
  );
}
