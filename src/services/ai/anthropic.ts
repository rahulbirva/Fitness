import { AIProvider, AIMessage, AIStreamChunk } from './types';

export class AnthropicProvider implements AIProvider {
  name = 'Claude';

  async streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    apiKey: string,
    model: string,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('Anthropic API key is missing. Please enter it in Settings.');
    }

    const effectiveModel = model?.trim() || 'claude-3-5-haiku-20241022';

    // Format messages for Anthropic API
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cleanApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: effectiveModel,
          max_tokens: 1024,
          system: systemPrompt,
          messages: formattedMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson?.error?.message || response.statusText;
        } catch {
          errText = await response.text();
        }
        throw new Error(`Claude error (${response.status}): ${errText || 'Invalid request'}`);
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
                if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                  onChunk({ text: parsed.delta.text, done: false });
                }
              } catch {
                // Ignore SSE keepalive / parse errors
              }
            }
          }
        }
        onChunk({ text: '', done: true });
      } else {
        // Fallback for runtimes without ReadableStream
        const rawText = await response.text();
        // Parse SSE lines from full text
        const lines = rawText.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                  onChunk({ text: parsed.delta.text, done: false });
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
      const message = err instanceof Error ? err.message : 'Network error reaching Claude API.';
      throw new Error(message);
    }
  }
}
