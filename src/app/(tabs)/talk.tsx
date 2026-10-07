import { Redirect } from 'expo-router';

// 「はなす」タブはボタンとしてチャット画面を開くだけなので、この画面は表示されない
export default function Talk() {
  return <Redirect href="/home" />;
}
