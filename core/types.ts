// ============================================================
// core/types.ts — 全项目的类型契约
// 谁会改这个文件:基本没人。改它会影响所有 demo,慎动。
// 看懂这一个文件,就看懂了整个项目的数据流。
// ============================================================

/** 一个"动作" = 用户按下某个按钮后,发给 LLM 的一次请求配方 */
export interface ActionConfig {
  /** 系统提示词:告诉 LLM 它是谁、该怎么回答。全项目所有 prompt 只住在 config.ts 里 */
  system: string;
  /** 把用户的输入(payload)拼成一条用户消息。payload 就是页面表单里收集到的字段 */
  user: (payload: Record<string, string>) => string;
  /** true = 这个动作是"故意锁定的坑"。前端置灰,后端也会真的拒绝(403) */
  locked?: boolean;
}

/** 一个 demo 的完整配置。每个 demo 一份,放在 demos/<slug>/config.ts */
export interface DemoConfig {
  /** URL 里的短名,如 keigo → /d/keigo */
  slug: string;
  /** 显示名 */
  name: string;
  /** 发给中转站的模型名。中转站支持什么就填什么,现场可随时改 */
  model: string;
  /** true = 这个 demo 需要传图片(拍照类)。EVENT_MODE 关闭时这类 demo 会被停用 */
  vision?: boolean;
  /** 单次回答最长 token 数,默认 800 */
  maxTokens?: number;
  /** 温度,默认 0.7。想让输出更稳就调低 */
  temperature?: number;
  /** 这个 demo 有哪些动作。key 是动作名,前端用同样的名字调用 */
  actions: Record<string, ActionConfig>;
}

/** LLM 调用的统一返回:要么成功拿到文本,要么是四种错误之一 */
export type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; error: GenerateError };

export type GenerateError = "rate_limited" | "quota" | "bad_request" | "upstream";
