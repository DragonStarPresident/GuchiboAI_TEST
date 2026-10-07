import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodKey } from './theme';

// --- 型定義 -----------------------------------------------------------

export type Plan = 'free' | 'plus';

export interface Profile {
  nickname: string;
  plan: Plan;
  createdAt: string;
  onboarded: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isCrisis?: boolean;
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

export interface UsageState {
  monthKey: string; // "2026-08"
  messageCount: number;
}

const KEYS = {
  profile: 'guchibo:profile',
  conversations: 'guchibo:conversations',
  usage: 'guchibo:usage',
} as const;

// 無料プランの月あたりメッセージ上限（要件定義V2を踏襲）
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
  const current = (await getProfile()) ?? {
    nickname: 'ゲスト',
    plan: 'free',
    createdAt: new Date().toISOString(),
    onboarded: false,
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

export async function deleteAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.profile, KEYS.conversations, KEYS.usage]);
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

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
