/**
 * Known OpenCode providers and their canonical API key environment variables.
 */

export interface ProviderDef {
  id: string
  name: string
  keyName: string
  hint: string
}

export const PROVIDERS: ProviderDef[] = [
  { id: 'openai', name: 'OpenAI', keyName: 'OPENAI_API_KEY', hint: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', keyName: 'ANTHROPIC_API_KEY', hint: 'sk-ant-...' },
  { id: 'google', name: 'Google (Gemini)', keyName: 'GOOGLE_API_KEY', hint: 'AIza...' },
  { id: 'deepseek', name: 'DeepSeek', keyName: 'DEEPSEEK_API_KEY', hint: 'sk-...' },
  { id: 'opencode', name: 'OpenCode', keyName: 'OPENCODE_API_KEY', hint: 'oc-...' },
  { id: 'groq', name: 'Groq', keyName: 'GROQ_API_KEY', hint: 'gsk_...' },
  { id: 'mistral', name: 'Mistral', keyName: 'MISTRAL_API_KEY', hint: '...' },
  { id: 'xai', name: 'xAI', keyName: 'XAI_API_KEY', hint: 'xai-...' },
]

export function getProvider(id: string): ProviderDef | undefined {
  return PROVIDERS.find(p => p.id === id)
}

export function getKeyName(id: string): string | undefined {
  return getProvider(id)?.keyName
}