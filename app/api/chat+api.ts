import Anthropic from '@anthropic-ai/sdk';
import { containsCrisisKeyword } from '@/lib/crisis';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

// Expo Router API Route（サーバーサイドのみで実行される）。
// ANTHROPIC_API_KEY は EXPO_PUBLIC_ プレフィックスを付けないことで
// クライアントバンドルに漏れないようにしている。

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: IncomingMessage[];
  moodLabel?: string | null;
  triggers?: string[];
  memo?: string;
}

function buildContextPrefix(body: RequestBody): string {
  const parts: string[] = [];
  if (body.moodLabel) parts.push(`今日の気分: ${body.moodLabel}`);
  if (body.triggers && body.triggers.length > 0) parts.push(`きっかけ: ${body.triggers.join('、')}`);
  if (body.memo) parts.push(`メモ: ${body.memo}`);
  return parts.length > 0 ? `[会話開始時の入力情報]\n${parts.join('\n')}\n\n` : '';
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.messages || body.messages.length === 0) {
    return Response.json({ error: 'messages_required' }, { status: 400 });
  }

  const lastUserMessage = [...body.messages].reverse().find((m) => m.role === 'user');
  const isCrisis = lastUserMessage ? containsCrisisKeyword(lastUserMessage.content) : false;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: 'missing_api_key',
        message:
          'サーバーに ANTHROPIC_API_KEY が設定されていません。.env に設定して開発サーバーを再起動してください。',
        isCrisis,
      },
      { status: 500 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    // 会話履歴の先頭（最初のユーザー発話）に、気分入力の文脈を軽く添える
    const messages = body.messages.map((m, i) => {
      if (i === 0 && m.role === 'user') {
        return { role: m.role, content: buildContextPrefix(body) + m.content };
      }
      return { role: m.role, content: m.content };
    });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const reply = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    return Response.json({ reply, isCrisis });
  } catch (error: any) {
    console.error('Guchibo chat API error:', error);
    return Response.json(
      { error: 'anthropic_error', message: error?.message ?? 'unknown error', isCrisis },
      { status: 502 },
    );
  }
}
