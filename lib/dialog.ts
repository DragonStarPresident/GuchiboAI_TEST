import { Alert, Platform } from 'react-native';

// react-native-web の Alert.alert は完全な no-op（何も表示しない）実装になっている。
// https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/Alert/index.js
// そのため、Webでは window.alert / window.confirm にフォールバックする小さなラッパー。
// ネイティブ(iOS/Android)では通常通り Alert.alert を使う。

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export function showAlert(title: string, message?: string, buttons?: DialogButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as any);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(text);
    return;
  }

  if (buttons.length === 1) {
    window.alert(text);
    buttons[0].onPress?.();
    return;
  }

  // 2つ以上のボタン: 確定側（destructive優先、なければ最後のボタン）と
  // キャンセル側をwindow.confirmのOK/キャンセルに割り当てる
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const confirmButton = buttons.find((b) => b.style === 'destructive') ?? buttons[buttons.length - 1];

  const confirmed = window.confirm(text);
  if (confirmed) {
    confirmButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
