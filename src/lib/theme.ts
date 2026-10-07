// Guchibo デザインシステム
// 参照: 資料/デザイン/Guchibo-UI Design1.pdf（紫〜ラベンダー、パステルの気分色、角丸カードUI）

export const colors = {
  // ベース
  background: '#F5F2FC',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEAFB',
  border: '#E6E0F5',

  // ブランド（紫）
  primary: '#6E56F0',
  primaryDark: '#5A43D6',
  primaryLight: '#8C78F5',
  gradient: ['#7A62F4', '#9A86F7'] as const,
  gradientSoft: ['#EEE8FC', '#F8EEF6'] as const,

  // アクセント
  accentPink: '#F2A3BF',
  accentCoral: '#F08FA6',

  // テキスト
  text: '#221C3A',
  textSecondary: '#6B6582',
  textMuted: '#A19BB4',
  textOnPrimary: '#FFFFFF',

  // 気分カラー
  moodCalm: '#8CCBAA', // おだやか
  moodNormal: '#B9AEEB', // ふつう
  moodMoya: '#F2BE63', // もやもや
  moodHard: '#EE9AB4', // つらい

  // ステータス
  danger: '#E1596B',
  dangerSoft: '#FBE7EA',
  success: '#4FB386',
  warningSoft: '#FFF4CC',
  warningText: '#7A5B00',
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadow = {
  card: {
    shadowColor: '#3A2E6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
};

// level: しんどさの度合い（グラフの高さに使う）
export const moodOptions = [
  { key: 'calm', label: 'おだやか', emoji: '😌', color: colors.moodCalm, level: 1 },
  { key: 'normal', label: 'ふつう', emoji: '🙂', color: colors.moodNormal, level: 2 },
  { key: 'moya', label: 'もやもや', emoji: '😕', color: colors.moodMoya, level: 3 },
  { key: 'hard', label: 'つらい', emoji: '😢', color: colors.moodHard, level: 4 },
] as const;

export type MoodKey = (typeof moodOptions)[number]['key'];

export function moodMeta(key: string | null | undefined) {
  return moodOptions.find((m) => m.key === key);
}

export const moodTriggers = [
  '寝不足',
  'こどものこと',
  'パートナー',
  '仕事',
  '自分の時間がない',
  '理由はわからない',
];
