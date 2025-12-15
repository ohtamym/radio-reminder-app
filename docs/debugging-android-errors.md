# Android エラーデバッグガイド

## エラーの詳細を取得する方法

### 1. ErrorBoundaryでエラー詳細を表示

アプリ内でエラーが発生した場合、ErrorBoundaryがエラーをキャッチし、画面に表示します。

**使い方:**

1. エラーが発生すると、エラー画面が表示されます
2. 「詳細を表示」ボタンをタップすると、エラーの詳細情報が表示されます
3. スタックトレースやコンポーネントスタックを確認できます

### 2. Android Logcatを使用する（推奨）

Android Logcatは、Androidデバイスやエミュレーターのログをリアルタイムで確認できるツールです。

#### 必要なもの

- Android SDK Platform Tools（`adb`コマンド）
- USBデバッグが有効なAndroidデバイス、またはAndroidエミュレーター

#### セットアップ手順

1. **Android SDK Platform Toolsのインストール**
   - Android Studioをインストールしている場合、既に含まれています
   - パス: `%LOCALAPPDATA%\Android\Sdk\platform-tools\`
   - または、[Android Platform Tools](https://developer.android.com/studio/releases/platform-tools)を直接ダウンロード

2. **USBデバッグを有効にする**
   - Androidデバイスの「設定」→「開発者向けオプション」→「USBデバッグ」をONにする

3. **デバイスを接続**
   - USBケーブルでPCとAndroidデバイスを接続
   - または、Androidエミュレーターを起動

#### Logcatの使い方

**基本的なコマンド:**

```bash
# すべてのログを表示
adb logcat

# React Native関連のログのみを表示
adb logcat | grep -i "ReactNative\|ReactNativeJS\|Expo"

# エラーログのみを表示
adb logcat *:E

# 特定のアプリのログのみを表示（パッケージ名を指定）
adb logcat | grep "host.exp.exponent"

# ログをファイルに保存
adb logcat > logcat_output.txt

# ログをクリアしてから新しいログを表示
adb logcat -c && adb logcat
```

**Expo Goアプリの場合:**

```bash
# Expo Goアプリのログを表示
adb logcat | grep -i "expo\|reactnative"

# エラーと警告のみ
adb logcat *:E *:W | grep -i "expo\|reactnative"
```

**便利なフィルター:**

```bash
# エラー、警告、情報レベルのログを表示
adb logcat *:E *:W *:I

# 特定のタグでフィルター（例: ReactNativeJS）
adb logcat -s ReactNativeJS:V ReactNative:V

# タイムスタンプ付きで表示
adb logcat -v time

# 色付きで表示（Windowsでは対応していない場合あり）
adb logcat -v color
```

#### よく使うコマンドの組み合わせ

```bash
# React Nativeのエラーと警告をタイムスタンプ付きで表示
adb logcat -v time *:E *:W | grep -i "reactnative\|expo"

# ログをファイルに保存しながら画面にも表示
adb logcat -v time | tee logcat_output.txt
```

### 3. Expo Dev Toolsのログを確認

Expo Dev Toolsのブラウザ画面でもログを確認できます。

1. `npm start`を実行すると、ブラウザでExpo Dev Toolsが開きます
2. 左側のメニューから「Logs」を選択
3. アプリのログがリアルタイムで表示されます

### 4. React Native LogBoxを有効にする

開発環境では、React NativeのLogBoxが自動的に有効になっています。
エラーが発生すると、画面に赤いエラーオーバーレイが表示されます。

**LogBoxを手動で有効にする場合:**

```typescript
// App.tsx の先頭に追加
import { LogBox } from 'react-native';

// 特定の警告を無視する場合
LogBox.ignoreLogs(['Warning: ...']);

// LogBoxを有効にする（デフォルトで有効）
LogBox.ignoreAllLogs(false);
```

### 5. エラーの種類別の対処法

#### `java.lang.String cannot be cast to java.lang.Boolean`

このエラーは、Androidのネイティブモジュールで型の不一致が発生していることを示します。

**確認すべきポイント:**

1. `app.json`の設定値が正しい型か確認
2. `react-native-screens`や`react-navigation`のバージョン互換性
3. Expo SDKのバージョンと依存関係の互換性

**対処法:**

- `@react-navigation/stack`を`@react-navigation/native-stack`に変更（既に実施済み）
- Expo SDKと依存関係のバージョンを確認
- `npx expo install --fix`を実行して依存関係を修正

### 6. デバッグのベストプラクティス

1. **エラーが発生したら、まずErrorBoundaryの詳細を確認**
2. **Logcatでエラーの完全なスタックトレースを確認**
3. **エラーメッセージのキーワードで検索**（GitHub Issues、Stack Overflowなど）
4. **依存関係のバージョンを確認**（`package.json`）
5. **Expo SDKのバージョンと互換性を確認**

### 7. よくあるエラーパターン

#### ネイティブモジュールのエラー

- **症状**: `java.lang.*`で始まるエラー
- **原因**: ネイティブモジュールの設定や互換性の問題
- **対処**: モジュールのバージョンを確認し、互換性のあるバージョンに更新

#### JavaScriptエラー

- **症状**: `Error: ...`で始まるエラー
- **原因**: JavaScriptコードの問題
- **対処**: ErrorBoundaryの詳細を確認し、スタックトレースから原因を特定

#### ネットワークエラー

- **症状**: `Network request failed`
- **原因**: ネットワーク接続の問題
- **対処**: デバイスのネットワーク設定を確認

## トラブルシューティング

### Logcatが接続を認識しない場合

```bash
# デバイス一覧を確認
adb devices

# デバイスが表示されない場合
# 1. USBデバッグが有効か確認
# 2. USBケーブルを確認
# 3. デバイスのドライバーをインストール
```

### ログが多すぎる場合

```bash
# 特定のアプリのログのみを表示
adb logcat | grep "host.exp.exponent"

# または、PIDでフィルター
adb logcat --pid=$(adb shell pidof -s host.exp.exponent)
```

## 参考リンク

- [Android Logcat公式ドキュメント](https://developer.android.com/studio/command-line/logcat)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Expo Debugging](https://docs.expo.dev/workflow/debugging/)
