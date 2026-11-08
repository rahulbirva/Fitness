import { AIProvider, AIMessage, AIStreamChunk, COACH_SYSTEM_PROMPT } from './types';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { GrokProvider } from './grok';

export { COACH_SYSTEM_PROMPT };

const providers: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  claude: new AnthropicProvider(),
  anthropic: new AnthropicProvider(),
  grok: new GrokProvider(),
  xai: new GrokProvider(),
};

export function getAIProvider(name: string): AIProvider {
  const key = (name || '').toLowerCase();
  return providers[key] ?? providers.gemini;
}

export async function askAICoach(
  providerName: string,
  apiKey: string,
  modelName: string,
  messages: AIMessage[],
  userContext: string,
  onChunk: (chunk: AIStreamChunk) => void
): Promise<void> {
  const provider = getAIProvider(providerName);
  const fullSystemPrompt = `${COACH_SYSTEM_PROMPT}\n\n[USER CURRENT STATUS & CONTEXT]\n${userContext}`;

  await provider.streamMessage(
    messages,
    fullSystemPrompt,
    apiKey,
    modelName,
    onChunk
  );
}
