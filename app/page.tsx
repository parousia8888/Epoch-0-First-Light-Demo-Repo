// ============================================================
// app/page.tsx — 首页:10 个 demo 的极简索引
// 现场大家扫码进来的第一屏。数据直接读 demos-material.ts,
// 素材表改了这里自动跟着变,不要在这里手写 demo 名单。
// ============================================================
import Link from "next/link";
import { demos } from "@/demos-material";

export default function Home() {
  return (
    <main className="max-w-md mx-auto px-5 pt-14 pb-8">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.4em] uppercase opacity-50 mb-3">
          Epoch 0 presents
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          First Light <span className="opacity-50 font-normal">Vol.1</span>
        </h1>
        <p className="text-sm opacity-60">光还没亮,人先到齐。— 10 个半成品,每个都有坑。</p>
      </header>

      <ul className="divide-y divide-neutral-800">
        {demos.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/d/${d.slug}`}
              className="flex items-center gap-4 py-4 group active:opacity-60 transition-opacity"
            >
              <span className="text-2xl w-9 text-center shrink-0">{d.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-medium">{d.name}</span>
                <span className="block text-xs opacity-50 truncate">{d.nameJa}</span>
              </span>
              <span className="opacity-30 group-hover:opacity-70 transition-opacity">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
