# Guchibo（グチボ）

孤独に、会話という居場所を。

子育て中の母親向けAI対話アプリ。Expo SDK 57（React Native 0.86）＋ Expo Router ＋ TypeScript。

## フォルダ構成

```
src/app/         画面（Expo Routerのファイルベースルーティング）
src/components/  共通UI（Card, PrimaryButton, ChatBubble）
src/lib/         ロジック（theme, storage, crisis, dialog, api, systemPrompt）
assets/          アイコン・スプラッシュ画像
eas.json         EASビルド設定（development / preview / production）
```

## 実機・シミュレータで動かす

前提: Xcode 26.4以上（Xcode 27ではiOS 27のシミュレータも必要）、Xcode → Settings → Accounts にApple IDを登録済み、iPhoneのデベロッパモードがオン。

1. 依存パッケージを入れる: `npm install`
2. iPhoneをケーブルでMacにつなぎ、`npx expo run:ios --device` を実行して一覧からiPhoneを選ぶ（シミュレータの場合はiOS 27の機種を選ぶ）
3. 2回目以降、ネイティブ部分に変更がなければ `npx expo start` で開発サーバーだけ起動し、インストール済みのGuchiboを開く（MacとiPhoneは同じWi-Fi）

ネイティブモジュールを追加したときや app.json のプラグイン設定を変えたときは、`rm -rf ios` してから2をやり直す。

## TestFlightで配布する

`npx eas-cli@latest build --profile beta --platform ios --auto-submit`

beta プロファイルは危機介入画面の電話番号がダミーになる。公開用は production プロファイルを使う。

## 環境変数（.env）

| 変数 | 説明 |
|---|---|
| `EXPO_PUBLIC_CHAT_API_URL` | チャットAPIのURL。段階2でFirebase Cloud Functionsに接続するまでは空 |
| `EXPO_PUBLIC_CRISIS_TEST_MODE` | `true` で危機介入画面の電話番号をダミーにする。本番ビルドでは必ず `false` |

`.env.legacy` は旧試作版の環境変数（Anthropic APIキーを含む）。段階2でFirebaseのシークレットに移した後に削除する。

## 開発上の注意

- パッケージ追加は `npx expo install <package>` を使う（SDK対応バージョンが入る）
- 確認ダイアログは `Alert.alert` ではなく `src/lib/dialog.ts` の `showAlert` を使う（Webでも動くようにするため）
- 型チェック: `npm run typecheck`
