// Guchibo デザインシステム
// 参照: 開発/デザイン/Guchibo-UI Design1.pdf（紫〜ラベンダーのグラデーション、
// 医療っぽさを抑えたやわらかいカードUI）

export const colors = {
  // ベース
  background: '#F6F4FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EBFA',
  border: '#E7E1F5',

  // ブランド（紫〜インディゴのグラデーション）
  primary: '#6C5DD3',
  primaryDark: '#584AC2',
  primaryLight: '#8B7FE8',
  gradient: ['#7C6FE0', '#9B8FEF'] as const,
  gradientSoft: ['#EFEAFB', '#F8F0F5'] as const,

  // アクセント
  accentPink: '#F0A6C0',
  accentCoral: '#EC8F7A',

  // テキスト
  text: '#241F38',
  textSecondary: '#6B6580',
  textMuted: '#9C97AE',
  textOnPrimary: '#FFFFFF',

  // 気分カラー（きろく・気分入力で使用）
  moodCalm: '#8FBF9F',      // おだやか
  moodNormal: '#B7AEDE',    // ふつう
  moodMoya: '#F0B95E',      // もやもや
  moodHard: '#EC8FA0',      // つらい

  // ステータス
  danger: '#E1596B',
  dangerSoft: '#FBE7EA',
  success: '#5FA57C',
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
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
};

export const moodOptions = [
  { key: 'calm', label: 'おだやか', emoji: '🙂', color: colors.moodCalm },
  { key: 'normal', label: 'ふつう', emoji: '😐', color: colors.moodNormal },
  { key: 'moya', label: 'もやもや', emoji: '😕', color: colors.moodMoya },
  { key: 'hard', label: 'つらい', emoji: '😢', color: colors.moodHard },
] as const;

export type MoodKey = (typeof moodOptions)[number]['key'];

export const moodTriggers = [
  '寝不足',
  'こどものこと',
  'パートナー',
  '仕事',
  '自分の時間がない',
  '理由はわからない',
];
