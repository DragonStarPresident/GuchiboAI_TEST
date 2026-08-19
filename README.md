# Guchibo（MVP）

孤独に、会話という居場所を。

子育て中の母親や、社会人になったばかりで悩みを言葉にできず抱え込みやすい人に向けた、
AIメンタルケア対話アプリのMVPです。説教・診断・分析ではなく、否定せず受け止める
「感情受容型」の対話を軸にしています。

このリポジトリは [Expo Router](https://docs.expo.dev/router/introduction/) を
用いた React Native アプリで、`npm run web` でブラウザ上からそのまま動作確認できます。
同じコードベースから iOS / Android アプリも書き出せます。

## セットアップ

```bash
npm install
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定してください（https://console.anthropic.com/）
npm run web
```

チャット機能はサーバーサイドの API Route（`app/api/chat+api.ts`）から
Anthropic Claude API を呼び出します。APIキーはクライアントバンドルに含まれません。

## 画面構成

- 起動 → オンボーディング(3枚) → 登録（ニックネームのみMVP実装、Apple/Googleは未接続）
- ホーム：今日の気分入力（気分・きっかけ・メモ）→ AIチャットへ
- はなす：AIとの対話（危機ワード検出時は自動で危機介入画面へ）
- きろく：過去の会話の一覧・検索・振り返り
- 設定：プロフィール、Plusへの導線、記録の書き出し／削除、緊急の相談窓口、FAQ

## MVPとしての割り切り（今後の課題）

- **認証**：Apple/Google連携は未実装（ボタンのみ）。ニックネームのみのローカル登録。
- **決済**：サブスクリプション画面はUIのみで、Stripe/RevenueCat等の決済連携は未接続。
  「7日間無料ではじめる」はローカルでPlanを切り替えるデモ動作です。
- **データ保存**：会話・気分の記録は端末内（AsyncStorage）のみに保存されます。
  複数端末同期やサーバー保存は未実装です。
- **危機介入**：キーワードベースの簡易検出です。表現の揺れやAIによる誤検知・見逃しの
  可能性があるため、本番投入前に検出精度の検証と、専門家によるレビューを推奨します。
- **法令対応**：薬機法・景表法・要配慮個人情報の取り扱いなど、
  `リサーチ/マネタイズ.docx` に記載の留意事項は本番リリース前に改めて確認が必要です。

## 技術構成

- Expo (React Native + react-native-web) / Expo Router
- ローカルストレージ: `@react-native-async-storage/async-storage`
- AI: `@anthropic-ai/sdk`（デフォルトモデル: `claude-haiku-4-5`）
