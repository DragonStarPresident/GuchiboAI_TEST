# 開発者向けドキュメント

`guchibo-app` の技術的な背景、開発の経緯、既知の問題、今後の実装課題をまとめたものです。プロダクト仕様（何ができるか）は `docs/SPEC.md`、セットアップ・テスト手順は `README.md` を参照してください。

## 1. 技術スタック

- **Expo (React Native) + Expo Router**：1つのコードベースでWeb / iOS / Androidに対応。`npm run web` でブラウザからすぐ動作確認できる構成を優先しました。
- **react-native-web**：Web向けレンダリング層。
- **Expo Router API Routes**（`app/api/chat+api.ts`）：Anthropic APIキーをサーバーサイドのみで保持するために採用。`app.json` の `web.output` を `server` にすることで有効化しています。
- **@react-native-async-storage/async-storage**：会話・気分・プロフィールのローカル保存。
- **@anthropic-ai/sdk**：Claude API呼び出し。

## 2. フォルダ構成

```
app/            画面（Expo Routerのファイルベースルーティング）
  (tabs)/       ホーム・きろく・設定の3タブ
  api/          サーバーサイドAPI Route（chat+api.ts）
  history/[id]  会話詳細（動的ルート）
components/     共通UIコンポーネント（Card, PrimaryButton, ChatBubble）
lib/            ロジック層（theme, storage, systemPrompt, crisis, dialog）
docs/           このドキュメント群
```

## 3. 開発の経緯（要約）

1. Googleドライブから取得した資料（リサーチ・要件定義V1/V2・UIデザインPDF・システムプロンプト等）を確認し、プロダクト方針を以下の3点ですり合わせました。
   - AI設計：感情受容型（V2ベース。CBT的な指摘は行わない）
   - ターゲット：子育て中の母親＋20代新社会人の両方
   - 技術：React Native（Expo）でWebから開発・検証しやすい構成
2. `開発/デザイン/Guchibo-UI Design1.pdf`（12ページのiOSモックアップ）を実際にレンダリングして配色・コピー・画面構成を抽出し、デザインシステム（`lib/theme.ts`）と各画面を実装。
3. `開発/システムプロンプト.docx` をベースに、ターゲット拡大に合わせてシステムプロンプトを一般化（`lib/systemPrompt.ts`）。
4. モックアップの5タブ構成（ホーム/きろく/はなす/きもち/設定）は、MVPとして3タブ（ホーム/きろく/設定、気分入力はホームに統合、チャットはホームからの遷移先）に簡略化。
5. GitHubリポジトリへpush（`.git` はプロジェクトディレクトリ配下のみに閉じ、個人用の `CLAUDE.md` は含めていません）。
6. 実機テストで発見した不具合を修正（詳細は次項）。

## 4. 既知の問題と対応

### react-native-web の `Alert.alert` が no-op

`react-native-web` の `Alert` 実装は `static alert() {}` のみで、Web上では**何も表示されません**。当初 `Alert.alert` を直接使っていた確認ダイアログ（データ削除、サブスク登録完了、Apple/Googleログイン未対応の案内など）が、Web版でボタンを押しても無反応に見える不具合がありました。

**対応**：`lib/dialog.ts` に `showAlert()` を実装し、Web上では `window.alert` / `window.confirm` にフォールバックするようにしました。**今後、確認ダイアログを追加する際は `Alert.alert` を直接使わず、必ず `showAlert` を使ってください。**

## 5. 環境変数（`.env`）

| 変数 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude APIキー。サーバー側（API Route）でのみ使用され、クライアントバンドルには含まれません。 |
| `ANTHROPIC_MODEL` | 任意 | 使用モデル。省略時は `claude-sonnet-5`。コスト重視なら `claude-haiku-4-5` に変更可。 |
| `EXPO_PUBLIC_CRISIS_TEST_MODE` | 任意（開発時は推奨: `true`） | 危機介入画面の電話番号をダミーに切り替える開発者向けフラグ。**クライアントに埋め込まれる値（`EXPO_PUBLIC_` prefix）のため、本番ビルドでは必ず未設定または `false` にすること。** |

## 6. テスト方法

基本的なテスト手順（起動〜チャット〜危機介入〜きろく〜設定〜サブスクの一通りの確認項目）は `README.md` の「テスト手順」セクションにまとめてあります。実装を変更した際は、そのチェックリストで一通り再確認してください。

## 7. 今後の実装課題（TODOバックログ）

優先度が高いと思われる順の目安です。着手前にチーム内で優先順位を確認してください。

1. **決済連携**：Stripe または RevenueCat と接続し、サブスク画面のUIを実際の課金導線にする。
2. **認証**：Apple / Google の実OAuth連携。
3. **バックエンド／データ同期**：会話・気分ログをサーバー（DB）に保存し、複数端末での同期・退会時のデータ削除フローを整備する。
4. **危機検出の精度向上**：単純なキーワード一致から、表現の揺れに強い検出（軽量な分類モデル等）への移行を検討。専門家によるレビューも推奨。
5. **通知機能**：継続利用を促すリマインド通知（要件定義V2の「翌日通知」フロー）。
6. **法令・表示まわりの最終確認**：薬機法・景表法・要配慮個人情報の取り扱いなど、`リサーチ/マネタイズ.docx` に挙げられている留意事項を、実際のリリース内容に照らして再確認する。
7. **ネイティブアプリのビルド確認**：現状はWebでの動作確認が中心なので、`expo run:ios` / `expo run:android` での実機・シミュレータ確認を行う。
