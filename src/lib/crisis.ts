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

// 参照: リサーチ/マネタイズ.docx「Appendix：緊急時リソース一覧」
const REAL_HOTLINES: HotlineInfo[] = [
  {
    name: 'よりそいホットライン',
    number: '0120-279-338',
    hours: '24時間・通話無料',
    telHref: 'tel:0120279338',
  },
  {
    name: 'いのちの電話',
    number: '0570-783-556',
    hours: '毎日16〜21時（毎月10日は8時〜翌8時）',
    telHref: 'tel:0570783556',
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
const DUMMY_HOTLINES: HotlineInfo[] = [
  {
    name: '（テスト用ダミー）よりそいホットライン',
    number: '000-0000-0001',
    hours: '24時間・通話無料',
    telHref: 'tel:0000000001',
  },
  {
    name: '（テスト用ダミー）いのちの電話',
    number: '000-0000-0002',
    hours: '毎日16〜21時（毎月10日は8時〜翌8時）',
    telHref: 'tel:0000000002',
  },
  {
    name: '（テスト用ダミー・119ではありません）救急',
    number: '000-0000-0119',
    hours: 'すぐにつながります',
    telHref: 'tel:0000000119',
  },
];

export const CRISIS_TEST_MODE = process.env.EXPO_PUBLIC_CRISIS_TEST_MODE === 'true';

export const HOTLINES: HotlineInfo[] = CRISIS_TEST_MODE ? DUMMY_HOTLINES : REAL_HOTLINES;
