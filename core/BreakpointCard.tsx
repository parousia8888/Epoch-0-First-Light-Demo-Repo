// ============================================================
// core/BreakpointCard.tsx — 全场唯一强制统一组件:桌卡(坑位卡)
// 固定三段:灵魂坑 ×1 + 实现坑 ×2 + Epoch 0 徽章。
// 【纪律】没有"方向/下一步"字段,永远不要加。坑是拿来讨论的,
// 答案要留给桌上的人——这是整个 workshop 的设计。
// 配色通过三个 CSS 变量继承各 demo 主题:
//   --bp-bg(卡片底色) --bp-fg(文字色) --bp-accent(强调色)
// 页面不设置时用默认的黑白灰,保证任何主题下都能读。
// ============================================================

interface Props {
  soulPit: string;
  visiblePits: [string, string];
  className?: string;
}

export function BreakpointCard({ soulPit, visiblePits, className = "" }: Props) {
  return (
    <aside
      className={`mt-10 rounded-xl border p-5 space-y-4 ${className}`}
      style={{
        background: "var(--bp-bg, #111)",
        color: "var(--bp-fg, #eee)",
        borderColor: "var(--bp-accent, #555)"
      }}
    >
      <section>
        <h3
          className="text-xs tracking-[0.3em] uppercase mb-2 opacity-70"
          style={{ color: "var(--bp-accent, #999)" }}
        >
          灵魂坑 · Soul Pit
        </h3>
        <p className="text-sm leading-relaxed">{soulPit}</p>
      </section>

      <section>
        <h3
          className="text-xs tracking-[0.3em] uppercase mb-2 opacity-70"
          style={{ color: "var(--bp-accent, #999)" }}
        >
          实现坑 · 現場で見える穴
        </h3>
        <ul className="text-sm leading-relaxed space-y-1.5">
          {visiblePits.map((pit, i) => (
            <li key={i} className="flex gap-2">
              <span className="opacity-50 shrink-0">🔒</span>
              <span>{pit}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--bp-accent, #333)" }}>
        <span className="text-[10px] tracking-widest opacity-60">
          we&rsquo;re still at epoch zero.
        </span>
        <span
          className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border"
          style={{ borderColor: "var(--bp-accent, #666)", color: "var(--bp-accent, #ccc)" }}
        >
          EPOCH 0
        </span>
      </footer>
    </aside>
  );
}
