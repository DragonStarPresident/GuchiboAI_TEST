import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodKey } from './theme';

// ベータ版では、すべてのデータを端末内（AsyncStorage）にのみ保存する。
// 段階D（データとアカウント）で Firestore に移行する。

// --- 型定義 -----------------------------------------------------------

export type Plan = 'free' | 'plus';

export interface Profile {
  nickname: string;
  plan: Plan;
  createdAt: string;
  onboarded: boolean;
  aiConsentAt?: string | null; // AIへのデータ送信に同意した日時
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isCrisis?: boolean;
  isDemo?: boolean; // デモ応答（AI未接続時の定型文）
}

export interface Conversation {
  id: string;
  mood: MoodKey | null;
  triggers: string[];
  memo?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface MoodEntry {
  id: string;
  mood: MoodKey;
  triggers: string[];
  memo?: string;
  createdAt: string;
  conversationId?: string;
}

export interface UsageState {
  monthKey: string; // "2026-10"
  messageCount: number;
}

const KEYS = {
  profile: 'guchibo:profile',
  conversations: 'guchibo:conversations',
  moods: 'guchibo:moods',
  usage: 'guchibo:usage',
} as const;

// 無料プランの月あたりメッセージ上限（要件定義V2・利用規約ドラフトに準拠。暫定）
export const FREE_MONTHLY_LIMIT = 30;

// --- プロフィール --------------------------------------------------------

export async function getProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const current: Profile = (await getProfile()) ?? {
    nickname: 'ゲスト',
    plan: 'free',
    createdAt: new Date().toISOString(),
    onboarded: false,
    aiConsentAt: null,
  };
  const next = { ...current, ...patch };
  await saveProfile(next);
  return next;
}

// --- 会話履歴 -----------------------------------------------------------

export async function getConversations(): Promise<Conversation[]> {
  const raw = await AsyncStorage.getItem(KEYS.conversations);
  const list = raw ? (JSON.parse(raw) as Conversation[]) : [];
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  const list = await getConversations();
  return list.find((c) => c.id === id);
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const list = await getConversations();
  const idx = list.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    list[idx] = conversation;
  } else {
    list.unshift(conversation);
  }
  await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(list));
}

export async function deleteConversation(id: string): Promise<void> {
  const list = await getConversations();
  await AsyncStorage.setItem(KEYS.conversations, JSON.stringify(list.filter((c) => c.id !== id)));
}

// ユーザーが一度も発言していない会話（開いてすぐ閉じたもの）は記録に残さない
export function hasUserMessage(c: Conversation): boolean {
  return c.messages.some((m) => m.role === 'user');
}

// --- 気分の記録 ---------------------------------------------------------

export async function getMoodEntries(): Promise<MoodEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.moods);
  const list = raw ? (JSON.parse(raw) as MoodEntry[]) : [];
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addMoodEntry(entry: Omit<MoodEntry, 'id' | 'createdAt'>): Promise<MoodEntry> {
  const list = await getMoodEntries();
  const next: MoodEntry = { ...entry, id: genId(), createdAt: new Date().toISOString() };
  list.unshift(next);
  await AsyncStorage.setItem(KEYS.moods, JSON.stringify(list));
  return next;
}

// --- 全削除 -------------------------------------------------------------

export async function deleteAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.profile, KEYS.conversations, KEYS.moods, KEYS.usage]);
}

// --- 利用回数（無料プランの上限管理） -------------------------------------

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function getUsage(): Promise<UsageState> {
  const raw = await AsyncStorage.getItem(KEYS.usage);
  const monthKey = currentMonthKey();
  if (!raw) return { monthKey, messageCount: 0 };
  const parsed = JSON.parse(raw) as UsageState;
  if (parsed.monthKey !== monthKey) return { monthKey, messageCount: 0 };
  return parsed;
}

export async function incrementUsage(): Promise<UsageState> {
  const usage = await getUsage();
  const next = { ...usage, messageCount: usage.messageCount + 1 };
  await AsyncStorage.setItem(KEYS.usage, JSON.stringify(next));
  return next;
}

// --- ユーティリティ -----------------------------------------------------

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function dayKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (dayKey(d) === dayKey(now)) return `今日 ${time}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(y)) return `昨日 ${time}`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
