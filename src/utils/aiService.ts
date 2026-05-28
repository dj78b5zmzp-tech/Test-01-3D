const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResult {
  ok: boolean
  content: string
  error?: string
}

const SYSTEM_PROMPT = `你是一个专业的钢筋混凝土结构工程 AI 助手，运行在"3D 钢筋平法可视化"工具内。
你的职责：
1. 回答用户关于钢筋配筋、锚固、搭接、规范（GB50010、11G101）等专业问题
2. 根据当前构件参数给出分析建议（配筋率、抗弯/抗剪承载力估算等）
3. 当用户要求调整参数时，在回复末尾输出 JSON 指令块

【调参指令格式】
当你认为需要修改构件参数时，在回复最后一行以独立 JSON 代码块输出：
\`\`\`json
{"action":"setParam","target":"beam","params":{"width":350,"height":600}}
\`\`\`
- target 可选值：beam / column / slab
- params 中只包含需要修改的字段（字段名与系统给你的参数对象 key 完全一致）
- 不需要调参时不要输出 JSON 块

【注意】
- 用中文回答
- 简洁专业，避免冗长
- 计算结果给出关键步骤
- 单位统一用 mm / kN / MPa`

export function buildSystemMessages(contextJson: string): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `【当前构件参数】\n${contextJson}` },
  ]
}

export async function chatCompletion(
  messages: ChatMessage[],
  apiKey: string,
): Promise<ChatCompletionResult> {
  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      if (res.status === 401) return { ok: false, content: '', error: 'API Key 无效或已过期，请检查后重新设置。' }
      if (res.status === 402) return { ok: false, content: '', error: '账户余额不足，请充值后重试。' }
      if (res.status === 429) return { ok: false, content: '', error: '请求过于频繁，请稍后再试。' }
      return { ok: false, content: '', error: `请求失败 (${res.status}): ${errBody.slice(0, 200)}` }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return { ok: true, content }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, content: '', error: `网络错误: ${msg}` }
  }
}

export interface ParamAction {
  action: 'setParam'
  target: 'beam' | 'column' | 'slab'
  params: Record<string, unknown>
}

export function extractParamAction(text: string): ParamAction | null {
  const match = text.match(/```json\s*\n?\s*(\{[\s\S]*?\})\s*\n?\s*```\s*$/)
  if (!match) return null
  try {
    const obj = JSON.parse(match[1])
    if (obj.action === 'setParam' && obj.target && obj.params) {
      return obj as ParamAction
    }
  } catch { /* ignore */ }
  return null
}

export function getApiKey(): string {
  return localStorage.getItem('deepseek_api_key') ?? ''
}

export function setApiKey(key: string): void {
  localStorage.setItem('deepseek_api_key', key.trim())
}
