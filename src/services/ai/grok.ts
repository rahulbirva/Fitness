import { AIProvider, AIMessage, AIStreamChunk } from './types';

export class GrokProvider implements AIProvider {
  name = 'Grok';

  async streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    apiKey: string,
    model: string,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('xAI Grok API key is missing. Please enter it in Settings or .env.');
    }

    const effectiveModel = model?.trim() || 'grok-beta';

    // Format messages for OpenAI-compatible xAI Grok API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanApiKey}`,
        },
        body: JSON.stringify({
          model: effectiveModel,
          messages: formattedMessages,
          stream: true,
          temperature: 0.6,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson?.error?.message || errJson?.message || response.statusText;
        } catch {
          errText = await response.text();
        }
        throw new Error(`Grok error (${response.status}): ${errText || 'Invalid request'}`);
      }

      const reader = response.body?.getReader?.();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                onChunk({ text: '', done: true });
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const deltaContent = parsed?.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  onChunk({ text: deltaContent, done: false });
                }
              } catch {
                // Ignore SSE partial JSON parse errors
              }
            }
          }
        }
        onChunk({ text: '', done: true });
      } else {
        // Fallback for runtimes without ReadableStream
        const rawText = await response.text();
        const lines = rawText.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const deltaContent = parsed?.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  onChunk({ text: deltaContent, done: false });
                }
              } catch {
                // Ignore
              }
            }
          }
        }
        onChunk({ text: '', done: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error reaching xAI Grok API.';
      throw new Error(message);
    }
  }
}
