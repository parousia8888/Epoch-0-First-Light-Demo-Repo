// ============================================================
// core/llm.ts — 全项目唯一的 LLM 调用函数
// 打 OpenAI-compatible 中转站的 /chat/completions。
// 30 秒超时;错误统一归成四类,前端据此显示人话。
// 改中转站地址/密钥 → 改 .env.local,不改这里。
// ============================================================
import { registry } from "./registry";
import type { GenerateResult } from "./types";

const TIMEOUT_MS = 30_000;

/** payload.image 存在且 demo 是 vision 时,消息走 image_url 分支 */
export async function generate(
  slug: string,
  action: string,
  payload: Record<string, string>
): Promise<GenerateResult> {
  const demo = registry[slug];
  const act = demo?.actions[action];
  if (!demo || !act || act.locked) return { ok: false, error: "bad_request" };

  const base = (process.env.LLM_BASE_URL ?? "").replace(/\/$/, "");
  const key = process.env.LLM_API_KEY ?? "";
  if (!base || !key) return { ok: false, error: "upstream" };

  const userText = act.user(payload);
  const userMessage =
    demo.vision && payload.image
      ? {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: payload.image } }
          ]
        }
      : { role: "user", content: userText };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: demo.model,
        messages: [{ role: "system", content: act.system }, userMessage],
        max_tokens: demo.maxTokens ?? 800,
        temperature: demo.temperature ?? 0.7
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      // 中转站的错误码归类:429 限流;401/402/403 都是密钥/额度问题;4xx 其余算请求错;5xx 算上游挂了
      if (res.status === 429) return { ok: false, error: "rate_limited" };
      if ([401, 402, 403].includes(res.status)) return { ok: false, error: "quota" };
      if (res.status >= 400 && res.status < 500) return { ok: false, error: "bad_request" };
      return { ok: false, error: "upstream" };
    }

    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) return { ok: false, error: "upstream" };
    return { ok: true, text };
  } catch {
    // 超时(AbortError)和断网都算上游问题
    return { ok: false, error: "upstream" };
  } finally {
    clearTimeout(timer);
  }
}
