// ============================================================
// demos/joho/config.ts — 在日 AI 情报官 🗞 的"产品配方"
// 数据源:最近 7 天的 E0 日报池,硬编码在下面的 FEED_POOL 里。
// 想换新闻池 → 只改 FEED_POOL 数组,每条一行,格式照抄即可。
// (活动前夜可手动把最新几条换进去,保持"最近 7 天"的体感)
// ============================================================
import type { DemoConfig } from "@/core/types";

export const TAGS = [
  "LLM",
  "机器人",
  "政策监管",
  "创业融资",
  "开源工具",
  "AI硬件",
  "生成媒体",
  "日本大厂"
] as const;

// E0 日报最近 7 天池子(2026.08.23–08.29,真实数据)
// 来源:epoch0 MCP 的 daily_digest,2026-08-29 拉取后硬编码(不做运行时依赖是纪律)。
// 活动前想更新:让 Claude 重新拉最近 7 天日报,按同样格式重写这个数组即可。
const FEED_POOL = [
  "08/29|政策监管|美国加州联邦法院裁定政府以「供应链风险」为由封禁 Anthropic 产品违法,下令撤销相关指令",
  "08/29|机器人|Hugging Face 发布 25cm 开源双足机器人 Microduck,开箱可操控、支持强化学习重训行为,圣诞前发货",
  "08/29|LLM|腾讯发布并开源旗舰模型 Hy4 preview:总参数 770B、每 token 激活 49B、上下文 1M,API 已上线",
  "08/29|开源工具|智谱发布 GLM-5.3 开放权重:基座与 5.2 相同,能力提升全部来自后训练,重点是 Agentic 编码与网络防御",
  "08/28|创业融资|The Information:英伟达同意以 129 亿美元收购 Hugging Face,后者近期年化收入约 1.5 亿美元",
  "08/28|政策监管|OpenAI 联合 Anthropic、AWS、Google 等发起网络防御集体行动,要求 Agentic 身份可追溯、可问责",
  "08/28|AI硬件|Anthropic 开放 Model Hardware Standard 研究预览:AI Agent 可并行操作显微镜、液体处理器和机械臂",
  "08/28|生成媒体|fal 发布基于 MiniMax H3 后训练的视频模型 H3 Max:不到 3 秒生成 5 秒视频,吞吐约为官方端点 35 倍",
  "08/28|生成媒体|Google 推出 Gemini Omni 1.1 Flash:支持场景续写、首尾帧控制与 4K 放大,成本为标准 720p 的三分之一",
  "08/27|开源工具|智谱以 MIT 协议开源 GLM-5.3-Flash:320B 总参、18B 激活,支持图文视频输入与 1M 上下文",
  "08/27|创业融资|路透:月之暗面与微软、亚马逊、Google 洽谈 Kimi K3 云端托管分成,目标最高 30% 相关收入",
  "08/26|AI硬件|OpenAI 公布首款自研推理芯片 Jalapeño 首测:每瓦性能为对比系统 1.5–1.9 倍,延迟降 1.7–3.6 倍",
  "08/25|AI硬件|小米发布玄戒 O3/O100/D100 三款自研芯片并展出 AI Cube 原型机,O3 将首发小米 18 Fold",
  "08/25|创业融资|Nvidia 商谈投资 Perplexity 数十亿美元,本轮估值超 300 亿美元,后者年化营收超 7.5 亿美元",
  "08/24|LLM|Claude Code 主创回应 Opus 5 冗长输出批评:已上线 concise 输出配置过渡,长期修复在推进",
  "08/23|LLM|DeepSeek 更新 API 峰谷计费:周末全天按低谷价收费,工作日维持原有分段规则",
  "08/23|开源工具|Firecrawl 上线 Developer Index:7000 万+ 文档/README/issue/PR 纳入单一索引"
].join("\n");

export const johoConfig: DemoConfig = {
  slug: "joho",
  name: "在日 AI 情报官",
  model: "gpt-4o-mini",
  maxTokens: 1400,
  temperature: 0.4,
  actions: {
    brief: {
      system: `你是 Epoch 0(在日 AI Builder 社群)的情报官。下面是最近 7 天的日报池,每行格式「日期|标签|内容」:

${FEED_POOL}

用户选了 3 个兴趣标签。你的任务:从池子里挑出与这 3 个标签最相关的恰好 3 条,重写成个人简报。
输出格式(纯文本,每条之间空一行):
■ (12字以内的标题)
(两句话:第一句说发生了什么,第二句说这对在日 AI builder 意味着什么)
出典:E0日報 MM/DD

规则:只能用池子里的条目,绝不编造池子外的新闻;3 个标签尽量各覆盖一条,池子里某标签没有合适条目时可以用相邻主题补位并如实说明;按对读者的重要程度排序,不是按日期。不要用 markdown 符号。`,
      user: (p) => `我选的 3 个标签:${p.tags ?? ""}`
    },
    // ↓ 桌卡上的坑 ×2:自定义标签禁用(只能 8 选 3)、每朝推送开关拨不动。
    custom_tag: {
      system: "",
      user: () => "",
      locked: true
    },
    push: {
      system: "",
      user: () => "",
      locked: true
    }
  }
};
