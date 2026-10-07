// チャットAPIの呼び出し口。
// 段階1（実機起動）ではバックエンド未接続のため、EXPO_PUBLIC_CHAT_API_URL が
// 未設定ならエラーを返す。段階2で Firebase Cloud Functions の呼び出しに置き換える。

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  moodLabel?: string | null;
  triggers?: string[];
  memo?: string;
}

export interface ChatResponse {
  reply: string;
  isCrisis: boolean;
}

export class ChatNotConfiguredError extends Error {
  constructor() {
    super('chat_api_not_configured');
    this.name = 'ChatNotConfiguredError';
  }
}

const CHAT_API_URL = process.env.EXPO_PUBLIC_CHAT_API_URL;

// チャットAPIが未設定のときはデモ応答モードで動かす（ベータ版のTestFlight配信用）
export const CHAT_DEMO_MODE = !CHAT_API_URL;

export async function sendChat(body: ChatRequest): Promise<ChatResponse> {
  if (!CHAT_API_URL) throw new ChatNotConfiguredError();

  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `chat_api_error_${res.status}`);
  return { reply: data.reply ?? '', isCrisis: Boolean(data.isCrisis) };
}
