// 危機介入まわりの定義
// 参照: 開発/API test システムプロンプト.docx / システムプロンプト.docx
// 「危機対応ルール」に列挙されたキーワードをそのまま踏襲。

export const CRISIS_KEYWORDS = [
  '死にたい',
  '消えたい',
  '自殺したい',
  '自殺',
  '生きるのがつらい',
  'もう限界',
  '子どもを傷つけそう',
  '誰かを殺したい',
  '自分を傷つけたい',
  'ODした',
  'オーバードーズ',
  'リスカ',
  '虐待してしまいそう',
] as const;

export function containsCrisisKeyword(text: string): boolean {
  return CRISIS_KEYWORDS.some((kw) => text.includes(kw));
}

export interface HotlineInfo {
  name: string;
  number: string;
  hours: string;
  telHref: string;
}

// 参照: 厚生労働省「まもろうよ こころ」電話相談窓口一覧（2026-10-07確認）
// https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel
// 公開前に最新の番号・受付時間を再確認すること。
const REAL_HOTLINES: HotlineInfo[] = [
  {
    name: 'よりそいホットライン',
    number: '0120-279-338',
    hours: '24時間・通話無料',
    telHref: 'tel:0120279338',
  },
  {
    name: '#いのちSOS',
    number: '0120-061-338',
    hours: '24時間・通話無料',
    telHref: 'tel:0120061338',
  },
  {
    name: 'いのちの電話',
    number: '0120-783-556',
    hours: '毎日16〜21時・毎月10日は終日（通話無料）',
    telHref: 'tel:0120783556',
  },
  {
    name: '救急（命の危険を感じたら）',
    number: '119',
    hours: 'すぐにつながります',
    telHref: 'tel:119',
  },
];

// 開発・テスト中に誤って実際の相談窓口や119へ発信してしまわないよう、
// EXPO_PUBLIC_CRISIS_TEST_MODE=true のときはダミー番号に差し替える。
// クライアントに埋め込まれる値なので EXPO_PUBLIC_ プレフィックスが必要。
// 【重要】本番リリース前には必ず false（未設定）に戻すこと。
const DUMMY_HOTLINES: HotlineInfo[] = REAL_HOTLINES.map((h, i) => ({
  name: `（テスト用ダミー）${h.name}`,
  number: `000-0000-000${i + 1}`,
  hours: h.hours,
  telHref: `tel:000000000${i + 1}`,
}));

export const CRISIS_TEST_MODE = process.env.EXPO_PUBLIC_CRISIS_TEST_MODE === 'true';

export const HOTLINES: HotlineInfo[] = CRISIS_TEST_MODE ? DUMMY_HOTLINES : REAL_HOTLINES;
