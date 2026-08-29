// ============================================================
// app/d/yakusho/page.tsx — 市役所文件解读器 🏛(vision demo)
// 主路径:拍照/上传行政通知 → run("read") → 三行结论卡(受理印样式盖出)。
// 解析不出【要你干什么】三段格式时,整段原样显示,不崩。
// 坑位:免責事項区块整块留白;複数ページPDF 上传口画出但禁用。
// ============================================================
"use client";

import { useState } from "react";
import { ImageDrop } from "@/core/ImageDrop";
import { useGenerate } from "@/core/useGenerate";
import { theme } from "@/demos/yakusho/theme";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "yakusho")!;

/** 三段结论;解析失败返回 null,由调用方整段原样渲染 */
interface Parsed {
  action: string;
  deadline: string;
  consequence: string;
}

function parseCard(text: string): Parsed | null {
  const grab = (label: string): string | null => {
    const m = text.match(new RegExp(`【${label}】([\\s\\S]*?)(?=【|$)`));
    const body = m?.[1]?.trim();
    return body ? body : null;
  };
  const action = grab("要你干什么");
  const deadline = grab("截止日期");
  const consequence = grab("不做的后果");
  if (action && deadline && consequence) return { action, deadline, consequence };
  return null;
}

/* 公文表格的一行:朱红小标签在上,内容在下,横线分隔 */
function ResultRow({ label, labelJa, children }: { label: string; labelJa: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/20 last:border-b-0 px-4 py-3">
      <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: theme.accent }}>
        【{label}】<span className="opacity-60 font-normal">{labelJa}</span>
      </div>
      <div className="text-[14px] leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}

export default function Page() {
  const { run, loading, text, error } = useGenerate("yakusho");
  const [hasImage, setHasImage] = useState(false);

  const parsed = text ? parseCard(text) : null;

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`}>
      {/* 受理印:盖章落下的一次性动画(CSS 过渡,不用 GSAP) */}
      <style>{`
        @keyframes yakusho-stamp {
          0%   { opacity: 0; transform: scale(1.5) rotate(-7deg); }
          70%  { opacity: 1; transform: scale(0.97) rotate(-1deg); }
          100% { opacity: 1; transform: scale(1) rotate(-1.5deg); }
        }
        .yakusho-stamp { animation: yakusho-stamp 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
        @keyframes yakusho-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        .yakusho-blink { animation: yakusho-blink 1.2s ease-in-out infinite; }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* 公文头:样式号 + 标题 + 朱红印点 */}
        <header className="border-b-2 pb-3 mb-1" style={{ borderColor: theme.ink }}>
          <div className="flex justify-between items-start text-[10px] tracking-widest opacity-60">
            <span>様式第1号</span>
            <span>FIRST LIGHT VOL.1</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-xl font-bold leading-tight">
              {material.emoji} {material.name}
            </h1>
            {/* 朱红印点 */}
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: theme.accent }}
              aria-hidden
            />
          </div>
          <p className="text-[12px] opacity-60 mt-0.5">{material.nameJa} · 行政通知をそのまま撮ってください</p>
        </header>
        <p className="text-[11px] border-b border-black/20 py-2 mb-5 opacity-70">
          この書類が「何を・いつまでに・やらないとどうなるか」を三行で返します。
        </p>

        {/* 主路径:拍照/上传 → 送审 */}
        <section className="mb-6">
          <div className="text-[11px] font-bold tracking-widest mb-2" style={{ color: theme.accent }}>
            ① 書類の写真 <span className="opacity-60 font-normal">拍照 / 上传行政通知</span>
          </div>
          <ImageDrop
            onImage={(dataUrl) => {
              setHasImage(true);
              void run("read", { image: dataUrl });
            }}
          />
          {!hasImage && (
            <p className="text-[11px] opacity-50 mt-2">
              例:年金・税金・国保・区役所からの封書。封筒ごとでもOK。
            </p>
          )}
        </section>

        {/* 审査中:带世界观的 loading */}
        {loading && (
          <div className="border border-black/30 bg-white px-4 py-6 text-center mb-6">
            <div className="yakusho-blink text-[14px] font-bold tracking-[0.3em]" style={{ color: theme.accent }}>
              審査中…
            </div>
            <p className="text-[11px] opacity-60 mt-2">窓口で書類を確認しています。少々お待ちください。</p>
          </div>
        )}

        {error && !loading && (
          <div
            className="border px-4 py-3 text-[13px] mb-6 bg-white"
            style={{ borderColor: theme.accent, color: theme.accent }}
          >
            {error}
          </div>
        )}

        {/* 三行结论卡:受理印样式,盖章落下 */}
        {text && !loading && (
          <section
            key={text}
            className="yakusho-stamp relative bg-white border-[3px] mb-6"
            style={{ borderColor: theme.accent }}
          >
            {/* 内圈细线,双线印框感 */}
            <div className="absolute inset-1 border pointer-events-none" style={{ borderColor: theme.accent, opacity: 0.5 }} />
            {/* 右上角「受理」小印 */}
            <div
              className="absolute -top-3 right-3 bg-white border-2 rounded-full w-14 h-14 flex items-center justify-center rotate-6 text-[13px] font-bold leading-tight text-center"
              style={{ borderColor: theme.accent, color: theme.accent }}
            >
              受理
            </div>
            <div className="pt-5 pb-2">
              {parsed ? (
                <>
                  <ResultRow label="要你干什么" labelJa="やること">
                    {parsed.action}
                  </ResultRow>
                  <ResultRow label="截止日期" labelJa="期限">
                    {parsed.deadline}
                  </ResultRow>
                  <ResultRow label="不做的后果" labelJa="放置した場合">
                    {parsed.consequence}
                  </ResultRow>
                </>
              ) : (
                /* 格式解析不出:整段原样显示,不崩 */
                <div className="px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap">{text}</div>
              )}
            </div>
          </section>
        )}

        {/* ↓ 桌卡坑位②:複数ページPDF 上传口画出但禁用(后端 multipage 也是 locked) */}
        <section className="mb-6">
          <div className="text-[11px] font-bold tracking-widest mb-2 opacity-60">
            ② 複数ページPDF <span className="font-normal">多页文件</span>
          </div>
          <button
            type="button"
            disabled
            className="pit-locked w-full py-8 border-2 border-dashed border-black/40 rounded-lg text-center text-[13px] bg-white"
          >
            🔒 複数ページPDFをアップロード(未対応)
          </button>
        </section>

        {/* ↓ 桌卡坑位①:免責事項整块留白——这是故意的,不要帮它写 */}
        <section className="mb-2">
          <div className="text-[11px] font-bold tracking-widest mb-2 opacity-60">免責事項</div>
          <div className="pit-locked border border-black/40 bg-white px-4 py-10 text-center">
            <span className="text-[12px] opacity-50">ここに何を書くべき?</span>
          </div>
        </section>

      </div>
    </main>
  );
}
