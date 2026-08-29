// ============================================================
// scripts/new-demo.ts — 新建 demo 的脚手架
// 用法:pnpm new-demo <slug>
// 会生成三个文件:demos/<slug>/config.ts、demos/<slug>/theme.ts、
// app/d/<slug>/page.tsx,然后提醒你去 core/registry.ts 登记两行。
// ============================================================
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error("用法:pnpm new-demo <slug>(小写字母/数字/连字符)");
  process.exit(1);
}

const root = process.cwd();
const demoDir = path.join(root, "demos", slug);
const pageDir = path.join(root, "app", "d", slug);
if (fs.existsSync(demoDir) || fs.existsSync(pageDir)) {
  console.error(`✋ ${slug} 已存在,不覆盖。`);
  process.exit(1);
}

const cap = slug.replace(/-(\w)/g, (_, c) => c.toUpperCase());

const configTpl = `// demos/${slug}/config.ts — ${slug} 的"产品配方"
// prompt 只住在这里,页面代码里不出现任何 prompt。
import type { DemoConfig } from "@/core/types";

export const ${cap}Config: DemoConfig = {
  slug: "${slug}",
  name: "${slug}",
  model: "gpt-4o-mini",
  actions: {
    main: {
      system: \`(在这里写 system prompt)\`,
      user: (p) => \`(把表单字段拼成用户消息)\${p.input ?? ""}\`
    }
    // 置灰的坑位动作在这里加 locked: true,后端会真拒(403)
  }
};
`;

const themeTpl = `// demos/${slug}/theme.ts — ${slug} 的视觉人格(颜色/字体/一句话基调)
// 对照 demos-material.ts 里这个 demo 的 polishHint 来填。
export const theme = {
  /* 页面底色与文字色(Tailwind 类名) */
  page: "bg-neutral-950 text-neutral-100",
  /* 主字体:font-mincho | font-dot | font-typewriter | font-hand | font-sans */
  font: "font-sans",
};
`;

const pageTpl = `// app/d/${slug}/page.tsx — ${slug} 的页面
"use client";

import { useGenerate } from "@/core/useGenerate";
import { demos } from "@/demos-material";
import { theme } from "@/demos/${slug}/theme";

const material = demos.find((d) => d.slug === "${slug}")!;

export default function Page() {
  const { run, loading, text, error } = useGenerate("${slug}");

  return (
    <main
      className={\`min-h-dvh px-5 pt-10 pb-6 \${theme.page} \${theme.font}\`}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">{material.emoji} {material.name}</h1>
        <p className="text-sm opacity-60 mb-8">{material.nameJa}</p>

        {/* TODO: 表单 + run("main", {...}) + 结果展示 + 置灰坑位 */}

        {error && <p className="text-sm mt-4 opacity-80">{error}</p>}
        {text && <pre className="whitespace-pre-wrap text-sm mt-4">{text}</pre>}

      </div>
    </main>
  );
}
`;

fs.mkdirSync(demoDir, { recursive: true });
fs.mkdirSync(pageDir, { recursive: true });
fs.writeFileSync(path.join(demoDir, "config.ts"), configTpl);
fs.writeFileSync(path.join(demoDir, "theme.ts"), themeTpl);
fs.writeFileSync(path.join(pageDir, "page.tsx"), pageTpl);

console.log(`✅ 生成完毕:
  demos/${slug}/config.ts
  demos/${slug}/theme.ts
  app/d/${slug}/page.tsx

别忘了去 core/registry.ts 加两行:
  import { ${cap}Config } from "@/demos/${slug}/config";
  registry 里加:${slug}: ${cap}Config`);
