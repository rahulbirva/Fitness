import { getDatabase } from '../index';

export interface ChatMessage {
  id: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO chat_messages (session_id, role, content, created_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [sessionId, role, content]
  );
}

export async function getMessagesForSession(sessionId = 'main', limit = 100): Promise<ChatMessage[]> {
  const db = await getDatabase();
  return db.getAllAsync<ChatMessage>(
    'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT ?',
    [sessionId, limit]
  );
}

export async function clearChatHistory(sessionId = 'main'): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chat_messages WHERE session_id = ?', [sessionId]);
}
