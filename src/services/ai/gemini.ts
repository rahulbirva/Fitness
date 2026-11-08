import { AIProvider, AIMessage, AIStreamChunk } from './types';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';

  async streamMessage(
    messages: AIMessage[],
    systemPrompt: string,
    apiKey: string,
    model: string,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    const cleanApiKey = apiKey.trim();
    if (!cleanApiKey) {
      throw new Error('Gemini API key is missing. Please enter it in Settings.');
    }

    const effectiveModel = model?.trim() || 'gemini-1.5-flash';

    // Format messages for Gemini generateContent
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:streamGenerateContent?alt=sse&key=${cleanApiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.6,
          },
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
        throw new Error(`Gemini error (${response.status}): ${errText || 'Invalid request'}`);
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
              try {
                const parsed = JSON.parse(data);
                const candidateText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (candidateText) {
                  onChunk({ text: candidateText, done: false });
                }
              } catch {
                // Ignore parse failures on partial SSE frames
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
            try {
              const parsed = JSON.parse(data);
              const candidateText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                onChunk({ text: candidateText, done: false });
              }
            } catch {
              // Ignore
            }
          }
        }
        onChunk({ text: '', done: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error connecting to Gemini.';
      throw new Error(message);
    }
  }
}
